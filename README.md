# Actos - Party Game

A local-first party game where players guess movies and TV shows across 3 acts: 3 words, 1 word, and mime.

## Quick start

```bash
npm install
npm run dev
```

The app runs fully offline without any API credentials. To enable TMDB movie search:

## Environment variables

Copy `.env.example` to `.env.local` and fill in your TMDB credentials:

```env
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_ACCESS_TOKEN=your_access_token_here
```

Get credentials at: https://www.themoviedb.org/settings/api

Without credentials the app uses 30 built-in fictional titles and manual offline add.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run lint` | Lint code |

## Architecture

```
src/
  screens/         11 game screens
  components/
    common/        Avatar, Poster, Timer, Toast, Confetti, etc.
  stores/
    gameStore.ts   Zustand store with all game state and actions
  domain/
    models.ts      TypeScript types
    gameEngine.ts  Pure game logic (acts, turns, correct/skip)
    teamEngine.ts  Team generation and rotation
    mediaPoolEngine.ts  Pool management and deduplication
    scoringEngine.ts    Score tracking and ranking
  services/
    media/         TMDB provider + offline fallback
  persistence/
    storage.ts     localStorage with versioning
  data/
    fallbackMedia.ts  30 fictional offline titles
  utils/
    shuffle.ts     Fisher-Yates shuffle
    mediaKeys.ts   Deduplication keys
```

## Game rules

- 3-10 players in individual or team mode
- Each player adds movies/series to a shared pool (or use random fill)
- 3 acts played with the same titles:
  - Act 1: describe with 3 words
  - Act 2: describe with 1 word
  - Act 3: mime (no words)
- Each guessed title scores 1 point for the current team
- Passed titles stay in the pool; guessed titles leave (but return for next act)
- Winner is team/player with most points after act 3

## Offline mode

The app is fully playable without internet. When TMDB is unavailable:
- Search returns results from 30 built-in fictional titles
- Manual add always works (type title + choose movie or series)
- Random fill uses the offline catalog

## Running tests

```bash
npm test
```

24 unit tests covering: team generation, pool deduplication, scoring, game engine (correct/skip/replay/acts).
