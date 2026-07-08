// Post-build prerender: stamps a static index.html per public route into dist/,
// with per-page <head> meta (title, description, canonical, Open Graph, Twitter)
// and a crawler-readable content snapshot inside #app (replaced when Vue mounts).
// Also writes dist/sitemap.xml from the same route list.
//
// Run via vite-node (postbuild hook) so it can import the TS data modules directly.
// Titles/descriptions for the static routes mirror the route meta in src/router/index.ts —
// keep the two in sync when adding public routes.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { allPatterns } from '../src/utils/data/patterns'
import { allChallenges } from '../src/utils/data/challenges'
import { caseStudies } from '../src/utils/data/stories'

const SITE_URL = 'https://www.ruralpatternlanguage.com'
const SITE_NAME = 'Pattern Language'
const DEFAULT_TITLE = 'Pattern Language — Designing Thriving Rural Communities'
const DEFAULT_DESCRIPTION =
  'A collaborative tool empowering rural communities to design, plan, and implement innovative solutions to complex challenges. Explore 45+ proven patterns for community-led regeneration.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const md = new MarkdownIt({ html: false, linkify: true })

interface PageDef {
  path: string
  /** Bare page title; site name is appended. Omit for the branded homepage title. */
  title?: string
  description?: string
  ogType?: 'website' | 'article'
  image?: string
  /** Crawler-visible HTML injected into #app; replaced when the SPA mounts. */
  body?: string
  /** JSON-LD structured data objects, rendered as script tags in <head>. */
  jsonLd?: object[]
}

const ORGANIZATION = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  email: 'hello@ruralpatternlanguage.com'
}

const breadcrumbs = (...crumbs: { name: string; path?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    ...(c.path ? { item: `${SITE_URL}${c.path}` } : {})
  }))
})

const article = (opts: {
  headline: string
  description: string
  path: string
  image?: string
  datePublished?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: opts.headline,
  description: truncate(opts.description),
  mainEntityOfPage: `${SITE_URL}${opts.path}`,
  image: opts.image || DEFAULT_OG_IMAGE,
  ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
  author: ORGANIZATION,
  publisher: ORGANIZATION
})

