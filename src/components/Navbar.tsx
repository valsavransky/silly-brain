import { useState } from "react";
import type { Page } from "../App";
import ParentGate from "./ParentGate";

export default function Navbar({
  navigate,
  page,
}: {
  navigate: (p: Page) => void;
  page: Page;
}) {
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b-4 border-sprout-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-2xl font-display font-bold text-sprout-600"
          >
            <span className="text-3xl">🌱</span> MindSprout
          </button>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("home")}
              className={`font-display font-semibold px-3 py-2 rounded-xl min-h-11 ${
                page === "home" ? "bg-sprout-100 text-sprout-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Games
            </button>
            <button
              onClick={() => (page === "portal" ? navigate("home") : setGateOpen(true))}
              className={`font-display font-semibold px-3 py-2 rounded-xl min-h-11 ${
                page === "portal" ? "bg-berry-500 text-white" : "bg-berry-500/10 text-berry-600 hover:bg-berry-500/20"
              }`}
            >
              👨‍👩‍👧 Parent & Teacher Portal
            </button>
          </nav>
        </div>
      </header>
      {gateOpen && (
        <ParentGate
          onPass={() => {
            setGateOpen(false);
            navigate("portal");
          }}
          onClose={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
