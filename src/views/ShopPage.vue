<template>
  <div class="shop-page">
    <Navbar />

    <PageHero
      label="Shop"
      title="The Book"
      subtitle="The methodology behind Pattern Language —<br>in print, in your hands, on your shelf."
    />

    <!-- ───────────────────────── The Book ───────────────────────── -->
    <section class="section feature feature--book">
      <div class="container">
        <div class="feature-grid">
          <!-- Cover -->
          <aside class="feature-art">
            <div class="art-frame">
              <img
                v-if="book?.images?.length"
                :src="book?.images?.[0]?.src"
                :alt="book.title"
                class="cover"
              />
              <div class="cover-placeholder" v-else>
                <span class="text-xs text-tertiary">Cover</span>
              </div>
            </div>
          </aside>

          <!-- Editorial detail -->
          <div class="feature-detail">
            <div class="feature-index">
              <span class="idx-num">01</span>
              <span class="idx-label text-xs text-tertiary">The Volume</span>
            </div>

            <h2 class="feature-title">
              {{ book?.title || 'Patterns for Community-Led Rural Revitalization' }}
            </h2>

            <p class="byline">
              By Jože Petrich
              <span class="byline-sep">·</span> Hardcover
              <span class="byline-sep">·</span> First edition
            </p>

            <div class="lede" v-if="book?.descriptionHtml" v-html="book.descriptionHtml"></div>
            <p class="lede" v-else>
              A field guide to the patterns rural communities use to build resilience,
              opportunity, and belonging — adapted from Christopher Alexander, forged in
              practice across the places that need them most.
            </p>

            <blockquote class="pull-quote">
              “Foundations are soil. Without good soil, big projects wither; with it,
              even tiny seeds take.”
            </blockquote>

            <div class="purchase">
              <div class="price-block" v-if="book?.price">
                <span class="price">{{ book.price }}</span>
                <span class="price-note text-xs text-tertiary">Ships worldwide</span>
              </div>

              <a
                v-if="configured"
                :href="book?.onlineStoreUrl || storeFallbackUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="buy btn btn-lg"
              >
                Buy the book <span class="chevron"></span>
              </a>

              <NotifyPanel v-else />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────────────── What's inside ──────────────────────── -->
    <section class="section-compact contents">
      <div class="container">
        <div class="contents-head">
          <span class="text-xs text-tertiary contents-kicker">Inside the book</span>
          <h2 class="contents-title">Four movements, one method.</h2>
        </div>
        <ol class="contents-list">
          <li v-for="(item, i) in chapters" :key="item.title" class="contents-item">
            <span class="contents-num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="contents-body">
              <h3 class="contents-item-title">{{ item.title }}</h3>
              <p class="contents-item-text text-secondary">{{ item.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ────────────────────── The Facilitation Deck ────────────────────── -->
    <section class="section feature feature--deck">
      <div class="container">
        <div class="feature-grid feature-grid--reverse">
          <!-- Editorial detail -->
          <div class="feature-detail">
            <div class="feature-index">
              <span class="idx-num">02</span>
              <span class="idx-label text-xs text-tertiary">The Companion</span>
            </div>

            <h2 class="feature-title">
              {{ deck?.title || 'The Facilitation Deck' }}
            </h2>

            <div class="lede" v-if="deck?.descriptionHtml" v-html="deck.descriptionHtml"></div>
            <p class="lede" v-else>
              The book, made workable. A tactile set of prompt cards that turn the
              patterns into conversation — for the workshop table, the town hall, the
              kitchen counter where the real planning happens.
            </p>

            <ul class="deck-points">
              <li><span class="dot" data-accent="1"></span> One pattern per card, ready to deal</li>
              <li><span class="dot" data-accent="2"></span> Prompts that move a room from talk to plan</li>
              <li><span class="dot" data-accent="3"></span> Pairs with the book, stands on its own</li>
            </ul>

            <div class="purchase">
              <div class="price-block" v-if="deck?.price">
                <span class="price">{{ deck.price }}</span>
                <span class="price-note text-xs text-tertiary">Ships worldwide</span>
              </div>

              <a
                v-if="configured"
                :href="deck?.onlineStoreUrl || storeFallbackUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="buy btn btn-lg"
              >
                Buy the deck <span class="chevron"></span>
              </a>

              <NotifyPanel v-else />
            </div>
          </div>

          <!-- Cover art -->
          <aside class="feature-art">
            <div class="art-frame art-frame--deck">
              <img
                v-if="deck?.images?.length"
                :src="deck?.images?.[0]?.src"
                :alt="deck.title"
                class="cover"
              />
              <div class="cover-placeholder cover-placeholder--deck" v-else>
                <span class="text-xs text-tertiary">Deck</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- ──────────────────────── Closing note ──────────────────────── -->
    <section class="closing gradient-bg">
      <div class="container closing-inner">
        <p class="closing-kicker text-xs text-tertiary">Set of two</p>
        <p class="closing-line">
          Read it, then run it. Take both and bring the method to your table.
        </p>
        <a
          v-if="configured"
          :href="storeFallbackUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-lg closing-cta"
        >
          Browse the full shop <span class="chevron"></span>
        </a>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, defineComponent } from 'vue'
import { Navbar, Footer, PageHero } from '@/components'

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN as string | undefined
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined
const SHOPIFY_BOOK_PRODUCT_ID = import.meta.env.VITE_SHOPIFY_PRODUCT_ID as string | undefined
const SHOPIFY_DECK_PRODUCT_ID = import.meta.env.VITE_SHOPIFY_DECK_PRODUCT_ID as string | undefined
const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL as string | undefined

const configured = !!(SHOPIFY_DOMAIN && SHOPIFY_STOREFRONT_TOKEN && SHOPIFY_BOOK_PRODUCT_ID)
const storeFallbackUrl = SHOPIFY_STORE_URL || (SHOPIFY_DOMAIN ? `https://${SHOPIFY_DOMAIN}` : '')

interface Product {
  title: string
  descriptionHtml: string
  onlineStoreUrl: string
  images: { src: string }[]
  price: string
}

const book = ref<Product | null>(null)
const deck = ref<Product | null>(null)

const chapters = [
  {
    title: 'Reading the place',
    text: 'How to see a community as a living system — its assets, its wounds, the patterns already at work beneath the surface.',
  },
  {
    title: 'The pattern catalogue',
    text: 'The core library: each pattern named, illustrated, and traced back to the projects where it earned its keep.',
  },
  {
    title: 'Putting patterns to work',
    text: 'Sequencing, adapting, and combining patterns to fit the people, budget, and constraints of a real place.',
  },
  {
    title: 'Tending what you build',
    text: 'Keeping momentum after the launch — measuring, documenting, and handing the work back to the community.',
  },
]

function loadBuyButtonSdk(): Promise<any> {
  const w = window as any
  if (w.ShopifyBuy && w.ShopifyBuy.UI) return Promise.resolve(w.ShopifyBuy)
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('shopify-buy-button-sdk') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).ShopifyBuy))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.id = 'shopify-buy-button-sdk'
    script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js'
    script.async = true
    script.onload = () => resolve((window as any).ShopifyBuy)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function fetchProduct(client: any, id?: string): Promise<Product | null> {
  if (!id) return null
  const fullId = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
  const product = await client.product.fetch(fullId)
  if (!product) return null

  // Extract price from the first variant — handle both string and object price shapes.
  const variant = product.variants?.[0]
  let formattedPrice = ''
  if (variant?.price) {
    const amount = variant.price.amount || variant.price
    const currency = variant.price.currencyCode || 'USD'
    formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
  }

  // Copy only what we render into a plain object so Vue doesn't proxy
  // Shopify's internal read-only objects.
  return {
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    onlineStoreUrl: product.onlineStoreUrl,
    images: product.images?.map((img: any) => ({ src: img.src || img.url || '' })) || [],
    price: formattedPrice,
  }
}

