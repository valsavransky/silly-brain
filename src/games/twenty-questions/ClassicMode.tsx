import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPop, playFanfare, playSparkle } from "../../lib/sounds";
import { celebrate } from "../../lib/celebrate";
import AnswerBtn from "./AnswerBtn";

interface HistoryEntry {
  question: string;
  answer: string;
}

interface GenieTurn {
  question: string;
  isGuess: boolean;
  guess: string | null;
  questionNumber: number;
}

type Phase = "start" | "thinking" | "asking" | "genieWins" | "playerWins" | "error";

const MAX_QUESTIONS = 20;

/** Classic mode: the child thinks of something, the genie asks the questions. */
export default function ClassicMode() {
  const [phase, setPhase] = useState<Phase>("start");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [turn, setTurn] = useState<GenieTurn | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [history, turn, phase]);

  const askGenie = async (nextHistory: HistoryEntry[]) => {
    setPhase("thinking");
    try {
      const res = await fetch("/api/twenty-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setTurn(data as GenieTurn);
      setPhase("asking");
      playSparkle();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "The genie got distracted!");
      setPhase("error");
    }
  };

  const start = () => {
    playPop();
    setHistory([]);
    setTurn(null);
    askGenie([]);
  };

  const respond = (answer: string) => {
    if (!turn) return;
    playPop();
    const entry: HistoryEntry = { question: turn.question, answer };
    const nextHistory = [...history, entry];
    setHistory(nextHistory);

    if (turn.isGuess && answer === "yes, you got it!") {
      setPhase("genieWins");
      playFanfare();
      celebrate();
      return;
    }
    if (nextHistory.length >= MAX_QUESTIONS) {
      setPhase("playerWins");
      playFanfare();
      celebrate();
      return;
    }
    setTurn(null);
    askGenie(nextHistory);
  };

  const questionsUsed = history.length;

  if (phase === "start") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-4 border-coral-400/40 p-8 text-center"
      >
        <div className="text-7xl mb-4 animate-bob inline-block">🧞</div>
        <h2 className="text-2xl font-bold mb-2">Think of something!</h2>
        <p className="text-slate-500 mb-2">
          An <b>animal</b>, a <b>food</b>, or an <b>everyday thing</b>. Keep it secret!
        </p>
        <p className="text-slate-500 mb-6">
          The genie gets {MAX_QUESTIONS} yes-or-no questions to figure it out. Beat the genie and
          you win!
        </p>
        <button
          onClick={start}
          className="btn-chunky px-10 py-4 rounded-3xl bg-coral-500 text-white text-xl font-display font-bold shadow-[0_6px_0_0_#be123c]"
        >
          🧠 I&apos;m thinking of something…
        </button>
        <p className="text-xs text-slate-400 mt-5">
          Kid-safe: you only ever tap Yes/No buttons — no typing, no personal info.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-coral-400/40 overflow-hidden">
      {/* question counter */}
      <div className="bg-coral-500 text-white px-5 py-3 flex items-center justify-between">
        <span className="font-display font-bold">🧞 Guessing Genie</span>
        <span className="font-display font-bold">
          Question {Math.min(questionsUsed + 1, MAX_QUESTIONS)} / {MAX_QUESTIONS}
        </span>
      </div>

      {/* chat log */}
      <div ref={logRef} className="max-h-80 overflow-y-auto p-5 space-y-3">
        {history.map((h, i) => (
          <div key={i}>
            <div className="flex gap-2 items-start">
              <span className="text-xl">🧞</span>
              <p className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2">{h.question}</p>
            </div>
            <div className="flex justify-end mt-1">
              <p className="bg-splash-500 text-white rounded-2xl rounded-br-sm px-4 py-2 capitalize">
                {h.answer}
              </p>
            </div>
          </div>
        ))}

        <AnimatePresence>
          {phase === "thinking" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 items-center text-slate-400"
            >
              <span className="text-xl">🧞</span>
              <span className="italic">hmm… thinking…</span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                ✨
              </motion.span>
            </motion.div>
          )}
          {phase === "asking" && turn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 items-start"
            >
              <span className="text-xl">🧞</span>
              <p
                className={`rounded-2xl rounded-tl-sm px-4 py-2 font-semibold ${
                  turn.isGuess ? "bg-sunny-300" : "bg-slate-100"
                }`}
              >
                {turn.isGuess && (
                  <span className="block text-xs uppercase tracking-wide text-slate-600">
                    ✨ The genie makes a guess! ✨
                  </span>
                )}
                {turn.question}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "genieWins" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🧞🎉</div>
            <h3 className="text-2xl font-bold">The genie read your mind!</h3>
            <p className="text-slate-500">Got it in {questionsUsed} questions. Rematch?</p>
          </div>
        )}
        {phase === "playerWins" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold">YOU beat the genie!</h3>
            <p className="text-slate-500">
              {MAX_QUESTIONS} questions and it still couldn&apos;t guess. Amazing brain!
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

      {/* answer buttons */}
      <div className="border-t-4 border-slate-100 p-4">
        {phase === "asking" && turn && !turn.isGuess && (
          <div className="grid grid-cols-3 gap-3">
            <AnswerBtn label="👍 Yes" onClick={() => respond("yes")} className="bg-sprout-500 shadow-[0_4px_0_0_#15803d]" />
            <AnswerBtn label="👎 No" onClick={() => respond("no")} className="bg-coral-500 shadow-[0_4px_0_0_#be123c]" />
            <AnswerBtn label="🤷 Sort of" onClick={() => respond("sort of")} className="bg-splash-500 shadow-[0_4px_0_0_#0369a1]" />
          </div>
        )}
        {phase === "asking" && turn && turn.isGuess && (
          <div className="grid grid-cols-2 gap-3">
            <AnswerBtn
              label="🎯 Yes, you got it!"
              onClick={() => respond("yes, you got it!")}
              className="bg-sprout-500 shadow-[0_4px_0_0_#15803d]"
            />
            <AnswerBtn
              label="😏 Nope, keep trying!"
              onClick={() => respond("no, that's not it")}
              className="bg-coral-500 shadow-[0_4px_0_0_#be123c]"
            />
          </div>
        )}
        {(phase === "genieWins" || phase === "playerWins" || phase === "error") && (
          <AnswerBtn
            label="🔄 Play again"
            onClick={start}
            className="w-full bg-berry-500 shadow-[0_4px_0_0_#7e22ce]"
          />
        )}
        {phase === "thinking" && (
          <p className="text-center text-slate-400 text-sm py-2">The genie is thinking hard…</p>
        )}
      </div>
    </div>
  );
}
