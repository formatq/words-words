# words-words — phrasal verb trainer

## Idea

An app for "spinning through" English phrasal verbs: `go away`, `go through`, `take off`, etc. Infinitive only for now.

The interface is two "wheels" (like a slot machine or the iOS date picker): the left one holds the verb, the right one the particle. The user spins the wheels and instantly sees the resulting combination and its Russian translation. The core value is **switching speed and comparison**: press up — and see how `go up` differs from `go away`.

Below the wheels is a running feed (history): every viewed combination gets typed into the feed together with its translation, so the previous variants stay on screen for comparison.

## Key requirements

1. **Instant response.** No network requests on switching: all data is static and loaded once. Response to a key press < 16 ms (one frame).
2. **Works on desktop and on the phone.** Desktop — keyboard arrows; phone — tap and swipe.
3. **Only meaningful combinations.** While spinning a wheel, values that do not form an existing phrasal verb with the current value of the other wheel are skipped. Every stop of a wheel is a real verb with a translation.

## Controls

Desktop (keyboard):
- `←` / `→` — switch the active wheel (verb ↔ particle). The active wheel is visually highlighted.
- `↑` / `↓` — spin the active wheel by one position (skipping invalid combinations, see above). Holding the key (auto-repeat) works and flips through quickly.
- Mouse wheel over a wheel spins it too.
- Clicking a wheel makes it active.

Phone (touch):
- Tapping a wheel makes it active.
- A vertical swipe over a wheel spins it (1 position per ~60px of movement; momentum is not required in v1).

Spinning is cyclic: after the last value comes the first one.

## Interface (single screen)

```
┌──────────────────────────────────┐
│                                  │
│      ┌────────┐  ┌─────────┐     │
│      │  take  │  │  away   │     │   ← neighboring wheel values
│      │ ▸ GO ◂ │  │ THROUGH │     │   ← current combination (large)
│      │  get   │  │   up    │     │      active wheel is highlighted
│      └────────┘  └─────────┘     │
│                                  │
│      проходить через;            │   ← translation of the current combo
│      пережить (трудности)        │
│                                  │
│  ──────── history ────────────   │
│  go through — проходить через…   │   ← the newest entry is typed out
│  go away — уходить, уезжать      │      typewriter-style
│  go up — подниматься             │
│                                  │
└──────────────────────────────────┘
```

- A wheel shows the current value large in the center and 1–2 neighboring (valid) values above/below, semi-transparent — so it's clear "where to spin".
- Changing a value plays a quick shift animation (~100–150 ms), but the logic never waits for the animation: you can flip faster than it plays.
- The translation updates instantly together with the combination.
- History feed: a new entry appears at the top with a typing effect (typewriter, ~15–20 ms per character), older entries shift down. Consecutive duplicates are not added. At most 50 entries are kept (older ones are dropped). History lives in memory only, no persistence.

## Data

A separate static file `src/data/phrasal-verbs.json`, so that filling it in can be an independent task:

```json
{
  "verbs": ["go", "take", "get", "come", "look", "put", "turn", "give", "break", "run"],
  "particles": ["away", "up", "down", "out", "in", "on", "off", "through", "back", "over", "after", "into"],
  "combos": {
    "go away":    { "ru": "уходить, уезжать" },
    "go through": { "ru": "проходить через; пережить (трудности)" },
    "take off":   { "ru": "снимать (одежду); взлетать" },
    "look after": { "ru": "заботиться, присматривать за" }
  }
}
```

- A key in `combos` is the string `"<verb> <particle>"`.
- `ru` is the translation; multiple senses separated by `;`.
- Invariants (checked at startup in dev mode): every key in `combos` consists of words present in `verbs` and `particles`; every verb and every particle has at least one combination.
- For the first iteration: ~10 verbs, ~12 particles, 60–80 combinations. Filling in high-quality translations is a **separate task**; for the start the agent creates a draft set.

## Tech stack

- **Vite + React + TypeScript.** Static build, no backend. Can be hosted anywhere (GitHub Pages / any static hosting).
- No UI libraries and no state managers: plain CSS (or CSS modules) and `useState`/`useReducer`. The app is tiny — speed and simplicity matter most.
- The data JSON is imported straight into the bundle (no fetch), so there is not even a single network request for data.

## Project structure

```
words-words/
  index.html
  package.json
  vite.config.ts
  src/
    main.tsx
    App.tsx                  — state: {verbIndex, particleIndex, activeWheel, history}
    components/
      Wheel.tsx              — a single wheel (values, highlight, shift animation)
      Translation.tsx        — current translation
      HistoryFeed.tsx        — feed with the typing effect
    lib/
      combos.ts              — data loading, next-valid-value lookup,
                               invariant validation
      useControls.ts         — keyboard, mouse wheel, swipes
    data/
      phrasal-verbs.json
```

The core of the logic is a pure function in `combos.ts` (easy to cover with tests):

```ts
// direction: +1 | -1. Returns the index of the next value of wheel
// that forms a valid combination with the current value of the other wheel.
nextValidIndex(wheel: 'verb' | 'particle', currentState, direction): number
```

## Work plan (first iteration)

1. Scaffold Vite + React + TS, empty screen; no deploy script needed (`npm run dev` is enough).
2. `phrasal-verbs.json` with a draft dataset + `combos.ts` with validation and `nextValidIndex` + unit tests for it (vitest).
3. Wheels + translation, keyboard controls (`←→↑↓`), active wheel highlight.
4. History feed with the typing effect.
5. Touch: tap + swipe; mouse wheel. Test on a real phone (or devtools emulation).
6. Polish: wheel shift animation, mobile layout (everything fits one screen with no page scroll), dark theme via `prefers-color-scheme`.

## Acceptance criteria

- With the arrow keys you can flip through a dozen combinations in seconds; every stop is an existing phrasal verb with a translation.
- Not a single network request after the page loads.
- On the phone, swipes over the wheels work; the page does not scroll or zoom while swiping.
- The history types out correctly and does not duplicate consecutive identical entries.
- Unit tests for `nextValidIndex` (cyclic wrap-around, skipping invalid values, the "single valid value" case) pass.

## Future ideas (not for the first iteration)

- **Verb forms:** a third wheel or a switch — past simple, past participle, -ing, 3rd person (`went through`, `gone through`…).
- **Example sentences:** 1–2 examples with translations per combination, shown below the translation.
- **Audio:** play the pronunciation of the combination (Web Speech API — free and offline, or pre-generated audio files).
- **Quiz mode:** a translation is shown — spin the wheels to "dial in" the right combination.
- **Favorites and spaced repetition:** star combinations, review them on a schedule (data in localStorage).
- **Bigger dictionary:** generate a large dataset (200+ verbs) with an LLM plus manual proofreading; difficulty levels (A2/B1/B2).
- **Reverse direction:** ru→en mode (the translation is shown, you spin the wheels blind until they match).
- **PWA:** manifest + service worker, so it can be installed on the phone's home screen and used offline.
- **"Family" highlighting:** a mode showing all particles of the current verb at once (as a table), for systematic study.
- **Persistent history:** keep the feed between sessions, stats on what was viewed most.
