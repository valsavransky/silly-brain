import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createGameConfig } from "./scene";
import GameHeader from "../../components/GameHeader";

export default function PatternArcade({ onBack }: { onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = new Phaser.Game(createGameConfig(containerRef.current));
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <GameHeader
        onBack={onBack}
        emoji="🚀"
        title="Pattern Arcade"
        subtitle="Tap the shape that completes the pattern before it floats away!"
      />
      <div
        ref={containerRef}
        className="rounded-3xl overflow-hidden border-4 border-splash-400 shadow-xl aspect-[4/3] [&>canvas]:w-full [&>canvas]:h-full"
      />
    </div>
  );
}
