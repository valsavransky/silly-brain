import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env if present (local dev; Railway injects real env vars instead)
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // no .env file — fine
}
const DIST_DIR = path.resolve(__dirname, "../dist");
const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(express.json({ limit: "64kb" }));

// ---------------------------------------------------------------------------
// Simple in-memory per-IP rate limit: 20 requests / minute for the AI endpoint
// ---------------------------------------------------------------------------
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear(); // crude memory guard
  return recent.length > RATE_LIMIT;
}

// ---------------------------------------------------------------------------
// AI 20 Questions
// ---------------------------------------------------------------------------
const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are the friendly guessing genie in "MindSprout 20 Questions", a game for children ages 6-12. The child is thinking of an item, animal, food, or everyday concept. Your job is to guess it by asking smart yes/no questions — at most 20.

Rules:
- Ask exactly ONE question at a time. Questions must be answerable with "yes", "no", or "sort of".
- Use simple, cheerful language a 7-year-old understands. Keep questions under 15 words.
- Think like a detective: split the world of possibilities roughly in half with each question (alive vs not alive, bigger vs smaller than a backpack, found at home vs outside...).
- When you are fairly confident, make a guess. A guess counts as one of your 20 questions.
- If you reach question 20 you MUST make your final best guess.
- Keep everything wholesome and age-appropriate. Only ever guess kid-friendly things. Never ask about or guess anything scary, violent, or grown-up.
- Never ask the child for personal information (name, age, school, where they live).`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    question: {
      type: "string",
      description:
        "The single yes/no question to ask the child, OR the guess phrased as a question like 'Is it... a giraffe?!'",
    },
    isGuess: {
      type: "boolean",
      description: "True when this turn is a guess at the answer rather than a narrowing question.",
    },
    guess: {
      type: ["string", "null"],
      description: "The thing being guessed (e.g. 'a giraffe') when isGuess is true, otherwise null.",
    },
  },
  required: ["question", "isGuess", "guess"],
  additionalProperties: false,
} as const;

interface HistoryEntry {
  question: string;
  answer: string; // "yes" | "no" | "sort of" | "no, that's not it" | "yes, you got it!"
}

app.post("/api/twenty-questions", async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ error: "Whoa, slow down a little! Try again in a minute." });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "The guessing genie is asleep (AI is not configured on this server)." });
    return;
  }

  const history: HistoryEntry[] = Array.isArray(req.body?.history) ? req.body.history : [];
  if (history.length > 25) {
    res.status(400).json({ error: "Game is over — start a new one!" });
    return;
  }
  const valid = history.every(
    (h) =>
      typeof h?.question === "string" &&
      h.question.length < 500 &&
      typeof h?.answer === "string" &&
      h.answer.length < 100,
  );
  if (!valid) {
    res.status(400).json({ error: "Invalid game history." });
    return;
  }

  const questionsAsked = history.length;
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "I'm thinking of something! It's an animal, food, item, or everyday thing. Ask your first question.",
    },
  ];
  for (const entry of history) {
    messages.push({ role: "assistant", content: entry.question });
    messages.push({
      role: "user",
      content: `${entry.answer}. (You have used ${questionsAsked} of 20 questions so far.)`,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      res.status(502).json({ error: "The genie mumbled something we couldn't hear. Try again!" });
      return;
    }
    const parsed = JSON.parse(text.text) as {
      question: string;
      isGuess: boolean;
      guess: string | null;
    };
    res.json({ ...parsed, questionNumber: questionsAsked + 1 });
  } catch (err) {
    console.error("twenty-questions error:", err);
    res.status(502).json({ error: "The genie got distracted! Please try again." });
  }
});

// ---------------------------------------------------------------------------
// Reverse 20 Questions: the genie holds the secret, the child asks questions.
// Secrets stay server-side in short-lived in-memory sessions (nothing personal
// is stored — just a game id and a word like "penguin").
// ---------------------------------------------------------------------------
const SECRETS = [
  "a dog", "a cat", "an elephant", "a giraffe", "a penguin", "a butterfly",
  "a dolphin", "an octopus", "a turtle", "a ladybug", "a horse", "a bunny",
  "a banana", "a pizza", "an ice cream cone", "an apple", "a carrot",
  "a cookie", "a watermelon", "a sandwich", "popcorn",
  "a toothbrush", "an umbrella", "a bicycle", "a soccer ball", "a teddy bear",
  "a school bus", "a fire truck", "a guitar", "a drum", "a kite", "a balloon",
  "a robot", "a crayon", "a backpack", "a snowman", "a sandcastle",
  "the moon", "a rainbow", "a cloud", "a sunflower", "a train",
];

const STARTER_QUESTIONS = [
  "Is it alive?",
  "Is it an animal?",
  "Can you eat it?",
  "Is it bigger than a backpack?",
  "Would you find it inside a house?",
  "Can you hold it in one hand?",
];

interface ReverseGame {
  secret: string;
  createdAt: number;
}
const reverseGames = new Map<string, ReverseGame>();
const REVERSE_TTL_MS = 2 * 60 * 60 * 1000;

function cleanupReverseGames() {
  const now = Date.now();
  for (const [id, game] of reverseGames) {
    if (now - game.createdAt > REVERSE_TTL_MS) reverseGames.delete(id);
  }
  if (reverseGames.size > 5000) reverseGames.clear();
}

const REVERSE_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      enum: ["yes", "no", "sort of", "ask me something else"],
      description:
        "Truthful answer about the secret. Use 'ask me something else' only when the child's message is off-topic, inappropriate, or not answerable with yes/no.",
    },
    isCorrectGuess: {
      type: "boolean",
      description: "True when the child's message names the secret or clearly means it.",
    },
    reply: {
      type: "string",
      description:
        "One short cheerful sentence (under 15 words) delivering the answer with personality. Never reveal the secret unless isCorrectGuess is true.",
    },
    suggestedQuestions: {
      type: "array",
      items: { type: "string" },
      description:
        "Exactly 6 NEW short yes/no questions the child could ask next — smart detective questions that build on everything answered so far. Never repeat an earlier question. If things are narrowed down, make one of them a specific guess like 'Is it a penguin?'.",
    },
  },
  required: ["answer", "isCorrectGuess", "reply", "suggestedQuestions"],
  additionalProperties: false,
} as const;

function reverseSystemPrompt(secret: string): string {
  return `You are the playful "Guessing Genie" in MindSprout 20 Questions, a game for children ages 6-12. This time the roles are flipped: YOU are hiding a secret and the child is the detective asking yes/no questions.

