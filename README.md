# Petits blocs

A French, ad-free endless block puzzle, made for someone special. Original code and artwork, inspired by the block-puzzle genre; not affiliated with Blockanza.

## Run locally

Install a current Node.js LTS version, then open a terminal in this folder:

```sh
node scripts/serve.js
```

Open http://localhost:8080. For another port: `node scripts/serve.js 8081`.
If your Node installation includes npm, `npm start` is an equivalent convenience command.

There are **no dependencies to install and no build step**. The browser loads native JavaScript modules. Use a local HTTP server or GitHub Pages; opening `index.html` directly as a file is no longer supported because browser module loading requires HTTP(S).

## Play

- Pick an 8×8, 10×10, or 12×12 board. Each size keeps its own run and top ten completed/restarted scores.
- Drag a piece, or select it and tap a cell for its top-left corner. Click a selected piece again to deselect it.
- The rotate button or **R** turns the selected piece 90° clockwise. With nothing selected, it turns all three pieces. Rotation is free and unlimited.
- Mouse wheel up/down rotates only the selected piece counterclockwise/clockwise. Ctrl+wheel keeps browser zoom behavior.
- Keyboard: **1–3** selects; **arrows** move the board cursor; **Enter/Space** places; **Escape** deselects.
- Complete rows and columns to clear them simultaneously. Each placement immediately replaces that one piece.
- The game ends when no actual tray piece fits, even after rotation. No timer, ads, accounts, analytics, or external assets.
- Optional sound is off by default. Light/dark mode and sound preferences are saved.

### Dealing and scores

There are 44 distinct shapes, including cups, rings, crosses, crowns, stairs, and zigzags, with random starting orientations.

Replacements never repeat the shape just played, including rotations. Already-held shapes have weight 0.015; shapes from an already-held family have weight 0.08; unrelated shapes have weight 1. New pieces avoid colors currently held.

When a held piece fits, 90% of draws are restricted to shapes that fit in at least one rotation, whenever such shapes exist. Other draws use the full eligible pool. If no held piece fits, a playable replacement is guaranteed whenever an eligible shape fits. The no-immediate-repeat rule always takes precedence. This does not guarantee that a whole sequence of future moves is solvable.

Score per move: **10 × squares placed + 100 × lines cleared² + 50 × extra consecutive clearing moves**.

## Code structure

```text
index.html              Accessible French page structure
assets/icon.svg         Browser icon
src/
  app.js                Startup and coordination between session and UI
  session.js            Current run, selection, board switching, and autosaving
  core/
    config.js           Shared board sizes, scoring, and dealing constants
    shapes.js           Shape patterns and their families, defined together
    geometry.js         Rotation, shape identity, placement, and fit checks
    dealer.js           Weighted, board-aware piece generation
    engine.js           Public game rules API, line clearing, and scoring
    validation.js       Saved board/piece validation
  services/
    storage.js          Version-compatible localStorage and score history
    audio.js            Optional Web Audio tones
  ui/
    dom.js              Small DOM, formatting, and accessibility helpers
    messages.js         French gameplay messages and help text
    view.js             Board/tray rendering, previews, and animations
    controls.js         Mouse, touch, wheel, and keyboard bindings
    dialogs.js          Help, scores, restart confirmation, and game-over dialogs
    theme.js            Theme preference and toggle
styles/
  main.css              Stylesheet entry point
  tokens.css            Shared light/dark colors and block palettes
  base.css              Typography and common controls
  layout.css            Height-aware desktop/mobile layout
  game.css              Board, pieces, stats, and game animations
  dialogs.css           Dialogs and leaderboard
scripts/
  serve.js              Dependency-free local HTTP server
  check.js              Syntax and local module/asset-reference checks
tests/
  engine.test.js        Rules, geometry, shape variety, and dealing regressions
  storage.test.js       Existing saves, autosave, sessions, and storage failures
```

Core modules never access the DOM or localStorage. `session.js` owns game transitions, `storage.js` owns the save envelope, and UI modules receive those objects rather than using global variables. Theme colors live in one token file instead of repeated dark-mode selector overrides.

## Check changes

```sh
node --test
node scripts/check.js
```

The equivalent npm commands are `npm test` and `npm run check` when npm is installed.

Tests cover all board sizes, 44 connected and distinct shapes, rotation, collisions, simultaneous clears, scoring, automatic game-over decisions, helpful dealing, no immediate repeat, selected/all-piece rotation through saves, legacy save loading, and blocked/full localStorage. `check` validates JavaScript syntax and local import/asset paths. It does not replace visual browser testing.

## Publish on GitHub Pages

1. Use a **public** repository for GitHub Pages on GitHub Free.
2. Upload this folder's **contents** to the repository root, including the entire `src`, `styles`, and `assets` directories. `index.html` must be directly at the root.
3. In **Settings → Pages**, choose **Deploy from a branch**, your publishing branch (`master` in the existing setup), and **/ (root)**. Save.
4. Wait for the Pages deployment to finish. Use the URL shown there, normally `https://USERNAME.github.io/REPOSITORY/`.

No npm install/build, backend, workflow file, or paid domain is required for hosting. All asset and module paths are relative, including inside CSS, so repository subpaths work.

### Updating from the previous flat layout

Upload the **entire new structure**, not just one JavaScript file. Ensure all new directories are present before replacing `index.html` when uploading in multiple commits. The new entry point is `src/app.js`.

The old root-level `engine.js`, `game.js`, `style.css`, `play-layout.css`, `theme.css`, `icon.svg`, and `tests/engine.test.cjs` are obsolete and can be deleted from the repository after the new files are uploaded. Leaving them temporarily will not affect the new game, because `index.html` no longer loads them.

Official Pages instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Saved data and customization

The storage key remains **`little-blocks.v1`**. The envelope and game-state fields retain compatibility with the previous release, preserving board cells, piece shapes/orientations/colors, score, lines, streak, moves, per-size history, and preferences. Autosave runs after every move and rotation. Closing the tab needs no extra save step.

Saves belong to a browser profile and site origin. Clearing site data deletes them; private browsing may discard them. Localhost and GitHub Pages have separate saves. Changing only code or repository paths on the same origin does not change the key. If storage is blocked or full, the UI reports that saving is unavailable and play continues in memory.

Change the dedication/title in `index.html`, French messages in `src/ui/messages.js`, palettes in `styles/tokens.css`, or scoring/dealing constants in `src/core/config.js`. To add a shape, add its `family` and `pattern` together in `src/core/shapes.js`, then update and run the catalog tests.
