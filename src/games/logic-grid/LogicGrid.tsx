import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "../../components/GameHeader";
import { PUZZLES } from "./puzzles";
import { playPop, playWrong, playFanfare } from "../../lib/sounds";
import { celebrate } from "../../lib/celebrate";

/** Cell states: 0 = empty, 1 = ❌ eliminated, 2 = ✔️ confirmed */
type Cell = 0 | 1 | 2;

function emptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill(0));
}

export default function LogicGrid({ onBack }: { onBack: () => void }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];
  const [grid, setGrid] = useState<Cell[][]>(() => emptyGrid(puzzle.rows.length, puzzle.cols.length));
  const [won, setWon] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(2);

  const loadPuzzle = (index: number) => {
    const p = PUZZLES[index];
    setPuzzleIndex(index);
    setGrid(emptyGrid(p.rows.length, p.cols.length));
    setWon(false);
    setHintsLeft(2);
  };

  const applyChange = (next: Cell[][]) => {
    setGrid(next);
    const isWin = puzzle.rows.every((_, r) =>
      puzzle.cols.every((_, c) => (next[r][c] === 2) === (puzzle.solution[r] === c)),
    );
    if (isWin && !won) {
      setWon(true);
      playFanfare();
      celebrate();
    }
  };

  const tapCell = (r: number, c: number) => {
    if (won) return;
    playPop();
    const next = grid.map((row) => [...row]) as Cell[][];
    const state = next[r][c];
    if (state === 0) {
      next[r][c] = 1; // ❌
    } else if (state === 1) {
      next[r][c] = 2; // ✔️ — auto-eliminate the rest of the row & column
      for (let cc = 0; cc < puzzle.cols.length; cc++) if (cc !== c && next[r][cc] === 0) next[r][cc] = 1;
      for (let rr = 0; rr < puzzle.rows.length; rr++) if (rr !== r && next[rr][c] === 0) next[rr][c] = 1;
    } else {
      next[r][c] = 0;
    }
    applyChange(next);
  };

  const useHint = () => {
    if (hintsLeft <= 0 || won) return;
    // Reveal one correct match the player hasn't confirmed yet
    const r = puzzle.rows.findIndex((_, ri) => grid[ri][puzzle.solution[ri]] !== 2);
    if (r === -1) return;
    playWrong(); // gentle "cost" sound
    setHintsLeft((h) => h - 1);
    const c = puzzle.solution[r];
    const next = grid.map((row) => [...row]) as Cell[][];
    next[r][c] = 2;
    for (let cc = 0; cc < puzzle.cols.length; cc++) if (cc !== c && next[r][cc] === 0) next[r][cc] = 1;
    for (let rr = 0; rr < puzzle.rows.length; rr++) if (rr !== r && next[rr][c] === 0) next[rr][c] = 1;
    applyChange(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <GameHeader
        onBack={onBack}
        emoji="🧩"
        title="Mensa Logic Grid"
        subtitle="Tap once for ❌ (no way!), tap again for ✔️ (that's it!)."
      />

      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-lg text-berry-600">
          Puzzle {puzzleIndex + 1} of {PUZZLES.length}: {puzzle.title}
        </div>
        <button
          onClick={useHint}
          disabled={hintsLeft <= 0 || won}
          className="btn-chunky px-4 py-2 rounded-2xl bg-sunny-400 font-display font-bold shadow-[0_4px_0_0_#a16207] disabled:opacity-40"
        >
          💡 Hint ({hintsLeft})
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* The grid */}
        <div className="bg-white rounded-3xl border-4 border-berry-400/40 p-4 sm:p-6 overflow-x-auto">
          <p className="text-slate-500 mb-4">{puzzle.intro}</p>
          <table className="mx-auto border-collapse">
            <thead>
              <tr>
                <th />
                {puzzle.cols.map((col) => (
                  <th key={col} className="px-1 pb-2 text-sm sm:text-base font-display whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puzzle.rows.map((row, r) => (
                <tr key={row}>
                  <td className="pr-3 text-right font-display font-bold whitespace-nowrap">{row}</td>
                  {puzzle.cols.map((_, c) => (
                    <td key={c} className="p-1">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => tapCell(r, c)}
                        aria-label={`${puzzle.rows[r]} and ${puzzle.cols[c]}`}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 text-2xl font-bold flex items-center justify-center transition-colors ${
                          grid[r][c] === 2
                            ? "bg-sprout-100 border-sprout-500"
                            : grid[r][c] === 1
                              ? "bg-slate-100 border-slate-200 text-slate-400"
                              : "bg-white border-slate-200 hover:border-berry-400"
                        }`}
                      >
                        {grid[r][c] === 1 ? "✕" : grid[r][c] === 2 ? "✔️" : ""}
                      </motion.button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clues */}
        <div className="bg-berry-500/5 rounded-3xl border-4 border-berry-400/30 p-6">
          <h3 className="font-display font-bold text-xl mb-3">🕵️ Clues</h3>
          <ol className="space-y-3">
            {puzzle.clues.map((clue, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 w-7 h-7 rounded-full bg-berry-500 text-white font-display font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{clue}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Victory */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-sprout-500 text-white rounded-3xl p-6 text-center shadow-[0_6px_0_0_#15803d]"
          >
            <div className="text-4xl mb-1">🏆</div>
            <h3 className="text-2xl font-bold">Case closed, detective!</h3>
            {puzzleIndex < PUZZLES.length - 1 ? (
              <button
                onClick={() => loadPuzzle(puzzleIndex + 1)}
                className="btn-chunky mt-4 px-8 py-3 rounded-2xl bg-white text-sprout-700 font-display font-bold text-lg shadow-[0_4px_0_0_rgb(0_0_0/0.2)]"
              >
                Next puzzle →
              </button>
            ) : (
              <div className="mt-3">
                <p className="mb-3">You solved every single puzzle! 🌟</p>
                <button
                  onClick={() => loadPuzzle(0)}
                  className="btn-chunky px-8 py-3 rounded-2xl bg-white text-sprout-700 font-display font-bold text-lg shadow-[0_4px_0_0_rgb(0_0_0/0.2)]"
                >
                  Play again from the start
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
