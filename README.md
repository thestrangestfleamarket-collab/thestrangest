# thestrangest

The Strangest Flea Market, rebuilt in three.js a piece at a time. THE MARKET is live at https://thestrangestfleamarket.com
(this repo is the whole site; merging to `main` deploys it).

Build: `npm install` once, then `python3 build.py` → `dist/market.html` (the single page the tests drive), `dist/door.html` and
`dist/g/` (what the website serves). See `CLAUDE.md`, and `docs/MAP.md` (written by `node tools/map.cjs` or the build) for what each source file needs and gives.
