import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import {
  EDGES,
  NODE_COUNT,
  NODE_RADIUS,
  PROJECT_COUNT,
  edgeStyle,
  labelOpacity,
  nodePos,
} from "../mesh";
import { projects } from "../data";

/**
 * One position MotionValue per node, combining the scroll-driven and
 * time-driven inputs. Owned by <Mesh> rather than by each <Node> so the
 * connector lines can read the *same* values the dots render from: if the
 * lines recomputed nodePos() themselves they could lag the dots by a frame
 * depending on update order, and the mesh would visibly come apart.
 *
 * NODE_COUNT is a module constant, so the hook count is stable across renders.
 */
function useNodePositions(progress, time, ctx) {
  return Array.from({ length: NODE_COUNT }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform([progress, time], ([p, t]) => nodePos(i, p, ctx, t))
  );
}

function Node({ i, pos, progress, reduced }) {
  const x = useTransform(pos, (v) => v.x);
  const y = useTransform(pos, (v) => v.y);
  const opacity = useTransform(pos, (v) => v.opacity);
  const labels = useTransform(progress, (p) => labelOpacity(p, reduced));
  // Project nodes stay as anonymous as the decoys until the mesh starts to
  // resolve — nothing in the tangle should read as significant. They settle on
  // the quiet accent, matching the surface row dot they hand off to.
  const tint = useTransform(progress, [0.3, 0.62], ["#2f6350", "#5a927e"]);

  const r = NODE_RADIUS[i];
  const project = i < PROJECT_COUNT ? projects[i] : null;

  return (
    <motion.div className="node" style={{ x, y, opacity }}>
      <motion.span
        className="node-dot"
        style={{
          width: r * 2,
          height: r * 2,
          marginLeft: -r,
          marginTop: -r,
          backgroundColor: project ? tint : "#2f6350",
        }}
      />
      {project && (
        <motion.span
          className="node-label"
          style={{ opacity: labels, left: r + 10 }}
        >
          {project.name}
        </motion.span>
      )}
    </motion.div>
  );
}

/**
 * Scroll-linked mesh with a pre-scroll idle drift. Node <div>s live in the
 * same CSS pixel space as the rest of the document; the SVG on top only
 * strokes the lines between them, reading the same position values.
 */
export default function Mesh({ progress, stageRef, ctx, reduced }) {
  const lineRefs = useRef([]);
  // Elapsed seconds, as a MotionValue rather than state: driving this through
  // React would re-render the tree every frame, which is the whole thing the
  // scroll side avoids.
  const time = useMotionValue(0);
  const positions = useNodePositions(progress, time, ctx);

  const draw = () => {
    const p = progress.get();
    for (let e = 0; e < EDGES.length; e += 1) {
      const line = lineRefs.current[e];
      if (!line) continue;
      const [a, b] = EDGES[e];
      const pa = positions[a].get();
      const pb = positions[b].get();
      const style = edgeStyle(a, b, p);
      line.setAttribute("x1", pa.x);
      line.setAttribute("y1", pa.y);
      line.setAttribute("x2", pb.x);
      line.setAttribute("y2", pb.y);
      // Decoy edges inherit the fade of the node they hang off.
      const nodeFade = Math.min(pa.opacity, pb.opacity);
      line.setAttribute("stroke-opacity", style.opacity * nodeFade);
      line.setAttribute("stroke-width", style.width);
    }
  };

  useAnimationFrame((elapsed) => {
    // Reduced motion gets no ambient animation at all. Past the unravel the
    // stage is faded out and every node's drift is damped to zero, so there is
    // nothing left to animate — don't hold a rAF loop open behind the surface.
    if (reduced || progress.get() >= 1) return;
    time.set(elapsed / 1000);
    draw();
  });

  // Covers the cases the frame loop skips: reduced motion, the settled state,
  // and geometry changes (resize, font load, first measurement).
  useMotionValueEvent(progress, "change", draw);
  useEffect(draw);

  const stageOpacity = useTransform(
    progress,
    [0, 0.9, 1],
    reduced ? [1, 1, 1] : [1, 1, 0]
  );
  // Same scroll value as the nodes, deliberately on a different range: the
  // copy arrives while the first strands are still coming apart, and is
  // settled well before they are. Nothing further happens to it after 0.3.
  const introOpacity = useTransform(progress, [0.1, 0.3], [0, 1]);
  const hintOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  return (
    <motion.div
      className="stage"
      ref={stageRef}
      style={{ opacity: stageOpacity }}
      aria-hidden="true"
    >
      <motion.div className="hero-intro" style={{ opacity: introOpacity }}>
        <p className="hero-name">Vinayak Tyagi</p>
        <p className="hero-tagline">A handful of systems I&rsquo;ve built and secured</p>
      </motion.div>

      <svg className="mesh-lines">
        {EDGES.map(([a, b], e) => (
          <line
            key={`${a}-${b}`}
            ref={(el) => {
              lineRefs.current[e] = el;
            }}
          />
        ))}
      </svg>

      {positions.map((pos, i) => (
        <Node key={i} i={i} pos={pos} progress={progress} reduced={reduced} />
      ))}

      {!reduced && (
        <motion.span className="scroll-hint" style={{ opacity: hintOpacity }}>
          scroll to resolve
        </motion.span>
      )}
    </motion.div>
  );
}
