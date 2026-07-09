import { useState } from "react";
import { motion } from "framer-motion";
import GameHeader from "../../components/GameHeader";
import ClassicMode from "./ClassicMode";
import ReverseMode from "./ReverseMode";
import { playPop } from "../../lib/sounds";

type Mode = null | "classic" | "reverse";

export default function TwentyQuestions({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <GameHeader
        onBack={mode ? () => setMode(null) : onBack}
        emoji="🔮"
        title="AI 20 Questions"
        subtitle={
          mode === "classic"
            ? "Think of something — the genie will try to read your mind!"
            : mode === "reverse"
              ? "The genie is hiding a secret — sniff it out, detective!"
              : "Two ways to play — who's guessing today?"
        }
      />

      {mode === null && (
        <div className="grid sm:grid-cols-2 gap-5">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playPop();
              setMode("classic");
            }}
            className="btn-chunky bg-coral-500 text-white rounded-3xl p-6 text-left shadow-[0_6px_0_0_#be123c]"
          >
            <div className="text-5xl mb-3">🧞</div>
            <h3 className="text-2xl font-bold">Genie guesses</h3>
            <p className="text-white/90 mt-1">
              YOU think of something secret. The genie asks the questions and tries to read your
              mind.
            </p>
          </motion.button>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playPop();
              setMode("reverse");
            }}
            className="btn-chunky bg-berry-500 text-white rounded-3xl p-6 text-left shadow-[0_6px_0_0_#7e22ce]"
          >
            <div className="text-5xl mb-3">🕵️</div>
            <h3 className="text-2xl font-bold">YOU guess</h3>
            <p className="text-white/90 mt-1">
              The genie hides a secret. Ask smart yes/no questions — tap a suggestion or type your
              own!
            </p>
          </motion.button>
        </div>
      )}

      {mode === "classic" && <ClassicMode />}
      {mode === "reverse" && <ReverseMode />}
    </div>
  );
}