const itemList = (name: string, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: `${SITE_URL}${item.path}`
  }))
})

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const truncate = (s: string, max = 158) => {
  const clean = s.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

const list = (items: string[] | undefined) =>
  items?.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''

function patternBody(p: (typeof allPatterns)[number]): string {
  return `<main class="container"><article>
<p>Pattern ${String(p.id).padStart(2, '0')}${p.category ? ` · ${esc(p.category)}` : ''}</p>
<h1>${esc(p.title)}</h1>
<p>${esc(p.description)}</p>
${p.addresses?.length ? `<p>Addresses: ${p.addresses.map(esc).join(', ')}</p>` : ''}
${p.problem ? `<h2>Problem</h2><p>${esc(p.problem)}</p>` : ''}
${p.context ? `<h2>Context</h2><p>${esc(p.context)}</p>` : ''}
${p.solution ? `<h2>Solution</h2><p>${esc(p.solution)}</p>` : ''}
${p.implementation?.length ? `<h2>Implementation</h2>${list(p.implementation)}` : ''}
${p.examples?.length ? `<h2>Examples</h2>${list(p.examples)}` : ''}
${p.relatedPatterns?.length ? `<h2>Related Patterns</h2>${list(p.relatedPatterns)}` : ''}
<p><a href="/patterns">Browse all patterns</a></p>
</article></main>`
}

function challengeBody(c: (typeof allChallenges)[number]): string {
  return `<main class="container"><article>
<h1>${esc(c.title)}</h1>
<p>${esc(c.description)}</p>
${c.context ? `<h2>Context</h2><p>${esc(c.context)}</p>` : ''}
${c.manifestations?.length ? `<h2>How It Shows Up</h2>${list(c.manifestations)}` : ''}
${c.relatedPatterns?.length ? `<h2>Patterns That Address This</h2>${list(c.relatedPatterns)}` : ''}
<p><a href="/patterns">Browse all patterns</a></p>
</article></main>`
}

function storyBody(s: (typeof caseStudies)[number]): string {
  return `<main class="container"><article>
<p>${esc(s.location)}</p>
<h1>${esc(s.title)}</h1>
<h2>Problem</h2><p>${esc(s.problem)}</p>
<h2>Solution</h2><p>${esc(s.solution)}</p>
${s.patterns?.length ? `<p>Patterns used: ${s.patterns.map(esc).join(', ')}</p>` : ''}
${s.story ? md.render(s.story) : ''}
<p><a href="/stories">Read more success stories</a></p>
</article></main>`
}

const linkList = (items: { href: string; label: string; blurb?: string }[]) =>
  `<ul>${items
    .map(
      (i) =>
        `<li><a href="${i.href}">${esc(i.label)}</a>${i.blurb ? ` — ${esc(i.blurb)}` : ''}</li>`
    )
    .join('')}</ul>`

async function fetchCities(): Promise<{ id: number; name: string; state?: string }[]> {
  const apiUrl = process.env.SITEMAP_API_URL || process.env.VITE_API_URL
  if (!apiUrl || apiUrl.includes('localhost')) return []
  try {
    const res = await fetch(`${apiUrl}/cities`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const cities = await res.json()
    return Array.isArray(cities) ? cities.filter((c) => c?.id) : []
  } catch (err) {
    console.warn(`prerender: skipping city pages (${(err as Error).message})`)
    return []
  }
}

const cities = await fetchCities()

const pages: PageDef[] = [
  {
    path: '/',
    description: DEFAULT_DESCRIPTION,
    body: `<main class="container">
<h1>Designing Thriving Rural Communities</h1>
<p>A collaborative tool empowering rural communities to design, plan, and implement innovative solutions to complex challenges.</p>
<h2>Explore</h2>
${linkList([
  { href: '/patterns', label: 'Pattern Library', blurb: '45+ proven patterns for rural regeneration' },
  { href: '/stories', label: 'Success Stories', blurb: 'Communities putting patterns into practice' },
  { href: '/cities', label: 'Cities & Towns', blurb: 'Places using Pattern Language today' },
  { href: '/about', label: 'About the project' }
])}
</main>`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: truncate(DEFAULT_DESCRIPTION),
        publisher: ORGANIZATION
      },
      { '@context': 'https://schema.org', ...ORGANIZATION }
    ]
  },
  {
    path: '/about',
    title: 'About',
    description:
      'PatternLanguage.ai is a collaborative tool that helps rural communities design, plan, and implement solutions to complex challenges using proven patterns.',
    body: `<main class="container"><h1>About ${SITE_NAME}</h1>
<p>PatternLanguage.ai is a collaborative tool that helps rural communities design, plan, and implement innovative solutions to complex challenges using a shared library of proven patterns.</p></main>`
  },
  {
    path: '/patterns',
    title: 'Pattern Library',
    description:
      'Browse 45+ proven patterns for rural community regeneration — from community anchor points to youth return pathways — each with problem, solution, and implementation steps.',
    body: `<main class="container"><h1>Pattern Library</h1>
<p>Proven patterns for rural community regeneration, each with the problem it solves, the solution, and concrete implementation steps.</p>
${linkList(allPatterns.map((p) => ({ href: `/patterns/${p.id}`, label: p.title, blurb: p.description })))}
</main>`,
    jsonLd: [
      itemList('Pattern Library', allPatterns.map((p) => ({ name: p.title, path: `/patterns/${p.id}` }))),
      breadcrumbs({ name: 'Patterns' })
    ]
  },
  {
    path: '/stories',
    title: 'Success Stories',
    description:
      'Real stories of rural communities putting patterns into practice — what they tried, what worked, and what changed.',
    body: `<main class="container"><h1>Success Stories</h1>
${linkList(caseStudies.map((s) => ({ href: `/stories/${s.id}`, label: `${s.title} (${s.location})`, blurb: s.problem })))}
</main>`,
    jsonLd: [
      itemList('Success Stories', caseStudies.map((s) => ({ name: s.title, path: `/stories/${s.id}` }))),
      breadcrumbs({ name: 'Stories' })
    ]
  },
  {
    path: '/cities',
    title: 'Cities & Towns',
    description:
      'Explore rural cities and towns using Pattern Language to tackle their challenges — see local problems, active patterns, and community progress.',
    body: `<main class="container"><h1>Cities &amp; Towns</h1>
${linkList(cities.map((c) => ({ href: `/cities/${c.id}`, label: c.state ? `${c.name}, ${c.state}` : c.name })))}
</main>`
  },
  {
    path: '/shop',
    title: 'Shop',
    description: 'Books, prints, and goods from the Pattern Language project.'
  },
  {
    path: '/beta',
    title: 'Beta Program',
    description:
      'Pattern Language is in beta. Learn what that means and how to share feedback that shapes the platform.'
  },
  { path: '/terms', title: 'Terms of Service' },
  { path: '/privacy', title: 'Privacy Policy' },
  ...allPatterns.map((p) => ({
    path: `/patterns/${p.id}`,
    title: p.title,
    description: `${p.description} ${p.problem || ''}`,
    ogType: 'article' as const,
    body: patternBody(p),
    jsonLd: [
      article({ headline: p.title, description: `${p.description} ${p.problem || ''}`, path: `/patterns/${p.id}` }),
      breadcrumbs({ name: 'Patterns', path: '/patterns' }, { name: p.title })
    ]
  })),
  ...allChallenges.map((c) => ({
    path: `/challenges/${c.id}`,
    title: c.title,
    description: `${c.description} ${c.context || ''}`,
    ogType: 'article' as const,
    body: challengeBody(c),
    jsonLd: [
      article({ headline: c.title, description: `${c.description} ${c.context || ''}`, path: `/challenges/${c.id}` }),
      breadcrumbs({ name: c.title })
    ]
  })),
  ...caseStudies.map((s) => {
    const image = s.image?.startsWith('/') ? `${SITE_URL}${s.image}` : s.image
    return {
      path: `/stories/${s.id}`,
      title: `${s.title} — ${s.location}`,
      description: `${s.problem} ${s.solution}`,
      ogType: 'article' as const,
      image,
      body: storyBody(s),
      jsonLd: [
        article({
          headline: `${s.title} — ${s.location}`,
          description: `${s.problem} ${s.solution}`,
          path: `/stories/${s.id}`,
          image,
          datePublished: s.publishedDate
        }),
        breadcrumbs({ name: 'Stories', path: '/stories' }, { name: s.title })
      ]
    }
  }),
  ...cities.map((c) => ({
    path: `/cities/${c.id}`,
    title: c.state ? `${c.name}, ${c.state}` : c.name,
    description: `How ${c.name} is using Pattern Language to tackle local challenges — community readiness, active patterns, and progress.`,
    ogType: 'article' as const,
    jsonLd: [
      breadcrumbs({ name: 'Cities', path: '/cities' }, { name: c.name })
    ]
  }))
]

