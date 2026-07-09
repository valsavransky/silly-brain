export interface Puzzle {
  title: string;
  intro: string;
  rows: string[];
  cols: string[];
  clues: string[];
  /** solution[rowIndex] = colIndex */
  solution: number[];
}

export const PUZZLES: Puzzle[] = [
  {
    title: "Pet Pals",
    intro: "Three friends each have one pet. Use the clues to match them up!",
    rows: ["Maya 👧", "Leo 👦", "Zoe 👧🏽"],
    cols: ["Puppy 🐶", "Parrot 🦜", "Goldfish 🐠"],
    clues: [
      "Maya's pet has colorful feathers.",
      "Leo's pet can never go for a walk.",
      "Zoe loves playing fetch with her pet.",
    ],
    solution: [1, 2, 0],
  },
  {
    title: "Snack Attack",
    intro: "Everyone brought a different snack today. Who brought what?",
    rows: ["Sam 👦🏿", "Ava 👧🏼", "Noah 👦"],
    cols: ["Apple 🍎", "Pretzel 🥨", "Yogurt 🥣"],
    clues: [
      "Sam's snack is crunchy AND salty.",
      "Ava's snack grew on a tree.",
      "Noah needs a spoon to eat his snack.",
    ],
    solution: [1, 0, 2],
  },
  {
    title: "Band Practice",
    intro: "The school band has three players. This one needs detective thinking!",
    rows: ["Ruby 👧🏻", "Finn 👦🏽", "Isla 👧🏿"],
    cols: ["Drums 🥁", "Trumpet 🎺", "Piano 🎹"],
    clues: [
      "Ruby does NOT play the drums.",
      "The trumpet player is NOT Ruby.",
      "Finn broke his drumstick last week.",
    ],
    solution: [2, 0, 1],
  },
  {
    title: "Fruit Friends",
    intro: "Four kids, four favorite fruits — the biggest grid yet!",
    rows: ["Mia 👧", "Owen 👦🏼", "Lily 👧🏾", "Jack 👦🏻"],
    cols: ["Strawberry 🍓", "Banana 🍌", "Grapes 🍇", "Watermelon 🍉"],
    clues: [
      "Mia's favorite fruit is long and yellow.",
      "Jack's fruit is bigger than everyone else's.",
      "Owen's fruit does NOT grow in bunches.",
      "Lily shares her tiny round fruits with the class.",
    ],
    solution: [1, 0, 2, 3],
  },
];
