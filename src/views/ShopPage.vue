<template>
  <div class="shop-page">
    <Navbar />

    <PageHero
      label="Shop"
      title="The Book"
      subtitle="The methodology behind Pattern Language —<br>in print, in your hands, on your shelf."
    />

    <section class="shop-body">
      <div class="container">
        <!-- ─────────────── Where the money goes ─────────────── -->
        <div class="presale-note">
          <span class="presale-kicker text-xs text-tertiary">About the presale</span>
          <p class="presale-lead">
            <strong>$5 from every presale purchase</strong> will be donated to
            <a
              href="https://emergentcampus.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="presale-link"
            >Emergent&nbsp;Campus</a>
            to support rural programs and community-led revitalization work. Your
            purchase helps fund the ongoing development of rural community tools,
            workshops, internships, and resources.
          </p>
          <p class="presale-thanks text-secondary">
            A special thank you to
            <a
              :href="storeFallbackUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="presale-link"
            >Arna&nbsp;Miller</a>
            for the design of the book and facilitation deck, and for helping with
            fulfillment and management of the presale.
          </p>
        </div>

        <!-- ─────────────── The three items ─────────────── -->
        <div class="card-grid">
          <article v-for="(item, i) in items" :key="item.id" class="product-card">
            <div class="card-media">
              <img
                v-if="products[item.id]?.images?.length"
                :src="products[item.id]?.images?.[0]?.src"
                :alt="products[item.id]?.title || item.fallbackTitle"
              />
              <span v-else class="card-media-placeholder text-xs text-tertiary">
                {{ item.label }}
              </span>
            </div>

            <div class="card-head">
              <span class="card-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="card-label text-xs text-tertiary">{{ item.label }}</span>
            </div>

            <h2 class="card-title">{{ products[item.id]?.title || item.fallbackTitle }}</h2>
            <p class="card-blurb text-secondary">{{ item.blurb }}</p>

            <div class="card-foot">
              <template v-if="configured">
                <span class="card-price" v-if="products[item.id]?.price">
                  {{ products[item.id]?.price }}
                </span>
                <a
                  :href="products[item.id]?.onlineStoreUrl || storeFallbackUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="card-buy btn"
                >
                  {{ item.buyLabel }} <span class="chevron"></span>
                </a>
              </template>
              <span v-else class="card-soon text-xs text-tertiary">Coming soon</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Navbar, Footer, PageHero } from '@/components'

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN as string | undefined
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined
const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL as string | undefined

// Product IDs are hard-coded so adding a product is a code change you can just
// ship — no env wiring needed in prod. Add an entry here + to `items` below.
const PRODUCT_IDS = {
  book: 'gid://shopify/Product/15636261699932',
  facilitationDeck: 'gid://shopify/Product/15636294631772',
  gameOfValues: 'gid://shopify/Product/7848408023290',
}

const configured = !!(SHOPIFY_DOMAIN && SHOPIFY_STOREFRONT_TOKEN)
const storeFallbackUrl = SHOPIFY_STORE_URL || (SHOPIFY_DOMAIN ? `https://${SHOPIFY_DOMAIN}` : '')

interface Product {
  title: string
  descriptionHtml: string
  onlineStoreUrl: string
  images: { src: string }[]
  price: string
}

// Fetched Shopify data, keyed by product id.
const products = ref<Record<string, Product>>({})

// The three cards. Blurbs are our own short copy — Shopify supplies the title,
// price, image, and buy link.
const items = [
  {
    id: PRODUCT_IDS.book,
    label: 'The Book',
    fallbackTitle: 'Patterns for Community-Led Rural Revitalization',
    blurb: 'A field guide to the patterns rural communities use to rebuild resilience, opportunity, and belonging.',
    buyLabel: 'Buy the book',
  },
  {
    id: PRODUCT_IDS.facilitationDeck,
    label: 'The Facilitation Deck',
    fallbackTitle: 'The Facilitation Deck',
    blurb: 'Prompt cards that turn the patterns into conversation — made for the workshop table.',
    buyLabel: 'Buy the deck',
  },
  {
    id: PRODUCT_IDS.gameOfValues,
    label: 'Game of Values',
    fallbackTitle: 'The Game of Values Deck',
    blurb: '64 original Arna Miller artworks meet the Game of Values — a self-reflection deck for surfacing what really drives your choices, solo or in a group.',
    buyLabel: 'Buy the deck',
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

    const ids = items.map((item) => item.id)
    const fetched = await Promise.all(ids.map((id) => fetchProduct(client, id)))
    const next: Record<string, Product> = {}
    ids.forEach((id, idx) => {
      const data = fetched[idx]
      if (data) next[id] = data
    })
    products.value = next
  } catch (error) {
    console.error('Failed to fetch Shopify product data:', error)
  }
})
</script>

<style scoped>
.shop-page { min-height: 100vh; }

.shop-body {
  padding: 5rem var(--container-padding) 8rem;
  background: var(--color-bg-primary);
}

/* ─────────────── Presale note ─────────────── */
.presale-note {
  max-width: 56ch;
  margin: 0 auto 5rem;
  text-align: center;
}

.presale-kicker {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  margin-bottom: 1.25rem;
}

.presale-lead {
  font-size: 1.0625rem;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.presale-lead strong { font-weight: var(--font-weight-medium); }

.presale-thanks {
  font-size: 0.9375rem;
  line-height: 1.7;
}

.presale-link {
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid rgba(42, 42, 42, 0.3);
  transition: border-color var(--transition-fast);
  white-space: nowrap;
}

.presale-link:hover { border-bottom-color: var(--color-text-primary); }

/* ─────────────── Card grid ─────────────── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: stretch;
}

.product-card {
  display: flex;
  flex-direction: column;
}

.card-media {
  position: relative;
  aspect-ratio: 4 / 5;
  background: linear-gradient(
    135deg,
    rgba(232, 180, 160, 0.14),
    rgba(184, 212, 200, 0.14),
    rgba(201, 184, 232, 0.14)
  );
  border: 1px solid rgba(42, 42, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-bottom: 1.75rem;
}

.card-media img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 18px 36px -22px rgba(0, 0, 0, 0.32);
}

.card-media-placeholder {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.card-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card-num {
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--color-accent-warm);
}

.card-label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.card-title {
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin-bottom: 0.75rem;
}

.card-blurb {
  font-size: 0.9375rem;
  line-height: 1.65;
}

.card-foot {
  margin-top: auto;
  padding-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-price {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.card-buy {
  text-decoration: none;
  white-space: nowrap;
}

.card-soon {
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

/* ─────────────── Responsive ─────────────── */
@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
    max-width: 28rem;
    margin: 0 auto;
  }

  .shop-body { padding-top: 4rem; }
  .presale-note { margin-bottom: 4rem; }
}
</style>
