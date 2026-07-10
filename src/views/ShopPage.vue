<template>
  <div class="shop-page">
    <Navbar />

    <PageHero
      label="Shop"
      title="The Collection"
      subtitle="The methodology behind Pattern Language — a book and two decks,<br>in print, in your hands, on your table."
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
          <p class="presale-ship text-xs text-tertiary">Orders ship at the end of August.</p>
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
                <div class="card-actions">
                  <button type="button" class="card-preview" @click="openPreview(item)">
                    Preview
                  </button>
                  <a
                    :href="products[item.id]?.onlineStoreUrl || storeFallbackUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-buy"
                  >
                    {{ item.buyLabel }} <span class="chevron"></span>
                  </a>
                </div>
              </template>
              <span v-else class="card-soon text-xs text-tertiary">Coming soon</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Product preview panel -->
    <SlideInModal v-model="showPreview" sidebar-width="0px" back-label="Back to the collection">
      <div v-if="previewItem" class="preview-panel">
        <div class="preview-layout">
          <div class="preview-media">
            <img
              v-if="products[previewItem.id]?.images?.length"
              :src="products[previewItem.id]?.images?.[0]?.src"
              :alt="products[previewItem.id]?.title || previewItem.fallbackTitle"
            />
            <span v-else class="preview-media-placeholder text-xs text-tertiary">
              {{ previewItem.label }}
            </span>
          </div>

          <div class="preview-info">
            <span class="preview-label text-xs text-tertiary">{{ previewItem.label }}</span>
            <h2 class="preview-title">{{ products[previewItem.id]?.title || previewItem.fallbackTitle }}</h2>
            <span v-if="products[previewItem.id]?.price" class="preview-price">
              {{ products[previewItem.id]?.price }}
            </span>

            <div
              v-if="products[previewItem.id]?.descriptionHtml"
              class="preview-description text-secondary"
              v-html="products[previewItem.id]?.descriptionHtml"
            ></div>
            <p v-else class="preview-description text-secondary">{{ previewItem.blurb }}</p>

            <a
              :href="products[previewItem.id]?.onlineStoreUrl || storeFallbackUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="preview-buy"
            >
              {{ previewItem.buyLabel }} <span class="buy-arrow">→</span>
            </a>
            <p class="preview-ship text-xs text-tertiary">
              Checkout happens on our store. Orders ship at the end of August.
            </p>
          </div>
        </div>
      </div>
    </SlideInModal>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Navbar, Footer, PageHero, SlideInModal } from '@/components'

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

// Preview panel state
const showPreview = ref(false)
const previewItem = ref<(typeof items)[number] | null>(null)

const openPreview = (item: (typeof items)[number]) => {
  previewItem.value = item
  showPreview.value = true
}

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
  max-width: 72ch;
  margin: 0 auto 5.5rem;
  text-align: center;
}

.presale-kicker {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  margin-bottom: 1.25rem;
}

.presale-lead {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.presale-lead strong { font-weight: var(--font-weight-medium); }

.presale-thanks {
  font-size: 0.9375rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.presale-ship {
  text-transform: uppercase;
  letter-spacing: 0.18em;
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
}

.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  background: var(--color-bg-primary);
  padding: 1.75rem 1.75rem 2rem;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.product-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

/* Fixed height keeps all three image frames identical regardless of artwork. */
.card-media {
  position: relative;
  height: clamp(19rem, 23vw, 22rem);
  background: linear-gradient(
    135deg,
    rgba(232, 180, 160, 0.14),
    rgba(184, 212, 200, 0.14),
    rgba(201, 184, 232, 0.14)
  );
  border: 1px solid var(--hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem;
  margin-bottom: 1.75rem;
  overflow: hidden;
}

.card-media img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.22));
  transition: transform 0.6s cubic-bezier(0.16, 0.84, 0.44, 1);
}

.product-card:hover .card-media img { transform: scale(1.04); }

.card-media-placeholder {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.card-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
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
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  line-height: 1.18;
  letter-spacing: -0.02em;
  margin-bottom: 0.85rem;
}

.card-blurb {
  font-size: 0.9375rem;
  line-height: 1.65;
}

.card-foot {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(42, 42, 42, 0.1);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-price {
  font-size: 1.25rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.card-actions {
  display: flex;
  align-items: baseline;
  gap: 1.75rem;
}

.card-preview {
  background: none;
  border: none;
  padding: 0 0 0.3rem;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;
}

.card-preview:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

.card-buy {
  display: inline-flex;
  align-items: center;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-text-primary);
  padding-bottom: 0.3rem;
  white-space: nowrap;
  transition: opacity var(--transition-fast);
}

.card-buy:hover { opacity: 0.55; }

/* ─────────────── Preview panel ─────────────── */
.preview-panel {
  padding: 2rem 3rem 5rem;
}

.preview-layout {
  display: grid;
  grid-template-columns: 6fr 5fr;
  gap: 4rem;
  max-width: 1080px;
  margin: 2rem auto 0;
  align-items: start;
}

.preview-media {
  position: relative;
  min-height: 420px;
  background: linear-gradient(
    135deg,
    rgba(232, 180, 160, 0.14),
    rgba(184, 212, 200, 0.14),
    rgba(201, 184, 232, 0.14)
  );
  border: 1px solid var(--hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.preview-media img {
  max-width: 100%;
  max-height: 480px;
  object-fit: contain;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.22));
}

.preview-media-placeholder {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.preview-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.preview-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1.25rem;
}

.preview-title {
  font-size: 2.25rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.12;
  margin: 0 0 1rem;
}

.preview-price {
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  font-variant-numeric: tabular-nums;
  margin-bottom: 1.75rem;
}

.preview-description {
  font-size: 0.9375rem;
  line-height: 1.75;
  margin-bottom: 2.5rem;
}

.preview-description :deep(p) { margin-bottom: 1rem; }
.preview-description :deep(ul) { padding-left: 1.25rem; margin-bottom: 1rem; }

.preview-buy {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-bg-dark);
  text-decoration: none;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.preview-buy:hover {
  background: transparent;
  color: var(--color-text-primary);
}

.buy-arrow { display: inline-block; }

.preview-ship {
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

@media (max-width: 900px) {
  .preview-panel { padding: 1.5rem 1.75rem 4rem; }
  .preview-layout { grid-template-columns: 1fr; gap: 2.5rem; }
  .preview-media { min-height: 300px; }
  .preview-title { font-size: 1.75rem; }
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
