# CappyCalc marketing

One folder per day: `brief.md` (marketing plan), `render.mjs` (media script), the rendered files
(`reel.mp4`, `carousel-*.png`, `x-*.png`, `story.png`, `*-preview.jpg`) and `posting-guide.md`
(what to post where, with captions). Nothing here is posted automatically.

Pushing a changed `render.mjs` triggers `.github/workflows/media.yml`, which renders it with
`scripts/media/lib.mjs` from `main` and commits the files back.
