import { forwardRef } from "react";
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
  return (
    <section className="surface" ref={ref} id="work">
      <svg className="surface-web" aria-hidden="true">
        {web.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
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
              >
                <span
                  className="row-dot"
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
