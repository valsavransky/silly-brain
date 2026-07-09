# 🌱 MindSprout

A premium, 100% ad-free arcade of learning games for kids ages 6–12. Four action-first games —
no static flashcards, no tracking, no mush.

| Game | What it trains | Tech |
|---|---|---|
| 🚀 Pattern Arcade | Pattern recognition, focus, speed | Phaser 3 (canvas, particles, adaptive difficulty) |
| 🧩 Mensa Logic Grid | Deduction, careful reading | React grid with tap-to-❌/✔️ and auto-victory |
| 🦕 Story Math Journeys | Arithmetic with narrative stakes | Choose-your-own-adventure engine, 3 themes, adaptive tiers |
| 🔮 AI 20 Questions | Classification, critical thinking | Claude API (server-side) with structured outputs |

## Stack

- **Client:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Phaser 3
- **Server:** Express (serves the built SPA and the AI endpoint), Anthropic TypeScript SDK
- **Deploy:** Railway — one service, one process

## Develop

```sh
npm install
cp .env.example .env      # add your ANTHROPIC_API_KEY for the 20 Questions game
npm run dev               # Vite on :5173 (proxies /api), Express on :3001
```

The AI game degrades gracefully when `ANTHROPIC_API_KEY` is unset — every other game is fully
offline-capable.

## Build & run production

```sh
npm run build             # typecheck + vite build → dist/
npm start                 # Express serves dist/ + /api on $PORT (default 3001)
```

## Deploy to Railway

1. Push this repo to GitHub and create a Railway project from it (or `railway up`).
2. Set the `ANTHROPIC_API_KEY` environment variable in the Railway service.
3. Done — `railway.json` configures `npm run build` / `npm start`, and Express binds `$PORT`.

## Kid-safety posture (COPPA / GDPR-K)

- Zero ads, zero analytics, zero cookies, zero persistence of child data.
- The AI game sends only anonymous game moves (question/answer pairs) to the server; kids never
  type free text — they tap Yes / No / Sort of buttons.
- The Anthropic API key lives server-side only.
- Parent/Teacher portal is gated behind an adult math riddle.
