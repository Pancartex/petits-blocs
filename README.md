# Little Blocks

A cozy, ad-free endless block puzzle, made for someone special. Original artwork and code; inspired by the block-puzzle genre, not affiliated with Blockanza.

## Play

Open `index.html` in a modern browser. No installs, build tools, accounts, ads, analytics, fonts, libraries, or external requests are required. For consistent localStorage behavior, use the published HTTPS site or a local web server rather than relying on file URLs.

- Choose an 8×8, 10×10, or 12×12 board. Each size remembers its own run, personal best, and ten completed/restarted scores.
- Drag a piece, or select it and tap a cell to place its top-left corner. Rotation is always free. The rotate button (or R) rotates the selected piece 90° clockwise, or all three pieces when none is selected. Mouse-wheel rotation affects only the selected piece.
- Fill whole rows or columns. All completed lines clear simultaneously. Every placed piece is immediately replaced; the other two stay available. The pool contains 29 shapes with random orientations, including crosses, cups, stairs, long zigzags, and branched pieces.
- No timer. A run ends only when no remaining piece fits in any rotation.
- Keyboard: 1–3 select, R rotates, arrows move the board cursor, Enter/Space places, Escape deselects.
- Sound is optional and off by default.
- Replacement pieces never repeat the shape just played (including rotated versions). Shapes already held have a 0.015 generation weight; related shape families have a 0.08 weight, versus 1 for unrelated shapes. New pieces avoid colors already in the tray.
- Use the top-bar theme toggle for light/dark mode. Both palettes use distinct, saturated block colors; your theme preference is saved.

Score: 10 points per placed square + 100 × (lines cleared on that move)². Consecutive clearing moves add 50 × (streak length − 1).

## Publish for free on GitHub Pages

1. Create a **public** GitHub repository (Pages is available for public repositories on GitHub Free).
2. Put the contents of this folder in the repository root, and commit/push to `main`. `index.html` must be at the root, not inside another folder.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then **Save**.
5. After deployment finishes, Pages shows the URL, typically `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

No GitHub Actions workflow, build step, domain purchase, or backend is needed. All paths are relative so repository subpaths work.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Personalize

Change the title, “Made for you” note, and subtitle in `index.html`. Colors are the CSS custom properties at the start of `style.css`. `icon.svg` is the browser icon.

## Saved data

The `little-blocks.v1` localStorage key stores the three boards, scores, bests, selected board size, and sound preference. Saves happen after every move, rotation, and size change. Restarted runs also enter the score list. Scores are local to the browser, device, and site origin; they do not sync between devices. Clearing site data deletes saves, and private browsing may discard them on exit. If storage is blocked or full, the game stays playable and shows a saving-unavailable message. The browser may share the origin with other repositories under the same GitHub username, so rename the storage key if hosting independent copies.

## Developer checks

With Node.js installed: `node --test tests/engine.test.cjs`.

The game uses plain browser JavaScript; Node.js is only needed for the optional tests. Tests cover simultaneous clears, collisions, rotations, game-over decisions, all board sizes, and save validation.


