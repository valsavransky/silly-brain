export default function GameHeader({
  onBack,
  emoji,
  title,
  subtitle,
}: {
  onBack: () => void;
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <button
        onClick={onBack}
        aria-label="Back to games"
        className="btn-chunky shrink-0 w-12 h-12 rounded-2xl bg-white border-4 border-slate-200 font-display font-bold text-xl shadow-[0_4px_0_0_rgb(0_0_0/0.1)]"
      >
        ←
      </button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
          {emoji} {title}
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