onMounted(async () => {
  if (!configured) return
  try {
    const ShopifyBuy = await loadBuyButtonSdk()
    const client = ShopifyBuy.buildClient({
      domain: SHOPIFY_DOMAIN,
      storefrontAccessToken: SHOPIFY_STOREFRONT_TOKEN,
    })

    const [bookData, deckData] = await Promise.all([
      fetchProduct(client, SHOPIFY_BOOK_PRODUCT_ID),
      fetchProduct(client, SHOPIFY_DECK_PRODUCT_ID),
    ])
    book.value = bookData
    deck.value = deckData
  } catch (error) {
    console.error('Failed to fetch Shopify product data:', error)
  }
})

// Inline "notify me" panel — only rendered when the store isn't configured.
const NotifyPanel = defineComponent({
  setup() {
    const email = ref('')
    const state = ref<'idle' | 'submitting' | 'success'>('idle')

    function submit(e: Event) {
      e.preventDefault()
      state.value = 'submitting'
      try {
        const list: string[] = JSON.parse(localStorage.getItem('shop-notify-list') || '[]')
        if (!list.includes(email.value)) list.push(email.value)
        localStorage.setItem('shop-notify-list', JSON.stringify(list))
      } catch {
        // Ignore storage failures — UI still confirms.
      }
      state.value = 'success'
    }

    return () =>
      h('div', { class: 'notify' }, [
        h('span', { class: 'notify-label text-xs text-tertiary' }, 'In the press'),
        h('p', { class: 'notify-body text-secondary' }, 'First copies go to readers on the list. Leave an email and we’ll write the moment it ships.'),
        h('form', { class: 'notify-form', onSubmit: submit }, [
          h('input', {
            type: 'email',
            required: true,
            placeholder: 'you@somewhere.good',
            class: 'notify-input text-sm',
            value: email.value,
            disabled: state.value !== 'idle',
            onInput: (ev: Event) => (email.value = (ev.target as HTMLInputElement).value),
          }),
          h(
            'button',
            { type: 'submit', class: 'notify-button', disabled: state.value !== 'idle' },
            state.value === 'success' ? 'Thank you' : state.value === 'submitting' ? 'Sending…' : 'Notify me',
          ),
        ]),
      ])
  },
})
</script>

