import { experience, skills } from "../data";

export default function BelowFold() {
  return (
    <div className="below">
      <section className="block">
        <h2>Skills</h2>
        <dl className="skills">
          {skills.map(([group, list]) => (
            <div key={group}>
              <dt>{group}</dt>
              <dd>{list}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="block recognition">
        <h2>Recognition</h2>
        <p className="citation">
          MIRAGE&rsquo;s dataset was cited in Dr. Johannes Ullrich&rsquo;s
          SANSFire 2026 keynote, <span className="mono">Skynet 1.0</span>.
        </p>
        <p className="attribution">
          Dr. Johannes Ullrich is Dean of Research and Director of the SANS
          Internet Storm Center, and founder of DShield.org.
        </p>
      </section>

      <section className="block">
        <h2>Experience</h2>
        <ul className="experience">
          {experience.map((item) => (
            <li key={item.role}>
              <div className="exp-head">
                <span className="exp-role">{item.role}</span>
                <span className="mono exp-dates">{item.dates}</span>
              </div>
              <p className="exp-org">{item.org}</p>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="block open-source">
        <h2>Open source</h2>
        <p>
          Contributed to the Honeynet Project&rsquo;s{" "}
          <a href="https://github.com/honeynet/eventhorizon">EventHorizon</a> —
          added real-time attacker input capture to the Telnet tarpit and
          extended the Go Prometheus exporter; PR merged to main.
        </p>
      </section>

      <footer className="block contact">
        <h2>Contact</h2>
        <p>
          <a href="mailto:vinayaktyagi.ed@gmail.com">vinayaktyagi.ed@gmail.com</a>
        </p>
        <p>
          <a href="https://github.com/vinayaktyagi10">GitHub</a>
        </p>
        <p>
          <a href="https://linkedin.com/in/vinayaktyagi10">LinkedIn</a>
        </p>
        <p>
          <a href="/resume.pdf">Resume</a>
        </p>
      </footer>
    </div>
  );
}
