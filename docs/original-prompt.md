# Original Product Spec & Generation Prompt

This is the original PRD and generation prompt used to kick off the MindSprout build
(July 2026), kept for reference.

---

## 📋 Product Specification Document (PRD)

### 1. Project Overview

- **Project Name:** [Insert Name, e.g., MindSprout or LogicArcade]
- **Target Audience:** Children (Ages 6–12), Parents, and Elementary Educators.
- **Core Mission:** To destroy the "crap web game" paradigm by replacing static, ad-heavy digital flashcards with responsive, modern, arcade-style logic and educational games.
- **Platform:** Responsive Web Application (optimized for Desktop, iPads, and school Chromebooks).

### 2. Key Product Values

- **Action-First Mechanics:** Educational concepts are baked into physical, engaging arcade game loops (slingshots, falling blocks, slicing) rather than simple multiple-choice forms.
- **Premium & Safe Ecosystem:** 100% ad-free experience. Zero data-tracking for children under 13 to ensure strict global compliance.
- **Adaptive Intelligence:** Game engines dynamically scale difficulty up or down based on real-time player performance metrics.

### 3. Game Portfolio & Core Architecture

**Game 1: The Modern Pattern Arcade (Phaser 3 / PixiJS)**
- Concept: A fast-paced, tactile pattern-recognition game.
- Mechanics: A sequence pattern is displayed at the top of the screen (e.g., 🔴 🔵 🔴 🔵 [?]). Shapes float upward from the bottom of the screen. The child must click, tap, or slice the correct shape to complete the sequence before time runs out.
- Juice/Feedback: Star bursts, particle explosions, and satisfying sound design on successful inputs; gentle screen shakes on incorrect answers.

**Game 2: Mensa-Style Logic Grid**
- Concept: Interactive visual deduction puzzles.
- Mechanics: A minimalist grid layout (similar to Einstein's Riddles) where players match attributes (e.g., 3 characters, 3 pets, 3 favorite snacks) based on textual or visual clues.
- UI/UX: Tap a grid square once for an "X" (elimination) and twice for a "Checkmark" (confirmation). Includes an automatic victory trigger upon correct grid completion.

**Game 3: Tailored Math Story Journeys**
- Concept: Immersive, narrative-driven math word problems.
- Mechanics: The player selects a theme profile (e.g., Outer Space, Deep Sea Exploration, Dinosaurs). The system dynamically wraps standard curriculum equations into a "Choose Your Own Adventure" textual narrative.
- Stakes: Correct mathematical answers safely progress the narrative; incorrect answers branch into unique recovery scenarios.

**Game 4: Reverse "20 Questions" AI Engine**
- Concept: Critical thinking and classification game powered by an AI backend.
- Mechanics: The child thinks of an item, animal, or concept. The AI app asks up to 20 contextual yes/no questions to guess it. Teaches children structural classification and deduction.

### 4. Monetization & Business Model

- **The Freemium / Parental Gate Model:** Core introductory levels and basic puzzle categories are entirely free. Advanced curriculums, complex story modes, and customized avatars are locked behind a secure Parental Gate requiring a one-time digital purchase or a $4.99/month subscription.
- **B2B School Licensing:** Ad-free, web-accessible school packages. Teachers can buy bulk room licenses with unique invite URLs, bypassing strict app store restrictions on classroom hardware.

### 5. Technical Requirements & Legal Compliance

- **Front-End Stack:** HTML5, Tailwind CSS, Vanilla JavaScript, Phaser 3 or PixiJS (for hardware-accelerated animations).
- **Legal Compliance:** Strict adherence to COPPA (USA) and GDPR-K (Europe). Zero behavioral tracking cookies. Zero personal identification storage for users under the age of 13.

---

## 🌐 Master Generation Prompt

> Act as a Principal Full-Stack Developer and UX/UI Designer. I want you to build a single-file, production-ready landing page and architecture prototype for a premium, ad-free educational game portal called "MindSprout".
>
> The web app must use HTML5, Tailwind CSS, and embedded Vanilla JavaScript. It must be highly polished, responsive for iPads/Chromebooks, and completely free of lag or "mushy" UI.
>
> Please implement the following interface and framework sections:
>
> 1. **HEADER & HERO:** A clean, modern navbar featuring a "Parent/Teacher Portal" tab locked behind a basic adult gate (e.g., a math verification riddle). A vibrant hero section explaining the "Action-First Learning" philosophy.
> 2. **THE GAME HUBCARD GRID:** A beautiful, modern grid displaying four game choice cards:
>    - Game 1: "Pattern Arcade" (Arcade-style shape sequence completion)
>    - Game 2: "Mensa Logic Grid" (Interactive grid matching matrix with clues)
>    - Game 3: "Story Math Journeys" (Choose-your-own-adventure word problems)
>    - Game 4: "AI 20 Questions" (The critical thinking guessing engine)
> 3. **INTERACTIVE MINI-PROTOTYPE:** Below the grid, embed a fully playable, minimalist placeholder layout for the "Pattern Arcade". Write basic JavaScript so that a sequence appears at the top (e.g., Red, Blue, Red, [?]), and three colorful HTML buttons appear below it. Clicking the correct button should trigger a beautiful Tailwind animation (like confetti or a scale pulse) and instantly load a fresh sequence.
>
> Ensure the styling feels like a premium consumer app (similar to Duolingo or Notion) using bright, clean, high-contrast colors and bouncy hover state interactions. Deliver the entire solution in one single block of code.

---

## What actually got built (deviations from the prompt)

The build expanded beyond the single-file prototype the master prompt asked for:

- **All four games fully playable** (not just a Pattern Arcade mini-prototype)
- **Stack upgraded** from single-file HTML/vanilla JS to Vite + React + TypeScript + Tailwind v4 + Phaser 3 + Framer Motion, served by an Express server
- **Real AI backend** for 20 Questions via the Claude API (`claude-opus-4-8`, structured outputs), key held server-side
- **Deploy target:** Railway, single service (`railway.json`); requires the `ANTHROPIC_API_KEY` env var