<style scoped>
.shop-page { min-height: 100vh; }

/* ───────────────────────── Feature sections ───────────────────────── */
.feature--book { background: var(--color-bg-primary); padding-bottom: 6rem; }
.feature--deck { background: var(--color-bg-secondary); }

.feature-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: clamp(3rem, 7vw, 7rem);
  align-items: start;
}

.feature-grid--reverse { grid-template-columns: 1.15fr 0.85fr; }

/* Art rail */
.feature-art { position: sticky; top: 6rem; }

.art-frame {
  position: relative;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.art-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(42, 42, 42, 0.1);
  pointer-events: none;
}

.feature--deck .art-frame { background: var(--color-bg-primary); }

.cover {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  box-shadow: 0 24px 48px -20px rgba(0, 0, 0, 0.28);
}

.art-frame--deck .cover { aspect-ratio: 4 / 3; }

.cover-placeholder {
  aspect-ratio: 2 / 3;
  background: linear-gradient(
    135deg,
    rgba(232, 180, 160, 0.14),
    rgba(184, 212, 200, 0.14),
    rgba(201, 184, 232, 0.14)
  );
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
}

.cover-placeholder--deck { aspect-ratio: 4 / 3; }

/* Editorial detail column */
.feature-index {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.12);
}

.idx-num {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  line-height: 1;
}

.feature--book .idx-num { color: var(--color-accent-warm); }
.feature--deck .idx-num { color: var(--color-accent-3); }