The secret is: ${secret}.

Rules:
- Answer every question truthfully about the secret with "yes", "no", or "sort of".
- If the child's message names the secret (or clearly means it — like "puppy" for a dog), set isCorrectGuess to true and celebrate big in your reply.
- Your reply is ONE short, cheerful sentence a 7-year-old understands. Add fun flair, but NEVER reveal or hint at the secret's name unless isCorrectGuess is true.
- If the message is not a yes/no question about the secret, or is inappropriate, set answer to "ask me something else" and gently steer back to the game.
- suggestedQuestions: exactly 6 new, simple yes/no questions that would help the child narrow it down, based on everything answered so far. Never repeat questions already asked. When the child is close, include one specific guess.
- Keep everything wholesome. Never ask for personal information.`;
}

app.post("/api/twenty-questions/reverse/start", (req, res) => {
  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ error: "Whoa, slow down a little! Try again in a minute." });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "The guessing genie is asleep (AI is not configured on this server)." });
    return;
  }
  cleanupReverseGames();
  const gameId = crypto.randomUUID();
  const secret = SECRETS[Math.floor(Math.random() * SECRETS.length)];
  reverseGames.set(gameId, { secret, createdAt: Date.now() });
  res.json({ gameId, suggestedQuestions: STARTER_QUESTIONS });
});

app.post("/api/twenty-questions/reverse/ask", async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ error: "Whoa, slow down a little! Try again in a minute." });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "The guessing genie is asleep (AI is not configured on this server)." });
    return;
  }

  const { gameId, question } = req.body ?? {};
  const history: { question: string; reply: string }[] = Array.isArray(req.body?.history)
    ? req.body.history
    : [];
  if (
    typeof gameId !== "string" ||
    typeof question !== "string" ||
    question.trim().length === 0 ||
    question.length > 200 ||
    history.length > 25 ||
    !history.every(
      (h) =>
        typeof h?.question === "string" &&
        h.question.length < 500 &&
        typeof h?.reply === "string" &&
        h.reply.length < 500,
    )
  ) {
    res.status(400).json({ error: "Invalid game move." });
    return;
  }

  const game = reverseGames.get(gameId);
  if (!game) {
    res.status(404).json({ error: "That game has ended — start a new one!" });
    return;
  }

  const messages: Anthropic.MessageParam[] = [];
  for (const entry of history) {
    messages.push({ role: "user", content: entry.question });
    messages.push({ role: "assistant", content: entry.reply });
  }
  messages.push({
    role: "user",
    content: `${question.trim()}\n(The child has used ${history.length} of 20 questions so far.)`,
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: REVERSE_SCHEMA },
      },
      system: reverseSystemPrompt(game.secret),
      messages,
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      res.status(502).json({ error: "The genie mumbled something we couldn't hear. Try again!" });
      return;
    }
    const parsed = JSON.parse(text.text) as {
      answer: string;
      isCorrectGuess: boolean;
      reply: string;
      suggestedQuestions: string[];
    };

    // Off-topic redirects don't count against the 20 questions
    const counted = parsed.answer !== "ask me something else";
    const questionNumber = history.length + (counted ? 1 : 0);
    const lost = counted && !parsed.isCorrectGuess && questionNumber >= 20;

    if (parsed.isCorrectGuess || lost) reverseGames.delete(gameId);

    res.json({
      ...parsed,
      suggestedQuestions: (parsed.suggestedQuestions ?? []).slice(0, 6),
      counted,
      questionNumber,
      ...(lost ? { revealedSecret: game.secret } : {}),
    });
  } catch (err) {
    console.error("reverse twenty-questions error:", err);
    res.status(502).json({ error: "The genie got distracted! Please try again." });
  }
});

// ---------------------------------------------------------------------------
// Static SPA (production build)
// ---------------------------------------------------------------------------
app.use(express.static(DIST_DIR));
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
    if (err) res.status(404).send("Run `npm run build` first — no client build found.");
  });
});

app.listen(PORT, () => {
  console.log(`MindSprout server listening on http://localhost:${PORT}`);
});
