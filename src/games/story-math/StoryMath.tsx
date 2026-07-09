import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "../../components/GameHeader";
import { THEMES, generateProblem, type Theme, type Tier, type Problem } from "./engine";
import { playCorrect, playWrong, playSparkle, playFanfare, playPop } from "../../lib/sounds";
import { celebrate } from "../../lib/celebrate";

type Phase = "pick" | "intro" | "beat" | "recovery" | "finale";

export default function StoryMath({ onBack }: { onBack: () => void }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [beatIndex, setBeatIndex] = useState(0);
  const [tier, setTier] = useState<Tier>(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [recoveryText, setRecoveryText] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const startJourney = (t: Theme) => {
    playPop();
    setTheme(t);
    setPhase("intro");
    setBeatIndex(0);
    setTier(1);
    setStreak(0);
    setPicked(null);
  };

  const startBeat = (t: Theme, index: number, tr: Tier) => {
    setProblem(generateProblem(t, tr));
    setBeatIndex(index);
    setPicked(null);
    setPhase("beat");
  };

  const answer = (choice: number) => {
    if (!theme || !problem || picked !== null) return;
    setPicked(choice);

    if (choice === problem.answer) {
      playCorrect();
      const newStreak = streak + 1;
      let newTier = tier;
      if (newStreak >= 3 && tier < 3) {
        newTier = (tier + 1) as Tier;
        setStreak(0);
        playSparkle();
      } else {
        setStreak(newStreak);
      }
      setTier(newTier);

      setTimeout(() => {
        if (beatIndex + 1 >= theme.beats.length) {
          setPhase("finale");
          playFanfare();
          celebrate();
        } else {
          startBeat(theme, beatIndex + 1, newTier);
        }
      }, 900);
    } else {
      playWrong();
      setStreak(0);
      const easedTier = tier > 1 ? ((tier - 1) as Tier) : tier;
      setTier(easedTier);
      setTimeout(() => {
        setRecoveryText(theme.recoveries[Math.floor(Math.random() * theme.recoveries.length)]);
        setProblem(generateProblem(theme, easedTier));
        setPicked(null);
        setPhase("recovery");
      }, 900);
    }
  };

  // ------------------------------------------------------------ theme picker
  if (phase === "pick" || !theme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <GameHeader
          onBack={onBack}
          emoji="🦕"
          title="Story Math Journeys"
          subtitle="Pick a world. Solve the math. Save the day!"
        />
        <div className="grid sm:grid-cols-3 gap-5">
          {THEMES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => startJourney(t)}
              className={`btn-chunky bg-gradient-to-br ${t.cardClass} text-white rounded-3xl p-6 text-left shadow-[0_6px_0_0_rgb(0_0_0/0.25)]`}
            >
              <div className="text-6xl mb-3">{t.emoji}</div>
              <h3 className="text-2xl font-bold">{t.name}</h3>
              <p className="text-white/85 mt-1 text-sm">{t.intro.slice(0, 90)}…</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const progress = phase === "finale" ? 1 : beatIndex / theme.beats.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <GameHeader onBack={onBack} emoji={theme.emoji} title={theme.name} subtitle="Answer to keep the adventure going!" />

      {/* progress trail */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${theme.cardClass}`}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="font-display font-bold text-slate-500 text-sm whitespace-nowrap">
          {phase === "finale" ? "Done!" : `Scene ${beatIndex + 1}/${theme.beats.length}`} · Tier {tier}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl border-4 border-slate-100 p-8 text-center"
          >
            <div className="text-6xl mb-4">{theme.emoji}</div>
            <p className="text-lg text-slate-600 mb-6">{theme.intro}</p>
            <button
              onClick={() => {
                playPop();
                startBeat(theme, 0, tier);
              }}
              className={`btn-chunky px-10 py-4 rounded-3xl bg-gradient-to-r ${theme.cardClass} text-white text-xl font-display font-bold shadow-[0_6px_0_0_rgb(0_0_0/0.25)]`}
            >
              Begin the journey →
            </button>
          </motion.div>
        )}

        {(phase === "beat" || phase === "recovery") && problem && (
          <motion.div
            key={`${phase}-${beatIndex}-${problem.text}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="bg-white rounded-3xl border-4 border-slate-100 p-6 sm:p-8"
          >
            <p className="text-lg text-slate-600 mb-4">
              {phase === "recovery" ? recoveryText : theme.beats[beatIndex]}
            </p>
            <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-2xl p-5 mb-6">
              <p className="text-xl font-semibold">{problem.text}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {problem.choices.map((c) => {
                const isPicked = picked === c;
                const isCorrect = c === problem.answer;
                return (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => answer(c)}
                    disabled={picked !== null}
                    className={`btn-chunky min-h-16 rounded-2xl text-2xl font-display font-bold border-4 transition-colors ${
                      picked === null
                        ? "bg-white border-slate-200 hover:border-splash-400"
                        : isPicked && isCorrect
                          ? "bg-sprout-100 border-sprout-500"
                          : isPicked
                            ? "bg-coral-400/20 border-coral-400"
                            : isCorrect
                              ? "bg-sprout-50 border-sprout-400"
                              : "bg-white border-slate-100 opacity-50"
                    }`}
                  >
                    {c}
                    {picked !== null && isPicked && (isCorrect ? " 🎉" : " 🙈")}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === "finale" && (
          <motion.div
            key="finale"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-gradient-to-br ${theme.cardClass} text-white rounded-3xl p-8 text-center shadow-xl`}
          >
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg mb-6">{theme.finale}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => startJourney(theme)}
                className="btn-chunky px-6 py-3 rounded-2xl bg-white/20 border-2 border-white/50 font-display font-bold shadow-[0_4px_0_0_rgb(0_0_0/0.2)]"
              >
                🔁 Same world, new story
              </button>
              <button
                onClick={() => {
                  playPop();
                  setPhase("pick");
                  setTheme(null);
                }}
                className="btn-chunky px-6 py-3 rounded-2xl bg-white text-ink font-display font-bold shadow-[0_4px_0_0_rgb(0_0_0/0.2)]"
              >
                🗺️ Choose a new world
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
