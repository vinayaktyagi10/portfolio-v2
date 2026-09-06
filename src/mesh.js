// Mesh geometry. Pure functions so the node <div>s and the SVG connector lines
// are driven by exactly one position calculation — no second source of truth.

export const PROJECT_COUNT = 5;
export const NODE_COUNT = 10;

// Deliberately knotted start: everything crowded into the middle so no
// individual node reads as meaningful.
const TANGLE = [
  [0.404, 0.384], [0.593, 0.516], [0.482, 0.646],
  [0.323, 0.562], [0.677, 0.372], [0.524, 0.264],
  [0.269, 0.484], [0.731, 0.602], [0.410, 0.742], [0.647, 0.696],
];

// Where the five unlabelled nodes drift before fading out.
const DECOY_REST = [
  [0.115, 0.180], [0.868, 0.243], [0.196, 0.812],
  [0.902, 0.700], [0.724, 0.126],
];

// Fallback resting spots for the project nodes, used only when the surface
// rows have not been measured yet (first paint, reduced motion).
const PROJECT_FALLBACK = [
  [0.22, 0.32], [0.41, 0.24], [0.58, 0.46], [0.76, 0.34], [0.44, 0.66],
];

// Each node starts moving at a different scroll progress, so the knot comes
// apart strand by strand rather than all at once. The decoys (5-9) go first;
// the labelled projects resolve last, so the payload arrives after the noise
// has cleared.
// DELAY[4] is 0.16 rather than 0.18 to keep the WARREN and MUJ Placement Kite
// labels from crossing: at 0.18 their boxes overlapped by up to 32px between
// p 0.483 and 0.499.
const DELAY = [0.34, 0.30, 0.26, 0.22, 0.16, 0.02, 0.06, 0.10, 0.04, 0.12];

export const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 7], [7, 2], [1, 6], [6, 9], [4, 8],
  [8, 0], [3, 6], [9, 2], [5, 4], [7, 1], [8, 9], [6, 0], [4, 7],
];
// The connectors that survive the unravel as quiet architecture lines: the
// chain through the project nodes, which resolves into the vertical run of
// row dots on the surface below.
const PERSISTENT = new Set(["0-1", "1-2", "2-3", "3-4"]);
export const edgeKey = (a, b) => `${a}-${b}`;
export const isPersistent = (a, b) => PERSISTENT.has(edgeKey(a, b));

// Sized by significance; MIRAGE is the flagship and reads largest.
export const NODE_RADIUS = [7.5, 5.5, 5.5, 5, 4.5, 2, 2.5, 2, 2.5, 2];

// Idle drift. Distinct phases so the nodes never wander in unison, and two
// incommensurate frequencies per axis so the path does not visibly loop.
const DRIFT_PHASE = [0, 1.7, 3.4, 0.9, 2.6, 4.3, 1.2, 5.1, 2.2, 3.9];
const DRIFT_SCALE = [1, 0.9, 0.95, 1.15, 1.05, 1.2, 1.1, 1, 1.15, 0.95];
const DRIFT_PX = 2.1;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Position of node `i` at scroll progress `p`.
 *
 * For the three project nodes the resting target is the measured offset of the
 * matching surface row, taken relative to the surface section's own top edge.
 * That offset is layout-derived and stable; the surface's live viewport
 * position during the pinned range is added back analytically as
 * `(1 - p) * runway`, where `runway` is the measured pinned scroll distance.
 * Because progress is defined as scrollY / runway, that term is exactly the
 * surface's current viewport top and reaches zero precisely when the stage
 * unpins — so node and row stay aligned throughout the crossfade without
 * re-measuring a moving element every frame.
 *
 * `time` (seconds) adds the pre-scroll idle drift. It is damped to exactly
 * zero by the time the node has resolved, so it cannot disturb the landing.
 */
export function nodePos(i, p, { w, h, runway, targets }, time = 0) {
  const [sxN, syN] = TANGLE[i];
  const sx = sxN * w;
  const sy = syN * h;

  const isProject = i < PROJECT_COUNT;
  let tx;
  let ty;
  if (isProject) {
    const measured = targets && targets[i];
    if (measured) {
      tx = measured.x;
      ty = measured.y + (1 - p) * runway;
    } else {
      tx = PROJECT_FALLBACK[i][0] * w;
      ty = PROJECT_FALLBACK[i][1] * h;
    }
  } else {
    const [dx, dy] = DECOY_REST[i - PROJECT_COUNT];
    tx = dx * w;
    ty = dy * h;
  }

  const delay = DELAY[i];
  const t = easeInOut(clamp01((p - delay) / (1 - delay)));
  const x = sx + (tx - sx) * t;
  const y = sy + (ty - sy) * t;

  // Idle drift, damped by this node's own journey rather than by a separate
  // breakpoint: `1 - t` is exactly 0 when the node finishes interpolating, and
  // t reaches exactly 1 at p = 1 for every node. So the drift cannot leave a
  // sub-pixel residue on the surface row dots at the handoff, and each strand
  // stops breathing as it resolves rather than all of them at one cliff.
  const damp = 1 - t;
  let dx = 0;
  let dy = 0;
  if (damp > 0) {
    const ph = DRIFT_PHASE[i];
    const amp = DRIFT_PX * DRIFT_SCALE[i] * damp;
    // Each axis is measured from its own value at t = 0, so every node starts
    // exactly on its authored tangle coordinate and eases away from it. Adding
    // the raw sinusoid instead would snap each node to its phase offset on the
    // first animation frame — a visible pop on load.
    dx =
      amp *
      (0.7 * (Math.sin(time * 0.99 + ph) - Math.sin(ph)) +
        0.3 * (Math.sin(time * 0.61 + ph * 1.7) - Math.sin(ph * 1.7)));
    dy =
      amp *
      (0.7 * (Math.cos(time * 0.85 + ph * 1.3) - Math.cos(ph * 1.3)) +
        0.3 * (Math.cos(time * 0.52 + ph * 0.6) - Math.cos(ph * 0.6)));
  }

  // Decoys thin out as the real structure emerges.
  const opacity = isProject ? 1 : 1 - clamp01((p - 0.42) / 0.36);

  return { x: x + dx, y: y + dy, opacity };
}

/** Opacity + stroke width of an edge at progress `p`. */
export function edgeStyle(a, b, p) {
  if (isPersistent(a, b)) {
    return { opacity: 0.55 + 0.35 * (1 - clamp01(p / 0.8)), width: 0.5 };
  }
  return { opacity: 0.75 * (1 - clamp01((p - 0.12) / 0.5)), width: 0.5 };
}

/**
 * Label opacity — names arrive once the nodes are visibly separating, then
 * retire just before the surface row text fades up underneath them, so the
 * two never read on top of each other. Only the dot crosses the handoff.
 * With reduced motion there is no crossfade, so the label simply stays.
 */
export function labelOpacity(p, reduced) {
  if (reduced) return 1;
  const arrive = clamp01((p - 0.44) / 0.28);
  const retire = 1 - clamp01((p - 0.86) / 0.1);
  return arrive * retire;
}
