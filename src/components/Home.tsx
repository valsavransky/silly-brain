import { motion } from "framer-motion";
import type { Page } from "../App";
import GameCard from "./GameCard";

const GAMES: {
  page: Page;
  emoji: string;
  title: string;
  tagline: string;
  skills: string;
  color: string;
  shadow: string;
}[] = [
  {
    page: "pattern",
    emoji: "🚀",
    title: "Pattern Arcade",
    tagline: "Zap the shape that completes the pattern before it floats away!",
    skills: "Patterns · Focus · Speed",
    color: "bg-splash-500",
    shadow: "shadow-[0_6px_0_0_#0369a1]",
  },
  {
    page: "logic",
    emoji: "🧩",
    title: "Mensa Logic Grid",
    tagline: "Crack the clues and match everyone to their pets and snacks.",
    skills: "Deduction · Logic · Reading",
    color: "bg-berry-500",
    shadow: "shadow-[0_6px_0_0_#7e22ce]",
  },
  {
    page: "story",
    emoji: "🦕",
    title: "Story Math Journeys",
    tagline: "Choose your adventure — solve math to survive space, seas & dinos!",
    skills: "Math · Reading · Choices",
    color: "bg-sprout-500",
    shadow: "shadow-[0_6px_0_0_#15803d]",
  },
  {
    page: "twenty",
    emoji: "🔮",
    title: "AI 20 Questions",
    tagline: "Think of anything — can the guessing genie read your mind?",
    skills: "Thinking · Categories · Fun",
    color: "bg-coral-500",
    shadow: "shadow-[0_6px_0_0_#be123c]",
  },
];

export default function Home({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="text-center pt-12 pb-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4 animate-bob inline-block">🌱</div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Learning that feels like an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sprout-500 via-splash-500 to-berry-500">
              arcade
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            No ads. No flashcards. No mush. Just fast, juicy, <b>action-first</b> games that
            sneak real thinking into every tap, slice and blast.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("pattern")}
            className="btn-chunky mt-8 px-10 py-4 rounded-3xl bg-sunny-400 text-ink text-xl font-display font-bold shadow-[0_6px_0_0_#a16207]"
          >
            ▶ Play now — it&apos;s free
          </motion.button>
        </motion.div>
      </section>

      {/* Game hub grid */}
      <section className="pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Pick your challenge</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAMES.map((g, i) => (
            <GameCard key={g.page} {...g} index={i} onPlay={() => navigate(g.page)} />
          ))}
        </div>
      </section>

      {/* Values strip */}
      <section className="pb-16 grid sm:grid-cols-3 gap-4 text-center">
        {[
          ["🛡️", "Kid-safe by design", "Zero ads, zero tracking, zero data collected from kids. COPPA & GDPR-K friendly."],
          ["🎯", "Adaptive difficulty", "Games speed up when you're on fire and ease off when you need a breather."],
          ["🏫", "Classroom ready", "Runs great on iPads and Chromebooks — no installs, no app store."],
        ].map(([icon, title, body]) => (
          <div key={title} className="bg-white rounded-3xl p-6 border-4 border-slate-100">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-slate-500 text-sm mt-1">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