const template = await readFile(path.join(dist, 'index.html'), 'utf8')

function renderPage(page: PageDef): string {
  const fullTitle = page.title ? `${page.title} — ${SITE_NAME}` : DEFAULT_TITLE
  const description = truncate(page.description || DEFAULT_DESCRIPTION)
  const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`
  const image = page.image || DEFAULT_OG_IMAGE

  const replaceMeta = (html: string, attr: 'name' | 'property', key: string, value: string) =>
    html.replace(
      new RegExp(`(<meta ${attr}="${key.replace(/:/g, '\\:')}" content=")[^"]*(">)`),
      `$1${esc(value)}$2`
    )

  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(">)/,
    `$1${url}$2`
  )
  html = replaceMeta(html, 'name', 'description', description)
  html = replaceMeta(html, 'property', 'og:type', page.ogType || 'website')
  html = replaceMeta(html, 'property', 'og:title', fullTitle)
  html = replaceMeta(html, 'property', 'og:description', description)
  html = replaceMeta(html, 'property', 'og:url', url)
  html = replaceMeta(html, 'property', 'og:image', image)
  html = replaceMeta(html, 'property', 'og:image:alt', fullTitle)
  html = replaceMeta(html, 'name', 'twitter:title', fullTitle)
  html = replaceMeta(html, 'name', 'twitter:description', description)
  html = replaceMeta(html, 'name', 'twitter:image', image)

  if (page.jsonLd?.length) {
    const scripts = page.jsonLd
      .map(
        (obj) =>
          // Escape "<" so JSON content can't close the script tag early.
          `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
      )
      .join('\n    ')
    html = html.replace('</head>', `    ${scripts}\n  </head>`)
  }

  if (page.body) {
    html = html.replace('<div id="app"></div>', `<div id="app">${page.body}</div>`)
  }
  return html
}

// Pages are written as `<path>.html` and served extensionless via Vercel's
// `cleanUrls: true` (vite preview's sirv resolves them the same way locally).
let written = 0
for (const page of pages) {
  const outFile =
    page.path === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, ...`${page.path.slice(1)}.html`.split('/'))
  await mkdir(path.dirname(outFile), { recursive: true })
  await writeFile(outFile, renderPage(page))
  written++
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path === '/' ? '' : p.path}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`
await writeFile(path.join(dist, 'sitemap.xml'), sitemap)

console.log(`prerender: wrote ${written} pages + sitemap.xml (${pages.length} URLs)`)
