// Blog writeups dataset
const BLOG_DATA = [
  {
    title: "Inside the 44,000: What I Learned Running a Go SSH Honeypot",
    date: "June 24, 2026",
    tag: "Security",
    readTime: "7 min read",
    summary: "An analysis of automated scanner payloads, the most common passwords bots attempt, and how I emulated stateful directories in Go to keep attackers connected.",
    link: "blog-post-honeypot.html"
  },
  {
    title: "The 24-Hour RCE Patch: Incident Response Under Pressure",
    date: "May 18, 2026",
    tag: "Systems",
    readTime: "5 min read",
    summary: "A timeline post-mortem of discovering a CVSS 10.0 Remote Code Execution disclosure, compiling tested hotfixes, and rolling them out securely across 45 repositories.",
    link: "#"
  },
  {
    title: "Docker Diet: Shaving 82% Off Production Container Footprints",
    date: "April 11, 2026",
    tag: "Docker",
    readTime: "4 min read",
    summary: "How I refactored our deployment configs to use multi-stage Docker builds and Alpine base images, saving bandwidth and storage across production pipelines.",
    link: "#"
  },
  {
    title: "Orchestrating Infrastructure for 2,100+ Active Users",
    date: "February 28, 2026",
    tag: "Systems",
    readTime: "8 min read",
    summary: "A deep dive into self-hosting scalable educational infra: network isolation via Tailscale, handling backup sync loops, and resource limitation configurations.",
    link: "#"
  }
];
