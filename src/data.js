// Single source of truth for project content.
// `details` are label/value pairs rendered as the monospace block inside the depth panel.
export const projects = [
  {
    id: "mirage",
    name: "MIRAGE",
    line: "Deceptive SSH honeypot and threat-intelligence platform",
    panelLine:
      "Deceptive SSH honeypot and threat-intelligence platform. Two-person team, built from the protocol handshake up.",
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
    id: "warren",
    name: "WARREN",
    line: "Coordinated fraud-ring detection for payments",
    panelLine:
      "Coordinated fraud-ring detection for payments. Built and evaluated against the IBM AML dataset — 5M+ transfers, 370 labelled rings across 8 typologies.",
    details: [
      ["stack", "go · postgresql · union-find · logistic regression · gemini api"],
      ["rings", "union-find over ach transfers, sliced into overlapping time windows"],
      ["channel", "ach carries 86.6% of laundering value against 11.75% of ordinary traffic"],
      ["ranking", "12-feature logistic regression — coefficients that can be explained, not just predicted from"],
      ["gate", "policy layer overrides the model: block needs score ≥0.90 and confidence ≥0.80 under a value ceiling; malformed output routes to human review"],
      ["audit", "append-only hash-chained decision log, verified against real tamper attempts"],
      ["corrected", "baseline first favoured a simpler tabular scorer — two measurement errors found, the corrected and less flattering result published"],
    ],
    links: [{ label: "repo", href: "https://github.com/vinayaktyagi10/WARREN" }],
  },
  {
    id: "driftless",
    name: "driftless",
    line: "GPS-denied dead reckoning for Android",
    panelLine:
      "GPS-denied dead reckoning for Android — holding position through tunnels, urban canyons and parking structures.",
    details: [
      ["stack", "kotlin/android · c++ · python · onnx / tflite"],
      ["fusion", "unscented kalman filter over imu + gnss — square-root form, cholesky rank-1 covariance updates, so(3) rotations"],
      ["matching", "hmm map matcher corrects drift by snapping the fused trajectory back onto the road network"],
      ["tests", "sigma-point generation, predict/update, drift characterisation — each numerical component validated in isolation, not only end-to-end"],
      ["model", "tcn estimates forward speed and heading from imu alone, exported to onnx/tflite for on-device inference"],
      ["evidence", "cross-validation, allan-variance imu noise characterisation, held-out blackout error — not a single accuracy number"],
      ["blackouts", "manual gnss-blackout injection, since tunnels cannot be summoned on demand"],
    ],
    links: [{ label: "repo", href: "https://github.com/vinayaktyagi10/driftless" }],
  },
  {
    id: "novaforge",
    name: "NovaForge",
    line: "Multi-factor approval and audit platform",
    panelLine:
      "Multi-factor approval and audit platform. Tally CodeBrewers finalist.",
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
