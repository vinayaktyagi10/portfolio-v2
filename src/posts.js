// Single source of truth for writing. Read by vite.config.js (which pages to
// build), the home page's Writing section, and the /writing/ index.
//
// A post is a static page at writing/<slug>/index.html, plus any extra pages
// in `pages` (writing/<slug>/<page>/index.html). Only `published` posts are
// built and listed; drafts are served and listed (marked as drafts) by
// `npm run dev` only. `title` must match the page's <h1>; the build fails if
// it does not, so the lists can never drift from the pages.
export const POSTS = [
  {
    slug: "mirage-miner",
    title: "What an SSH honeypot's logs led to: from a payload URL to a cryptocurrency miner",
    description:
      "What my SSH honeypot Mirage captured, followed from a payload URL in its logs to a cryptocurrency miner I took apart in an isolated VM.",
    date: "2026-10-11",
    published: true,
    pages: ["data"],
  },
];

/** Posts to show, newest first. Drafts only when `includeDrafts` (dev). */
export const listedPosts = (includeDrafts) =>
  POSTS.filter((post) => post.published || includeDrafts).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

export const postHref = (post) => `/writing/${post.slug}/`;
