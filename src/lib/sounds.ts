// Tiny synthesized sound effects via WebAudio — no audio assets needed.
// All sounds are short, gentle, and kid-friendly.

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
) {
  const ac = audioCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + startAt;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

/** Bright pop for a correct tap. */
export function playCorrect() {
  tone(523.25, 0, 0.12, "triangle"); // C5
  tone(659.25, 0.08, 0.12, "triangle"); // E5
  tone(783.99, 0.16, 0.2, "triangle"); // G5
}

/** Gentle "womp" for a wrong answer — never harsh. */
export function playWrong() {
  tone(220, 0, 0.18, "sine", 0.12);
  tone(185, 0.12, 0.25, "sine", 0.1);
}

/** Small click/pop for UI taps. */
export function playPop() {
  tone(880, 0, 0.06, "square", 0.06);
}

/** Ascending fanfare for wins / level ups. */
export function playFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.12, 0.25, "triangle", 0.14));
}

/** Sparkly arpeggio for story progress. */
export function playSparkle() {
  const notes = [987.77, 1174.66, 1567.98];
  notes.forEach((n, i) => tone(n, i * 0.06, 0.15, "sine", 0.08));
}
