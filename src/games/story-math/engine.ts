// Story engine: themed narrative beats wrap dynamically generated math problems.
// Difficulty tiers: 1 = +/− within 20, 2 = +/− within 100 & easy ×, 3 = ×/÷ & two-step.

export type ThemeId = "space" | "sea" | "dino";
export type Tier = 1 | 2 | 3;

export interface Problem {
  text: string;
  answer: number;
  choices: number[];
}

interface TemplateSet {
  /** Each template returns narrative problem text + the numeric answer. */
  templates: ((r: (lo: number, hi: number) => number) => { text: string; answer: number })[];
}

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  cardClass: string;
  intro: string;
  /** Narrative interludes shown before each problem (journey length = beats.length). */
  beats: string[];
  /** Shown when an answer is wrong — a gentle detour, never punitive. */
  recoveries: string[];
  finale: string;
  problems: Record<Tier, TemplateSet>;
}

const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  const deltas = [1, -1, 2, -2, 3, -3, 10, -10, 4, 5];
  for (const d of deltas) {
    if (set.size >= 4) break;
    const v = answer + d;
    if (v >= 0 && !set.has(v)) set.add(v);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

export function generateProblem(theme: Theme, tier: Tier): Problem {
  const set = theme.problems[tier];
  const template = set.templates[Math.floor(Math.random() * set.templates.length)];
  const { text, answer } = template(rand);
  return { text, answer, choices: makeChoices(answer) };
}

export const THEMES: Theme[] = [
  {
    id: "space",
    name: "Outer Space Rescue",
    emoji: "🚀",
    cardClass: "from-indigo-500 to-violet-600",
    intro:
      "Mission Control needs YOU! A friendly alien named Blip is stranded on the Moon, and only a sharp-minded astronaut can reach them.",
    beats: [
      "🛠️ At the launch pad, your rocket hums. But the fuel computer flashes a question...",
      "🌍 Liftoff! Earth shrinks below you. Suddenly, space junk blocks your path!",
      "🛰️ You dodge into a satellite lane. The navigation robot needs your help to plot the course.",
      "☄️ A meteor shower sparkles ahead! Quick — calculate a safe gap to fly through.",
      "🌕 The Moon glows ahead. Blip waves from a crater — plan the perfect landing!",
      "👽 One last step: unlock Blip's rescue pod with the secret number code!",
    ],
    recoveries: [
      "💫 Whoops — the rocket wobbles into a loop-de-loop! Blip giggles over the radio: 'Try again, space friend!'",
      "🔧 Clank! A bolt pops loose. No problem — every astronaut double-checks their math. Take two!",
      "📡 Static crackles... Mission Control repeats the numbers slowly. You've got this!",
    ],
    finale:
      "🎉 POD UNLOCKED! Blip zooms out and gives you the galaxy's biggest high-five. You flew, you solved, you RESCUED. Mission complete, Captain!",
    problems: {
      1: {
        templates: [
          (r) => {
            const a = r(4, 12), b = r(3, 8);
            return { text: `The rocket needs ${a} fuel cells for liftoff and ${b} more for the journey. How many fuel cells in total?`, answer: a + b };
          },
          (r) => {
            const a = r(10, 18), b = r(2, 8);
            return { text: `You count ${a} pieces of space junk. ${b} float away. How many are still blocking you?`, answer: a - b };
          },
          (r) => {
            const a = r(5, 10), b = r(5, 9);
            return { text: `Mission Control sends ${a} snack packs, and Blip's family sends ${b}. How many snack packs fly with you?`, answer: a + b };
          },
        ],
      },
      2: {
        templates: [
          (r) => {
            const a = r(25, 60), b = r(12, 35);
            return { text: `Your ship has ${a} oxygen tanks. The trip uses ${b}. How many tanks are left for the way home?`, answer: a - b };
          },
          (r) => {
            const a = r(3, 6), b = r(4, 9);
            return { text: `There are ${a} satellite lanes with ${b} satellites in each lane. How many satellites in all?`, answer: a * b };
          },
          (r) => {
            const a = r(30, 55), b = r(20, 40);
            return { text: `The Moon is ${a + b} space-miles away. You've flown ${a} already. How many space-miles to go?`, answer: b };
          },
        ],
      },
      3: {
        templates: [
          (r) => {
            const b = r(3, 8), ans = r(4, 9);
            return { text: `The rescue pod needs ${b * ans} power crystals shared equally among ${b} sockets. How many crystals per socket?`, answer: ans };
          },
          (r) => {
            const a = r(4, 9), b = r(3, 7), c = r(5, 15);
            return { text: `You collect ${a} moon rocks on ${b} different craters, then find ${c} more. How many moon rocks in total?`, answer: a * b + c };
          },
          (r) => {
            const a = r(6, 12), b = r(2, 4);
            return { text: `Blip's code is ${a} doubled, then ${b} more. What's the code?`, answer: a * 2 + b };
          },
        ],
      },
    },
  },
  {
    id: "sea",
    name: "Deep Sea Discovery",
    emoji: "🐙",
    cardClass: "from-cyan-500 to-blue-600",
    intro:
      "A legendary treasure chest sleeps at the bottom of the Sparkling Trench — and your yellow submarine is the only one brave enough to find it.",
    beats: [
      "⚓ The harbor bell rings! Your submarine needs supplies before it can dive.",
      "🐠 Down you go! A school of clownfish swirls around your porthole in a dazzling pattern.",
      "🪸 You glide over a rainbow coral reef. A shy octopus holds up a puzzle with all eight arms!",
      "🦈 Uh oh — a curious shark circles closer. Distract it with a perfectly-counted snack toss!",
      "🌊 The water turns midnight blue. Your sonar pings the trench floor — almost there!",
      "🗝️ The treasure chest! Its lock spins with numbers. Solve it to claim the treasure!",
    ],
    recoveries: [
      "🫧 Blub blub! The submarine blows a giant bubble and bobs back up a little. Steady now — dive again!",
      "🐬 A friendly dolphin nudges your sub: 'Eee-ee!' (That means 'you're so close, try once more!')",
      "🦀 A crab taps the window and holds up its claws to help you count. Another go!",
    ],
    finale:
      "💎 The chest creaks open — pearls, gold, and a note: 'For the smartest sailor of the seven seas.' That's YOU! The octopus throws you an eight-arm hug. 🐙",
    problems: {
      1: {
        templates: [
          (r) => {
            const a = r(5, 12), b = r(3, 7);
            return { text: `You load ${a} sandwiches and ${b} juice boxes into the sub. How many supplies is that altogether?`, answer: a + b };
          },
          (r) => {
            const a = r(12, 19), b = r(3, 9);
            return { text: `${a} clownfish swim past. ${b} dart into the coral to hide. How many can you still see?`, answer: a - b };
          },
          (r) => {
            const a = r(4, 9), b = r(4, 9);
            return { text: `The octopus juggles ${a} shells in some arms and ${b} in the others. How many shells is it juggling?`, answer: a + b };
          },
        ],
      },
      2: {
        templates: [
          (r) => {
            const a = r(3, 6), b = r(5, 9);
            return { text: `The reef has ${a} coral towers with ${b} seahorses living in each. How many seahorses in the reef?`, answer: a * b };
          },
          (r) => {
            const a = r(40, 80), b = r(15, 35);
            return { text: `The trench is ${a} meters deep. You've dived ${b} meters. How many meters to the bottom?`, answer: a - b };
          },
          (r) => {
            const a = r(20, 45), b = r(12, 30);
            return { text: `You toss ${a} fish snacks, then ${b} more to keep the shark happy. How many snacks did it gobble?`, answer: a + b };
          },
        ],
      },
      3: {
        templates: [
          (r) => {
            const b = r(2, 5), ans = r(4, 8);
            return { text: `${b * ans} pearls must be shared equally between ${b} treasure pouches. How many pearls per pouch?`, answer: ans };
          },
          (r) => {
            const a = r(3, 6), b = r(4, 8), c = r(4, 12);
            return { text: `The lock code: ${a} rows of ${b} gold coins, plus ${c} extra. What number opens the chest?`, answer: a * b + c };
          },
          (r) => {
            const a = r(8, 15);
            return { text: `The octopus holds ${a} shells in each half of its arms. Double ${a} — how many shells in total?`, answer: a * 2 };
          },
        ],
      },
    },
  },
  {
    id: "dino",
    name: "Dinosaur Time Trek",
    emoji: "🦖",
    cardClass: "from-emerald-500 to-lime-600",
    intro:
      "Your time machine has zapped you back 66 million years! To get home, you must gather crystal batteries — with some very large helpers.",
    beats: [
      "⏰ CRASH-LANDING in a fern forest! The time machine's battery meter blinks a question.",
      "🦕 A gentle Brontosaurus offers you a ride. Count carefully to climb aboard safely!",
      "🌋 The volcano rumbles in the distance. A baby Triceratops shows you a shortcut — if you solve its riddle.",
      "🦖 GRRRR! A T-Rex blocks the path... but it just wants help counting its tiny-armed push-ups!",
      "🥚 You tiptoe through a nest of eggs. The mama Maiasaura needs an egg-xact count!",
      "💎 The crystal cave! Grab exactly the right number of crystals to power up and blast home!",
    ],
    recoveries: [
      "🌿 Bonk! You slip on a giant fern leaf. The Brontosaurus catches you with its tail. Try that one again!",
      "🐾 The baby Triceratops giggles and stomps its feet: 'So close! One more try, time traveler!'",
      "🪨 A pebble avalanche! You duck behind a rock and take a deep breath. Ready? Again!",
    ],
    finale:
      "⚡ ZAP! The time machine roars to life! The dinosaurs wave goodbye (even the T-Rex, with its little arms). You made it home — genius of two time periods! 🏠",
    problems: {
      1: {
        templates: [
          (r) => {
            const a = r(6, 12), b = r(3, 8);
            return { text: `The battery meter shows ${a} crystals, but you need ${a + b}. How many MORE crystals must you find?`, answer: b };
          },
          (r) => {
            const a = r(10, 18), b = r(2, 8);
            return { text: `The Brontosaurus is ${a} meters tall. You climb ${b} meters. How many meters left to its back?`, answer: a - b };
          },
          (r) => {
            const a = r(4, 10), b = r(3, 9);
            return { text: `You spot ${a} ferns on one side of the path and ${b} on the other. How many ferns in all?`, answer: a + b };
          },
        ],
      },
      2: {
        templates: [
          (r) => {
            const a = r(3, 6), b = r(4, 8);
            return { text: `The T-Rex does ${a} sets of ${b} push-ups. How many push-ups is that?`, answer: a * b };
          },
          (r) => {
            const a = r(30, 60), b = r(12, 28);
            return { text: `The nest has ${a} eggs. ${b} have already hatched. How many eggs are still waiting?`, answer: a - b };
          },
          (r) => {
            const a = r(25, 50), b = r(14, 30);
            return { text: `The shortcut saves time: the long path is ${a + b} steps, the shortcut is ${a} steps. How many steps do you save?`, answer: b };
          },
        ],
      },
      3: {
        templates: [
          (r) => {
            const b = r(3, 6), ans = r(3, 8);
            return { text: `${b * ans} crystals must go equally into ${b} battery slots. How many crystals per slot?`, answer: ans };
          },
          (r) => {
            const a = r(4, 8), b = r(3, 6), c = r(5, 14);
            return { text: `You gather ${a} crystals from each of ${b} caves, plus ${c} from the floor. How many crystals total?`, answer: a * b + c };
          },
          (r) => {
            const a = r(7, 14), b = r(2, 5);
            return { text: `The launch code is ${a} doubled, minus ${b}. What's the code?`, answer: a * 2 - b };
          },
        ],
      },
    },
  },
];
