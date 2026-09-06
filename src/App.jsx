import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Mesh from "./components/Mesh";
import Surface from "./components/Surface";
import ProjectPanel from "./components/ProjectPanel";
import BelowFold from "./components/BelowFold";
import { PROJECT_COUNT } from "./mesh";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * The stage's box, measured before React's first render.
 *
 * This exists because Framer's derived values do not recompute synchronously:
 * a MotionValue `.set()` propagates on the next frame, so a geometry
 * correction applied in a layout effect cannot reach the DOM before the first
 * paint no matter how early it runs. Measured on load, a hardcoded default of
 * 1200x800 put node 0 at x=484.8 on the first painted frame against an
 * authored t=0 coordinate of x=788.43 — a 304px pop on the first animation
 * frame. So the first render has to be right rather than corrected.
 *
 * A throwaway element carries the same sizing as `.stage` (full content width,
 * `height: 100svh`). The runway is `.reveal` height minus stage height, which
 * is 200svh - 100svh, i.e. the same 100svh. `html { overflow-y: scroll }`
 * keeps the scrollbar gutter present so this measures the same width the stage
 * will have once the page is tall enough to scroll.
 */
function probeStageBox() {
  if (typeof document === "undefined" || !document.body) {
    return { w: 1200, h: 800, runway: 800 };
  }
  const el = document.createElement("div");
  el.style.cssText =
    "position:absolute;top:0;left:0;width:100%;height:100svh;visibility:hidden;pointer-events:none;";
  document.body.appendChild(el);
  const r = el.getBoundingClientRect();
  el.remove();
  return { w: r.width, h: r.height, runway: r.height };
}

const sameTargets = (a, b) =>
  a.length === b.length &&
  a.every((t, i) => Math.abs(t.x - b[i].x) < 0.5 && Math.abs(t.y - b[i].y) < 0.5);

export default function App() {
  const revealRef = useRef(null);
  const stageRef = useRef(null);
  const surfaceRef = useRef(null);
  const dotRefs = useRef([]);

  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 720px)");

  // `runway` is the measured scroll distance over which the stage stays
  // pinned, i.e. reveal height minus stage height.
  const [geom, setGeom] = useState(probeStageBox);
  const [targets, setTargets] = useState(null);
  const [open, setOpen] = useState(null);
  const triggerRef = useRef(null);

  // Window scroll position in px. Progress is derived from a runway this
  // component measures itself rather than from useScroll's own target
  // measurement, which is taken once on mount and drifts out of agreement
  // with the svh-based layout the crossfade alignment depends on.
  const { scrollY } = useScroll();
  const linked = useTransform(scrollY, [0, Math.max(geom.runway, 1)], [0, 1]);
  const resolved = useMotionValue(1);
  const progress = reduced ? resolved : linked;

  /**
   * The mesh's resting coordinates come from the real surface rows, measured
   * relative to the surface section's own top-left. Layout-derived, so it
   * survives font loading and resize; recomputed only when layout changes.
   */
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const reveal = revealRef.current;
      if (stage && reveal) {
        const sr = stage.getBoundingClientRect();
        const rr = reveal.getBoundingClientRect();
        const next = {
          w: sr.width,
          h: sr.height,
          runway: Math.max(rr.height - sr.height, 1),
        };
        setGeom((prev) =>
          Math.abs(prev.w - next.w) < 0.5 &&
          Math.abs(prev.h - next.h) < 0.5 &&
          Math.abs(prev.runway - next.runway) < 0.5
            ? prev
            : next
        );
      }

      const surface = surfaceRef.current;
      const dots = dotRefs.current.slice(0, PROJECT_COUNT);
      if (!surface || dots.some((d) => !d)) return;
      const sr = surface.getBoundingClientRect();
      const next = dots.map((dot) => {
        const dr = dot.getBoundingClientRect();
        return {
          x: dr.left - sr.left + dr.width / 2,
          y: dr.top - sr.top + dr.height / 2,
        };
      });
      setTargets((prev) => (prev && sameTargets(prev, next) ? prev : next));
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (surfaceRef.current) ro.observe(surfaceRef.current);
    if (stageRef.current) ro.observe(stageRef.current);
    if (revealRef.current) ro.observe(revealRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // With reduced motion there is no unravel and no crossfade, so the mesh
  // rests in its own standalone layout rather than on top of the rows.
  const ctx = useMemo(
    () => ({
      w: geom.w,
      h: geom.h,
      runway: geom.runway,
      targets: reduced ? null : targets,
    }),
    [geom.w, geom.h, geom.runway, targets, reduced]
  );

  // The faint carry-over from the mesh: the chain through the row dots, plus a
  // few short stubs so it reads as a fragment of a larger graph.
  const web = useMemo(() => {
    if (!targets || targets.length < 2) return [];
    const chain = targets
      .slice(1)
      .map((t, i) => [targets[i].x, targets[i].y, t.x, t.y]);
    const first = targets[0];
    const last = targets[targets.length - 1];
    const mid = targets[Math.floor(targets.length / 2)];
    return [
      ...chain,
      [first.x, first.y, first.x - 34, first.y - 30],
      [mid.x, mid.y, mid.x + 44, mid.y - 22],
      [last.x, last.y, last.x - 28, last.y + 34],
    ];
  }, [targets]);

  const handleOpen = useCallback((project, element) => {
    triggerRef.current = element;
    const anchor = element.querySelector(".row-dot") || element;
    const r = anchor.getBoundingClientRect();
    setOpen({ project, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(null);
    triggerRef.current?.focus();
  }, []);

  return (
    <div className={reduced ? "app reduced" : "app"}>
      <div className="reveal" ref={revealRef}>
        <Mesh
          progress={progress}
          stageRef={stageRef}
          ctx={ctx}
          reduced={reduced}
        />
      </div>

      <main>
        <Surface
          ref={surfaceRef}
          dotRefs={dotRefs}
          web={web}
          onOpen={handleOpen}
          activeId={open?.project.id}
        />
        <BelowFold />
      </main>

      {/* "wait" keeps the spec's one-panel-at-a-time literally true: a second
          project cannot mount until the first has finished reversing out. */}
      <AnimatePresence mode="wait">
        {open && (
          <ProjectPanel
            key={open.project.id}
            project={open.project}
            origin={open.origin}
            onClose={handleClose}
            mobile={mobile}
            reduced={reduced}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
