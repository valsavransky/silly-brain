import { useMemo, useState } from "react";
import { motion } from "framer-motion";

/** Adult gate: a multiplication riddle young kids can't easily solve. */
export default function ParentGate({
  onPass,
  onClose,
}: {
  onPass: () => void;
  onClose: () => void;
}) {
  const riddle = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4); // 6-9
    const b = 6 + Math.floor(Math.random() * 4); // 6-9
    const c = 2 + Math.floor(Math.random() * 7); // 2-8
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c };
  }, []);
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(0);

  const submit = () => {
    if (Number(value.trim()) === riddle.answer) {
      onPass();
    } else {
      setShake((s) => s + 1);
      setValue("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        key={shake}
        initial={shake ? { x: 0 } : { scale: 0.85, opacity: 0 }}
        animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-2">🔐</div>
        <h2 className="text-2xl font-bold mb-1">Grown-ups only!</h2>
        <p className="text-slate-500 mb-5">To keep kids in the fun zone, please solve:</p>
        <p className="text-3xl font-display font-bold mb-4 tracking-wide">{riddle.text} = ?</p>
        <input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-32 text-center text-2xl font-bold border-4 border-slate-200 rounded-2xl py-2 focus:border-berry-400 focus:outline-none"
          aria-label="Answer"
        />
        <div className="mt-5 flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="btn-chunky px-5 py-3 rounded-2xl font-display font-bold text-slate-500 bg-slate-100 shadow-[0_4px_0_0_rgb(0_0_0/0.15)]"
          >
            Back to games
          </button>
          <button
            onClick={submit}
            className="btn-chunky px-6 py-3 rounded-2xl font-display font-bold text-white bg-berry-500 shadow-[0_4px_0_0_rgb(0_0_0/0.25)]"
          >
            Enter
          </button>
        </div>
      </motion.div>
    </div>
  );
}
