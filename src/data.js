// Single source of truth for project content.
// `details` are label/value pairs rendered as the monospace block inside the depth panel.
export const projects = [
  {
    id: "mirage",
    name: "MIRAGE",
    line: "Deceptive SSH honeypot and threat-intelligence platform",
    panelLine:
      "Deceptive SSH honeypot and threat-intelligence platform. Two-person team, built from the protocol handshake up.",
    about: [
      "MIRAGE is a real SSH server that isn't one. It speaks the protocol handshake from the ground up in Go, checks incoming credentials against a seeded list of real-world weak pairs, and lets the matches through into a stateful fake shell while rejecting everything else the way a minimally hardened sshd would. It is a purely defensive research tool on infrastructure we own. The aim is to measure, at scale, what automated attackers actually do once they believe they are inside.",
      "The shell is byte-by-byte rather than scripted. It backs onto a single consistent filesystem tree, handles pipes, redirects and command chaining, substitutes subshells, and persists a working directory per session — so an attacker who changes directory and comes back finds what they left. Bait files in the tree generate real, recorded triggers when touched. Every auth attempt, client banner and inter-command timing signal is written to PostgreSQL behind an API-key-gated REST API, and a versioned dataset is published from the live sensor each week.",
      "A Python worker polls for unenriched sessions and adds weak-label attacker classification, MITRE ATT&CK technique mappings and STIX 2.1 bundles. A dual-channel Transformer over token sequences and log-scaled command timing is written but has no trained checkpoint deployed, so the classifications in the data today are heuristics, and they are labelled as heuristics wherever the numbers are reported.",
      "Four data-validity checks run continuously: accept-rate band drift, field-cardinality collapse, campaign-versus-aggregate decomposition, and a sensor heartbeat that keeps \"the sensor was down\" from being read as \"nobody connected\". They exist because an outside reviewer caught a silent corruption the system itself had missed. Live traffic turned up its own bugs too — a concurrency race corrupting session state across parallel SSH channels, a flood-triggered OOM, and two auth-bypass holes closed after deployment.",
    ],
    details: [
      ["stack", "go · postgresql · python · prometheus"],
      ["shell", "byte-by-byte fake interactive shell, per-session cwd persisted"],
      ["pipeline", "postgres session store behind /api/sessions · /api/export · /api/stats"],
      ["sessions", "concurrency race across parallel ssh channels fixed, flood OOM bounded"],
      ["exposed", "2 auth-bypass bugs closed post-deploy — open /metrics, path traversal in llm egress gate"],
      ["cited", "dataset cited in j. ullrich's sansfire 2026 keynote — skynet 1.0"],
    ],
    trace: "conn accepted → shell spawned → session logged → export ready",
    links: [
      { label: "repo", href: "https://github.com/mirage-source/mirage-core" },
      { label: "doi", href: "https://doi.org/10.17605/OSF.IO/JM4E7" },
      { label: "live", href: "https://mirage.vtyagi.dev" },
    ],
  },
  {
    id: "novaforge",
    name: "NovaForge",
    line: "Multi-factor approval and audit platform",
    panelLine:
      "Multi-factor approval and audit platform. Tally CodeBrewers finalist.",
    about: [
      "NovaForge is a passwordless-first authentication platform built around a question most auth systems leave alone: what happens when one person's approval is not enough? WebAuthn passkeys are the primary factor, with TOTP and scrypt-hashed single-use recovery codes as fallbacks. Regenerating those codes takes a fresh passkey signature rather than a valid session, so holding a session is not by itself enough to mint a new way in. It started at the Tally CodeBrewers hackathon, where it was a finalist, and is maintained independently now.",
      "Sessions degrade instead of expiring. Trust decays five points an hour from the last check-in and sensitive writes are refused below a threshold, so a long-idle session loses its powers gradually rather than all at once at a cliff. Every authenticated request re-checks that its session still exists, which means revoking a device from another one takes effect on that device's next request rather than whenever its token happens to run out.",
      "The approval engine does M-of-N, role-based and weighted quorum, each configurable per action type with an escalation timeout and a fallback policy. A request that blows past its deadline reassigns to the fallback, or expires closed if there isn't one. Casting a vote takes a fresh WebAuthn signature and the raw assertion is stored on the vote row, so \"did you approve this\" has a cryptographic answer rather than a log line.",
      "Every meaningful event is hash-chained into a tamper-evident audit log with one-click integrity verification, readable only by super admins. There is no self-service route to becoming the first super admin: that account is promoted by hand, in SQL.",
    ],
    details: [
      ["stack", "node.js · typescript · prisma · react"],
      ["auth", "webauthn passkeys, totp fallback, scrypt recovery codes behind a fresh signature"],
      ["sessions", "trust-decay with per-request revocation instead of hard expiry"],
      ["policy", "m-of-n · role-based · weighted quorum, escalation timeouts, fail-closed"],
      ["audit", "hash-chained tamper-evident log, votes signed non-repudiably by webauthn"],
    ],
    links: [{ label: "repo", href: "https://github.com/vinayaktyagi10/NovaForge" }],
  },
  {
    id: "kite",
    name: "MUJ Placement Kite",
    line: "Placement cell platform",
    panelLine: "Placement cell platform for the university placement office.",
    about: [
      "MUJ Placement Kite is the platform the university placement office runs its hiring cycle on. It replaces spreadsheets, fragmented workflows and rule enforcement done by hand. Eligibility is the part that is genuinely hard to enforce manually at scale: whether a student can apply depends on their previous offers, their placement level, how many attempts they have spent, and CTC-based conditions on top of that. The system is the source of truth for the cycle, so those rules have to live in one place and be checkable.",
      "I built the student module end to end — profiles, a draft-request approval workflow, RBAC, rate limiting and document uploads — plus a bulk-upload pipeline that parses UG and PG Excel templates generically instead of branching per template. It is idempotent because a placement office re-uploads a corrected sheet as a matter of course, and the second upload must not double the roster.",
      "Audit logging covers twelve write paths, and the hiring workflow tracks a placement cycle round by round: pass and fail outcomes, roster state, Excel export. Mail leaves through an SMTP worker pool over Redis streams, so a slow provider queues instead of blocking the request that triggered it. The architecture is a single deployable with hard module boundaries, and stays that way: no microservices, no event sourcing, no Kafka until scale asks for them.",
    ],
    details: [
      ["stack", "go · postgresql · redis · cloudinary"],
      ["student", "profiles, draft-request approval workflow, rbac, rate limiting, document uploads"],
      ["ingest", "idempotent bulk upload parsing ug/pg excel templates generically"],
      ["audit", "write-path logging across 12 mutations, placement-cycle hiring workflow tracked"],
      ["mail", "smtp worker pool over redis streams for async delivery"],
    ],
  },
];


export const skills = [
  ["Languages", "Go, Python, TypeScript, Bash, C, Java"],
  ["Infra", "Docker, Tailscale, Cloudflare, Prometheus, Grafana"],
  ["Data", "PostgreSQL, Redis, MongoDB, Supabase"],
];

export const experience = [
  {
    role: "DevOps Intern",
    org: "Software Development Centre, Manipal University Jaipur",
    dates: "Aug 2025 — Present",
    points: [
      "Patched CVE-2025-55182, a critical unauthenticated RCE, across 8 production services within 24 hours.",
      "Restructured Dockerfiles and CI/CD workflows across 45 repositories, cutting image sizes by up to 82%.",
      "Deployed a Tailscale zero-trust mesh, eliminating public SSH exposure.",
    ],
  },
  {
    role: "B.Tech, Computer Science & Engineering",
    org: "Manipal University Jaipur",
    dates: "2024 — 2028",
    points: ["CGPA 8.06"],
  },
];
