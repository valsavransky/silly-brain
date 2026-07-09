import { motion } from "framer-motion";

export default function GameCard({
  emoji,
  title,
  tagline,
  skills,
  color,
  shadow,
  index,
  onPlay,
}: {
  emoji: string;
  title: string;
  tagline: string;
  skills: string;
  color: string;
  shadow: string;
  index: number;
  onPlay: () => void;
}) {
  return (
    <motion.button
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      whileHover={{ scale: 1.03, rotate: index % 2 ? 0.6 : -0.6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPlay}
      className={`${color} ${shadow} btn-chunky text-left rounded-3xl p-6 text-white cursor-pointer`}
    >
      <div className="flex items-start gap-4">
        <div className="text-5xl bg-white/20 rounded-2xl p-3">{emoji}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-white/90 mt-1">{tagline}</p>
          <div className="mt-3 inline-block bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
            {skills}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
