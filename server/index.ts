import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
      model: "claude-opus-4-8",
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
