import confetti from "canvas-confetti";

/** Big celebratory confetti burst for wins. */
export function celebrate() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#22c55e", "#a855f7", "#facc15", "#0ea5e9", "#f43f5e"],
  });
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

/** Small burst for minor successes. */
export function sparkleBurst(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 30,
    spread: 45,
    startVelocity: 25,
    origin: { x, y },
    scalar: 0.8,
  });
}
