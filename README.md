# portfolio-v3

Personal site. Calm surface, dense underneath.

```
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Layout

`src/mesh.js` is the geometry: `nodePos(i, p, ctx)` returns a node's position at
scroll progress `p`, and is the single source of truth for both the node
elements and the SVG connector lines.

`src/App.jsx` owns measurement. It measures the pinned scroll distance
(`runway`) and each surface row dot's offset within the surface section, then
derives scroll progress from `runway` so that `p = 1` coincides exactly with the
stage unpinning — which is what keeps the mesh's resting state aligned with the
surface rows it crossfades into. Both are re-measured on resize and font load.

The structural trick lives in `src/index.css`: `.reveal` is 200svh with a 100svh
sticky `.stage` inside it, and `main` is pulled up by `-100svh` so the surface
sits directly beneath the stage at the moment the stage fades out.

The palette is all-dark and every text colour was chosen against a measured
contrast ratio, not by eye. `contrast-check.py` takes a list of
`(label, foreground, background, px)` tuples and reports WCAG AA/AAA per pair;
the shipped palette clears AA everywhere, lowest 4.94:1.

See `DECISIONS.md` for why each of those is the way it is.