.idx-label {
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

.feature-title {
  font-size: clamp(2.25rem, 4vw, 3.25rem);
  font-weight: var(--font-weight-light);
  line-height: 1.08;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}

.byline {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.01em;
  margin-bottom: 1.75rem;
}

.byline-sep {
  color: var(--color-text-tertiary);
  margin: 0 0.3rem;
}

.lede {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  max-width: 42ch;
}

.lede :deep(p) { margin-bottom: 1rem; }
.lede :deep(p:last-child) { margin-bottom: 0; }

.pull-quote {
  margin: 2.75rem 0;
  padding-left: 1.5rem;
  border-left: 2px solid var(--color-accent-warm);
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  max-width: 30ch;
}

.feature--deck .pull-quote { border-left-color: var(--color-accent-3); }

/* Deck bullet points */
.deck-points {
  list-style: none;
  margin: 2.5rem 0;
  padding: 0;
}

.deck-points li {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
  border-top: 1px solid rgba(42, 42, 42, 0.07);
}

.deck-points li:first-child { border-top: none; }

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.dot[data-accent='1'] { background: var(--color-accent-1); }
.dot[data-accent='2'] { background: var(--color-accent-2); }
.dot[data-accent='3'] { background: var(--color-accent-3); }

/* Purchase block */
.purchase {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(42, 42, 42, 0.12);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem 2.5rem;
}

.price-block { display: flex; flex-direction: column; gap: 0.3rem; }

.price {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  line-height: 1;
}

.price-note { letter-spacing: 0.08em; }

.buy {
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

/* ──────────────────────── What's inside ──────────────────────── */
.contents { background: var(--color-bg-secondary); }

.contents-head {
  max-width: var(--container-max);
  margin: 0 auto 3.5rem;
}

.contents-kicker {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  margin-bottom: 1rem;
}

.contents-title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
}

.contents-list {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: var(--container-max);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border-top: 1px solid rgba(42, 42, 42, 0.12);
}

.contents-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
  padding: 2.25rem 2.5rem 2.25rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.1);
}

.contents-item:nth-child(odd) { border-right: 1px solid rgba(42, 42, 42, 0.1); padding-right: 3rem; }
.contents-item:nth-child(even) { padding-left: 3rem; }

.contents-num {
  font-size: 0.875rem;
  font-weight: var(--font-weight-light);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  color: var(--color-accent-warm);
  line-height: 1.6;
}

.contents-item-title {
  font-size: 1.375rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0.6rem;
}

.contents-item-text {
  font-size: 0.9375rem;
  line-height: 1.7;
}

/* ──────────────────────── Notify panel ──────────────────────── */
.notify { flex: 1 1 100%; max-width: 30rem; }

.notify-label {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  margin-bottom: 0.75rem;
}

.notify-body {
  font-size: 0.9375rem;
  line-height: 1.65;
  margin-bottom: 1.25rem;
}

.notify-form {
  display: flex;
  border: 1px solid rgba(42, 42, 42, 0.18);
  background: var(--color-bg-primary);
  transition: border-color 200ms ease;
}

.notify-form:focus-within { border-color: rgba(42, 42, 42, 0.55); }

.notify-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.95rem 1.1rem;
  font-family: var(--font-family);
  color: var(--color-text-primary);
  outline: none;
  min-width: 0;
}

.notify-input::placeholder { color: var(--color-text-tertiary); }

.notify-button {
  flex: 0 0 auto;
  padding: 0.95rem 1.5rem;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background 200ms ease;
}

.notify-button:hover:not(:disabled) { background: #1a1a1a; }
.notify-button:disabled { opacity: 0.7; cursor: not-allowed; }

/* ──────────────────────── Closing band ──────────────────────── */
.closing {
  padding: 7rem var(--container-padding);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.closing-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.closing-kicker {
  text-transform: uppercase;
  letter-spacing: 0.24em;
  margin-bottom: 1.5rem;
}

.closing-line {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: var(--font-weight-light);
  line-height: 1.25;
  letter-spacing: -0.02em;
  max-width: 24ch;
  margin-bottom: 2.5rem;
}

.closing-cta { text-decoration: none; }

/* ──────────────────────── Responsive ──────────────────────── */
@media (max-width: 1024px) {
  .feature-grid,
  .feature-grid--reverse {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .feature-grid--reverse .feature-detail { order: 1; }
  .feature-grid--reverse .feature-art { order: 2; }

  .feature-art { position: static; max-width: 360px; }
  .feature--deck .feature-art { max-width: 480px; }

  .contents-list { grid-template-columns: 1fr; }
  .contents-item,
  .contents-item:nth-child(odd),
  .contents-item:nth-child(even) {
    padding: 2rem 0;
    border-right: none;
  }
}

@media (max-width: 768px) {
  .feature-title { font-size: 2rem; }
  .pull-quote { font-size: 1.125rem; }
  .lede { font-size: 1rem; }
  .notify-form { flex-direction: column; }
  .notify-button { padding: 1rem; }
  .purchase { gap: 1.5rem; }
}
</style>
