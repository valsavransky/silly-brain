export default function AnswerBtn({
  label,
  onClick,
  className,
  disabled,
}: {
  label: string;
  onClick: () => void;
  className: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-chunky min-h-14 px-4 rounded-2xl text-white font-display font-bold text-lg disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
}
