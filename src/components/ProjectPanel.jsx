import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Pointer tilt at the panel's edge, in degrees. 0 disables it. Kept small on
// purpose: a 3D-transformed layer loses subpixel text rendering, and the
// panel is the page's densest reading surface.
const TILT_DEG = 1.6;

let scrollLocks = 0;

function lockScroll() {
  const root = document.documentElement;
  if (scrollLocks === 0) root.style.overflow = "hidden";
  scrollLocks += 1;
  return () => {
    scrollLocks -= 1;
    if (scrollLocks === 0) root.style.overflow = "";
  };
}

/**
 * Panel box in viewport px, plus the transform-origin that maps to the click.
 *
 * The panel is anchored by its top edge and sized to its content rather than
 * filling a fixed box: the depth register is meant to read dense, and a
 * five-row panel stretched to 78vh is mostly void. Top-anchoring keeps the
 * geometry known before the content is measured, so the zoom origin is right
 * on the first frame.
 */
function geometry(origin) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.8, 960);
  const left = (vw - width) / 2;
  const top = Math.round(vh * 0.11);
  const maxHeight = Math.round(vh * 0.78);
  return {
    width,
    left,
    top,
    maxHeight,
    ox: clamp(origin.x - left, 0, width),
    oy: clamp(origin.y - top, 0, maxHeight),
  };
}

export default function ProjectPanel({ project, origin, onClose, mobile, reduced }) {
  const panelRef = useRef(null);
  // Always computed, even on mobile: the viewport can cross the breakpoint
  // while the panel is open, and the desktop branch needs a box to read.
  const [box, setBox] = useState(() => geometry(origin));
  // Content only appears once the panel has finished scaling.
  const [settled, setSettled] = useState(reduced || mobile);
  // The long description is opt-in. The panel's job is to stay dense; a
  // reader who wants the whole story asks for it.
  const [expanded, setExpanded] = useState(false);

  // Pointer tilt, desktop only. TILT_DEG at the panel's edge, sprung so it
  // settles rather than tracks. The transform composes with the zoom's scale
  // and keeps the zoom's origin: a rotation about an off-centre point is still
  // a tilt, just with a few px of drift the spring absorbs.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltSpring = { stiffness: 140, damping: 22, mass: 0.5 };
  const rotateX = useSpring(tiltX, tiltSpring);
  const rotateY = useSpring(tiltY, tiltSpring);

  useLayoutEffect(() => {
    const onResize = () => setBox(geometry(origin));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [origin]);

  // Escape to close, Tab trapped inside the panel.
  useEffect(() => {
    const node = panelRef.current;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Lock scrolling without position:fixed, which would lose scroll position.
  // Refcounted rather than save-and-restore: if two panels are ever mounted at
  // once, the second would capture "hidden" as the value to restore and the
  // last close would leave the page permanently unscrollable.
  useEffect(() => lockScroll(), []);

  useEffect(() => {
    panelRef.current?.querySelector(".panel-close")?.focus();
  }, []);

  const zoom = !mobile && !reduced;

  const onTilt = (e) => {
    if (!zoom || !settled || !panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltX.set(-ny * TILT_DEG);
    tiltY.set(nx * TILT_DEG);
  };
  const onTiltEnd = () => {
    tiltX.set(0);
    tiltY.set(0);
  };
  const animation = mobile
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { duration: 0.34, ease: [0.22, 0.9, 0.3, 1] },
      }
    : zoom
    ? {
        initial: { scale: 0.04, opacity: 0.5 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.04, opacity: 0 },
        transition: { duration: 0.42, ease: [0.22, 0.9, 0.3, 1] },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  const style = mobile
    ? undefined
    : {
        left: box.left,
        top: box.top,
        width: box.width,
        maxHeight: box.maxHeight,
        transformOrigin: `${box.ox}px ${box.oy}px`,
        ...(zoom && TILT_DEG > 0 ? { rotateX, rotateY, transformPerspective: 1400 } : {}),
      };

  // The trace lights step by step once the panel has settled: step i, then the
  // rail out of it, then step i + 1. With reduced motion it is simply lit.
  const steps = project.trace ? project.trace.split(" → ") : [];
  const [lit, setLit] = useState(reduced ? steps.length : 0);
  useEffect(() => {
    if (reduced || !settled || steps.length === 0) return undefined;
    let n = 0;
    const tick = () => {
      n += 1;
      setLit(n);
      if (n < steps.length) timer = setTimeout(tick, 420);
    };
    let timer = setTimeout(tick, 650);
    return () => clearTimeout(timer);
  }, [reduced, settled, steps.length]);

  const reveal = (i) => ({
    initial: { opacity: 0, y: 6 },
    animate: settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    transition: { duration: 0.3, delay: settled ? i * 0.12 : 0 },
  });

  return (
    <>
      <motion.div
        className="scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className={mobile ? "panel panel-sheet" : "panel"}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`panel-title-${project.id}`}
        style={style}
        {...animation}
        onAnimationComplete={() => setSettled(true)}
        onPointerMove={onTilt}
        onPointerLeave={onTiltEnd}
      >
        <button type="button" className="panel-close" onClick={onClose}>
          close
          <span className="panel-close-key">esc</span>
        </button>

        <div className="panel-body">
          <motion.h2 id={`panel-title-${project.id}`} {...reveal(0)}>
            {project.name}
          </motion.h2>
          <motion.p className="panel-line" {...reveal(1)}>
            {project.panelLine}
          </motion.p>

          {project.about && (
            <motion.div className="panel-about" {...reveal(2)}>
              <button
                type="button"
                className="panel-about-toggle"
                aria-expanded={expanded}
                aria-controls={`panel-about-${project.id}`}
                onClick={() => setExpanded((v) => !v)}
              >
                <span className="panel-about-sign" aria-hidden="true">
                  {expanded ? "\u2212" : "+"}
                </span>
                {expanded ? "less" : "read more"}
              </button>

              {/* Height is animated rather than toggled so the detail rows
                  below slide instead of jumping. `overflow: hidden` on the
                  body is what makes height:auto animatable. */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    id={`panel-about-${project.id}`}
                    className="panel-about-body"
                    initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{
                      duration: reduced ? 0.15 : 0.32,
                      ease: [0.22, 0.9, 0.3, 1],
                    }}
                  >
                    {project.about.map((para) => (
                      <p key={para.slice(0, 32)}>{para}</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.dl className="panel-details" {...reveal(3)}>
            {project.details.map(([label, value]) => (
              <div className="detail" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {/* One more row of the same block, so a project without links
                simply has one fewer row rather than a gap where one would be. */}
            {project.links && (
              <div className="detail">
                <dt>links</dt>
                <dd className="detail-links">
                  {project.links.map((link, i) => (
                    <span key={link.label}>
                      {i > 0 && <span aria-hidden="true"> / </span>}
                      <a href={link.href}>{link.label}</a>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </motion.dl>

          {steps.length > 0 && (
            <motion.ul className="panel-trace" aria-label="trace" {...reveal(4)}>
              {steps.map((step, i) => (
                <li className={i < lit ? "trace-step lit" : "trace-step"} key={step}>
                  <span className="trace-dot" aria-hidden="true" />
                  {step}
                  {i < steps.length - 1 && (
                    <span
                      className={i + 1 <= lit ? "trace-rail lit" : "trace-rail"}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </motion.div>
    </>
  );
}
