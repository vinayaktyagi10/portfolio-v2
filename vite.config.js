import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { POSTS, listedPosts, postHref } from './src/posts.js'

const page = (path) => fileURLToPath(new URL(path, import.meta.url))

// Link to the mirage-research repo, rendered where a post has
// `<!-- repo-link -->`. Pinned to the tag the post describes, so the link
// keeps matching the text when the repo moves on. null hides it.
const REPO_URL = 'https://github.com/vinayaktyagi10/mirage-research/tree/writeup-v1.1'

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Which pages get built. Everything that links anywhere asks this first, so a
// deployed page never links to one that was not built.
const published = POSTS.filter((post) => post.published)
const postPages = (post) =>
  ['', ...(post.pages ?? [])].map((sub) => (sub ? `writing/${post.slug}/${sub}` : `writing/${post.slug}`))

/**
 * Shared chrome for the static writing pages, filled in from src/posts.js:
 * <!-- site-header -->, <!-- site-footer -->, <!-- draft-banner -->,
 * <!-- reading-time -->, <!-- post-list -->, <!-- repo-link -->.
 */
function writingChrome() {
  let dev = false
  return {
    name: 'writing-chrome',
    configResolved(config) {
      dev = config.command === 'serve'
    },
    transformIndexHtml(html, ctx) {
      // The home page is React; it reads src/posts.js itself.
      if (!html.includes('<!-- site-header -->')) return html

      const path = ctx.path.replace(/index\.html$/, '')
      const m = path.match(/^\/writing\/([^/]+)\/(?:([^/]+)\/)?$/)
      const post = m && POSTS.find((p) => p.slug === m[1])
      const writingExists = dev || published.length > 0

      if (post && !m[2] && !html.includes(`<h1>${post.title}</h1>`)) {
        throw new Error(`writing/${post.slug}: <h1> does not match the title in src/posts.js`)
      }

      const nav = writingExists
        ? `<a href="/writing/"${path === '/writing/' ? ' aria-current="page"' : ''}>Writing</a>`
        : ''
      const header = `<header class="site-header"><div class="site-header-inner">
        <a class="site-name" href="/">Vinayak Tyagi</a>
        <nav aria-label="Site">${nav}<a href="/resume.pdf">Resume</a></nav>
      </div></header>`

      const back =
        post && writingExists ? `<p class="site-footer-back"><a href="/writing/">← All writing</a></p>` : ''
      const footer = `<footer class="site-footer"><div class="site-footer-inner">
        ${back}
        <p class="site-footer-links">
          <a href="mailto:vinayaktyagi.ed@gmail.com">Email</a>
          <a href="https://github.com/vinayaktyagi10">GitHub</a>
          <a href="https://linkedin.com/in/vinayaktyagi10">LinkedIn</a>
        </p>
        <p class="site-footer-copy">© ${new Date().getFullYear()} Vinayak Tyagi</p>
      </div></footer>`

      const banner =
        post && !post.published
          ? `<p class="draft-banner">Draft. Only the dev server shows this page; it is not built or deployed until <code>published: true</code> in <code>src/posts.js</code>.</p>`
          : ''

      const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
      const words = article ? article[1].replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0
      const minutes = Math.max(1, Math.round(words / 230))

      const list = listedPosts(dev)
        .map(
          (p) => `<li class="post-item">
          <time class="post-item-date" datetime="${p.date}">${p.date}</time>
          <div>
            <a class="post-item-title" href="${postHref(p)}">${esc(p.title)}</a>${p.published ? '' : ' <span class="draft-tag">Draft</span>'}
            <p class="post-item-desc">${esc(p.description)}</p>
          </div>
        </li>`,
        )
        .join('\n')

      return html
        .replace('<!-- site-header -->', header)
        .replace('<!-- site-footer -->', footer)
        .replace('<!-- draft-banner -->', banner)
        .replace('<!-- reading-time -->', `<span class="nowrap">${minutes} min read</span>`)
        .replace('<!-- post-list -->', list ? `<ul class="post-list">${list}</ul>` : '<p>Nothing published yet.</p>')
        .replace(
          '<!-- repo-link -->',
          REPO_URL ? `<p>Repository: <a href="${REPO_URL}">${REPO_URL.replace('https://', '')}</a></p>` : '',
        )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), writingChrome()],
  build: {
    rolldownOptions: {
      input: {
        index: page('./index.html'),
        404: page('./404.html'),
        // The writing index only exists once there is something on it.
        ...(published.length > 0 ? { writing: page('./writing/index.html') } : {}),
        ...Object.fromEntries(published.flatMap(postPages).map((dir) => [dir, page(`./${dir}/index.html`)])),
      },
    },
  },
})
