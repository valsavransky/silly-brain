import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPop, playFanfare, playSparkle, playWrong } from "../../lib/sounds";
import { celebrate } from "../../lib/celebrate";
import AnswerBtn from "./AnswerBtn";

interface HistoryEntry {
  question: string;
  reply: string;
}

interface GenieAnswer {
  answer: string;
  isCorrectGuess: boolean;
  reply: string;
  suggestedQuestions: string[];
  counted: boolean;
  questionNumber: number;
  revealedSecret?: string;
}

type Phase = "start" | "loading" | "playing" | "thinking" | "won" | "lost" | "error";

const MAX_QUESTIONS = 20;

/** Reverse mode: the genie hides a secret, the child asks the questions. */
export default function ReverseMode() {
  const [phase, setPhase] = useState<Phase>("start");
  const [gameId, setGameId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [history, phase, pendingQuestion, redirect]);

  const start = async () => {
    playPop();
    setPhase("loading");
    setHistory([]);
    setTyped("");
    setRedirect(null);
    setSecret(null);
    try {
      const res = await fetch("/api/twenty-questions/reverse/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setGameId(data.gameId);
      setSuggestions(data.suggestedQuestions ?? []);
      setPhase("playing");
      playSparkle();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "The genie got distracted!");
      setPhase("error");
    }
  };

  const ask = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || !gameId || phase !== "playing") return;
    playPop();
    setTyped("");
    setRedirect(null);
    setPendingQuestion(question);
    setPhase("thinking");
    try {
      const res = await fetch("/api/twenty-questions/reverse/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, question, history }),
      });
      const data: GenieAnswer & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");

      setPendingQuestion(null);
      if (data.counted) {
        setHistory((h) => [...h, { question, reply: data.reply }]);
      } else {
        // Off-topic redirect: show the genie's nudge without burning a question
        setRedirect(data.reply);
      }
      if (data.suggestedQuestions?.length >= 3) setSuggestions(data.suggestedQuestions);

      if (data.isCorrectGuess) {
        setPhase("won");
        playFanfare();
        celebrate();
      } else if (data.revealedSecret) {
        setSecret(data.revealedSecret);
        setPhase("lost");
        playWrong();
      } else {
        setPhase("playing");
        playSparkle();
      }
    } catch (err) {
      setPendingQuestion(null);
      setErrorMsg(err instanceof Error ? err.message : "The genie got distracted!");
      setPhase("error");
    }
  };

  const questionsUsed = history.length;

  if (phase === "start") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-4 border-berry-400/40 p-8 text-center"
      >
        <div className="text-7xl mb-4 animate-bob inline-block">🕵️</div>
        <h2 className="text-2xl font-bold mb-2">The genie is hiding something…</h2>
        <p className="text-slate-500 mb-2">
          It picked a secret <b>animal</b>, <b>food</b>, or <b>everyday thing</b>.
        </p>
        <p className="text-slate-500 mb-6">
          Ask up to {MAX_QUESTIONS} yes-or-no questions — tap a suggestion or type your own.
          Guess it before your questions run out!
        </p>
        <button
          onClick={start}
          className="btn-chunky px-10 py-4 rounded-3xl bg-berry-500 text-white text-xl font-display font-bold shadow-[0_6px_0_0_#7e22ce]"
        >
          🔍 Start detective mode
        </button>
      </motion.div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="bg-white rounded-3xl border-4 border-berry-400/40 p-12 text-center">
        <div className="text-6xl animate-bob inline-block">🧞</div>
        <p className="text-slate-400 mt-3">The genie is picking a secret…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-berry-400/40 overflow-hidden">
      {/* counter */}
      <div className="bg-berry-500 text-white px-5 py-3 flex items-center justify-between">
        <span className="font-display font-bold">🕵️ You vs. the Genie</span>
        <span className="font-display font-bold">
          {phase === "won" || phase === "lost"
            ? `${questionsUsed} question${questionsUsed === 1 ? "" : "s"} used`
            : `Question ${Math.min(questionsUsed + 1, MAX_QUESTIONS)} / ${MAX_QUESTIONS}`}
        </span>
      </div>

      {/* chat log */}
      <div ref={logRef} className="max-h-72 overflow-y-auto p-5 space-y-3">
        {history.length === 0 && phase === "playing" && !redirect && (
          <p className="text-slate-400 text-center italic">
            🧞 “I&apos;ve got my secret! Ask away, detective…”
          </p>
        )}
        {history.map((h, i) => (
          <div key={i}>
            <div className="flex justify-end">
              <p className="bg-splash-500 text-white rounded-2xl rounded-br-sm px-4 py-2">
                {h.question}
              </p>
            </div>
            <div className="flex gap-2 items-start mt-1">
              <span className="text-xl">🧞</span>
              <p className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2">{h.reply}</p>
            </div>
          </div>
        ))}

        <AnimatePresence>
          {phase === "thinking" && pendingQuestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-end">
                <p className="bg-splash-500 text-white rounded-2xl rounded-br-sm px-4 py-2">
                  {pendingQuestion}
                </p>
              </div>
              <div className="flex gap-2 items-center text-slate-400 mt-1">
                <span className="text-xl">🧞</span>
                <span className="italic">hmm…</span>
                <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {redirect && (
          <div className="flex gap-2 items-start">
            <span className="text-xl">🧞</span>
            <p className="bg-sunny-300/60 rounded-2xl rounded-tl-sm px-4 py-2 italic">
              {redirect} <span className="not-italic text-xs text-slate-500">(that one&apos;s free!)</span>
            </p>
          </div>
        )}

        {phase === "won" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold">You cracked the case!</h3>
            <p className="text-slate-500">
              Solved in {questionsUsed} question{questionsUsed === 1 ? "" : "s"}. Super sleuth!
            </p>
          </div>
        )}
        {phase === "lost" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🧞😌</div>
            <h3 className="text-2xl font-bold">The genie kept its secret!</h3>
            <p className="text-slate-500">
              It was <b>{secret}</b>. So close — rematch?
            </p>
          </div>
        )}
        {phase === "error" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">😴</div>
            <p className="text-slate-500">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* input area */}
      <div className="border-t-4 border-slate-100 p-4">
        {(phase === "playing" || phase === "thinking") && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {suggestions.slice(0, 6).map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  disabled={phase === "thinking"}
                  className="btn-chunky min-h-12 px-3 py-2 rounded-2xl bg-berry-500/10 border-2 border-berry-400/50 text-berry-600 font-semibold text-sm hover:bg-berry-500/20 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(typed);
              }}
              className="flex gap-2"
            >
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                maxLength={100}
                disabled={phase === "thinking"}
                placeholder="…or type your own yes/no question"
                className="flex-1 min-h-12 px-4 rounded-2xl border-4 border-slate-200 focus:border-berry-400 focus:outline-none disabled:opacity-50"
                aria-label="Type a yes or no question"
              />
              <AnswerBtn
                label="Ask!"
                onClick={() => ask(typed)}
                disabled={phase === "thinking" || typed.trim().length === 0}
                className="bg-berry-500 shadow-[0_4px_0_0_#7e22ce]"
              />
            </form>
          </>
        )}
        {(phase === "won" || phase === "lost" || phase === "error") && (
          <AnswerBtn
            label="🔄 Play again"
            onClick={start}
            className="w-full bg-berry-500 shadow-[0_4px_0_0_#7e22ce]"
          />
        )}
      </div>
    </div>
  );
}
