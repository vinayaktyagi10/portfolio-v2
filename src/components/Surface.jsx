import { forwardRef, useState } from "react";
import { projects } from "../data";

/**
 * The resting state of the page. Deliberately plain: the mesh above measures
 * these rows to decide where its nodes come to rest, so this markup is the
 * layout authority for both sections.
 */
const Surface = forwardRef(function Surface(
  { dotRefs, web, onOpen, activeId },
  ref
) {
  // Which row the pointer (or focus) is on. Lines touching that row's dot
  // brighten; the dots one strand away pulse once in reply.
  const [hovered, setHovered] = useState(null);
  const touches = (line) => hovered !== null && (line.a === hovered || line.b === hovered);
  const near = (i) => hovered !== null && Math.abs(i - hovered) === 1;

  return (
    <section className="surface" ref={ref} id="work">
      <svg className="surface-web" aria-hidden="true">
        {web.map((line, i) => (
          <line
            key={i}
            className={touches(line) ? "lit" : undefined}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>

      <div className="surface-inner">
        <header className="intro">
          <h1>Vinayak Tyagi</h1>
          <p>Backend and infrastructure. A few things I've built.</p>
        </header>

        <ul className="projects">
          {projects.map((project, i) => (
            <li key={project.id}>
              <button
                type="button"
                className="row"
                aria-expanded={activeId === project.id}
                onClick={(e) => onOpen(project, e.currentTarget)}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
              >
                <span
                  className={near(i) ? "row-dot near" : "row-dot"}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                />
                <span className="row-name">{project.name}</span>
                <span className="row-line">{project.line}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export default Surface;
