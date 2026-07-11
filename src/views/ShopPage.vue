<template>
  <div class="shop-page">

    <PageHero
      label="Shop"
      title="The Collection"
      subtitle="The methodology behind Pattern Language — a book and two decks,<br>in print, in your hands, on your table."
    />

    <section class="shop-body">
      <div class="container">
        <!-- ─────────────── Presale: editorial band ─────────────── -->
        <div class="presale-band">
          <div class="presale-statement">
            <span class="presale-eyebrow">
              <span class="accent-mark" data-accent="1" aria-hidden="true"></span>
              About the Presale
            </span>
            <p class="presale-headline">
              $5 from every presale purchase goes to
              <a
                href="https://emergentcampus.org/"
                target="_blank"
                rel="noopener noreferrer"
                class="presale-link"
              >Emergent&nbsp;Campus</a>.
            </p>
          </div>

          <div class="presale-details">
            <p class="text-secondary">
              Your purchase supports rural programs and community-led revitalization
              work — funding the ongoing development of rural community tools,
              workshops, internships, and resources.
            </p>
            <p class="text-secondary">
              A special thank you to
              <a
                :href="storeFallbackUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="presale-link"
              >Arna&nbsp;Miller</a>
              for the design of the book and facilitation deck, and for helping
              with fulfillment and management of the presale.
            </p>
            <dl class="presale-facts">
              <div class="fact-row">
                <dt>Ships</dt>
                <dd>End of August</dd>
              </div>
              <div class="fact-row">
                <dt>Gives Back</dt>
                <dd>$5 per order to Emergent Campus</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- ─────────────── The three items ─────────────── -->
        <div class="card-grid">
          <article
            v-for="(item, i) in items"
            :key="item.id"
            class="product-card"
            :data-accent="(i % 3) + 1"
            role="button"
            tabindex="0"
            @click="openPreview(item, i)"
            @keydown.enter="openPreview(item, i)"
          >
            <div class="card-media">
              <img
                v-if="products[item.id]?.images?.length"
                :src="products[item.id]?.images?.[0]?.src"
                :alt="products[item.id]?.title || item.fallbackTitle"
              />
              <span v-else class="card-media-placeholder">
                {{ item.label }}
              </span>
            </div>

            <div class="card-body">
              <div class="label-row">
                <span class="label-id">
                  <span class="accent-mark" aria-hidden="true"></span>
                  {{ item.label }}
                </span>
                <span class="label-meta">№ {{ String(i + 1).padStart(2, '0') }}</span>
              </div>

              <h2 class="card-title">{{ products[item.id]?.title || item.fallbackTitle }}</h2>
              <p class="card-blurb text-secondary">{{ item.blurb }}</p>

              <div class="card-foot">
                <template v-if="configured">
                  <span class="card-price" v-if="products[item.id]?.price">
                    {{ products[item.id]?.price }}
                  </span>
                  <div class="card-actions">
                    <span class="card-preview">Preview</span>
                    <a
                      :href="products[item.id]?.onlineStoreUrl || storeFallbackUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="card-buy"
                      @click.stop
                    >
                      Buy
                    </a>
                  </div>
                </template>
                <span v-else class="card-soon">Coming soon</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ─────────────── Product preview panel ─────────────── -->
    <SlideInModal v-model="showPreview" sidebar-width="0px">
      <div v-if="previewItem" class="preview-panel" :data-accent="(previewIndex % 3) + 1">
        <ModalBackButton class="panel-back" label="The Collection" @back="showPreview = false" />

        <div class="preview-layout">
          <!-- Gallery -->
          <div class="preview-gallery">
            <div class="preview-media">
              <img
                v-if="previewImages.length"
                :key="previewImageIndex"
                :src="previewImages[previewImageIndex]?.src"
                :alt="products[previewItem.id]?.title || previewItem.fallbackTitle"
                class="preview-image"
              />
              <span v-else class="preview-media-placeholder">
                {{ previewItem.label }}
              </span>
            </div>

            <div v-if="previewImages.length > 1" class="preview-thumbs">
              <button
                v-for="(image, idx) in previewImages.slice(0, 6)"
                :key="idx"
                type="button"
                class="preview-thumb"
                :class="{ 'is-active': idx === previewImageIndex }"
                @click="previewImageIndex = idx"
              >
                <img :src="image.src" alt="" />
              </button>
            </div>
          </div>

          <!-- Details -->
          <div class="preview-info">
            <div class="label-row">
              <span class="label-id">
                <span class="accent-mark" aria-hidden="true"></span>
                {{ previewItem.label }}
              </span>
              <span class="label-meta">№ {{ String(previewIndex + 1).padStart(2, '0') }}</span>
            </div>

            <h2 class="preview-title">{{ products[previewItem.id]?.title || previewItem.fallbackTitle }}</h2>
            <span v-if="products[previewItem.id]?.price" class="preview-price">
              {{ products[previewItem.id]?.price }}
            </span>

            <span class="accent-rule" aria-hidden="true"></span>

            <div
              v-if="products[previewItem.id]?.descriptionHtml"
              class="preview-description text-secondary"
              v-html="products[previewItem.id]?.descriptionHtml"
            ></div>
            <p v-else class="preview-description text-secondary">{{ previewItem.blurb }}</p>

            <dl class="preview-facts">
              <div class="fact-row">
                <dt>Ships</dt>
                <dd>End of August</dd>
              </div>
              <div class="fact-row">
                <dt>Gives Back</dt>
                <dd>$5 per order to Emergent Campus</dd>
              </div>
              <div class="fact-row">
                <dt>Checkout</dt>
                <dd>Secure, on our store</dd>
              </div>
            </dl>

            <a
              :href="products[previewItem.id]?.onlineStoreUrl || storeFallbackUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="preview-buy"
            >
              {{ previewItem.buyLabel }}<template v-if="products[previewItem.id]?.price"> — {{ products[previewItem.id]?.price }}</template>
              <span class="buy-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </SlideInModal>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Footer, PageHero, SlideInModal, ModalBackButton } from '@/components'

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
const previewIndex = ref(0)
const previewImageIndex = ref(0)

const previewImages = computed(() =>
  previewItem.value ? products.value[previewItem.value.id]?.images ?? [] : []
)

const openPreview = (item: (typeof items)[number], index: number) => {
  previewItem.value = item
  previewIndex.value = index
  previewImageIndex.value = 0
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
.shop-page {
  min-height: 100vh;
  font-variant-numeric: tabular-nums;
}

.shop-body {
  padding: 5rem var(--container-padding) 8rem;
  background: var(--color-bg-primary);
}

/* Shared micro-caps label anatomy */
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-secondary);
}

.label-meta { white-space: nowrap; }

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

[data-accent="1"] .accent-mark, .accent-mark[data-accent="1"] { background: var(--color-accent-1); }
[data-accent="2"] .accent-mark, .accent-mark[data-accent="2"] { background: var(--color-accent-2); }
[data-accent="3"] .accent-mark, .accent-mark[data-accent="3"] { background: var(--color-accent-3); }

/* ─────────────── Presale: editorial band ─────────────── */
.presale-band {
  display: grid;
  grid-template-columns: 6fr 5fr;
  gap: 5rem;
  padding: 0 0 4.5rem;
  margin-bottom: 4.5rem;
  border-bottom: 1px solid var(--hairline);
}

.presale-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 1.75rem;
}

.presale-headline {
  font-size: 2.25rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin: 0;
}

.presale-details p {
  font-size: 0.9375rem;
  line-height: 1.8;
  margin: 0 0 1.25rem;
}

.presale-facts {
  margin: 2rem 0 0;
  border-top: 1px solid var(--hairline);
}

.fact-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--hairline);
}

.fact-row dt {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.fact-row dd {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  text-align: right;
  color: var(--color-text-primary);
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
  gap: clamp(2rem, 4vw, 3rem);
}

.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.product-card:hover,
.product-card:focus-visible {
  background: #ffffff;
  border-color: var(--hairline-strong);
  outline: none;
}

/* Full-bleed media field, tinted with the product's own accent. Fixed height
   keeps all three frames identical regardless of artwork. */
.card-media {
  position: relative;
  height: clamp(20rem, 24vw, 24rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.25rem;
  overflow: hidden;
  border-bottom: 1px solid var(--hairline);
}

.product-card[data-accent="1"] .card-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-1) 20%, transparent), color-mix(in srgb, var(--color-accent-1) 6%, transparent)); }
.product-card[data-accent="2"] .card-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-2) 26%, transparent), color-mix(in srgb, var(--color-accent-2) 8%, transparent)); }
.product-card[data-accent="3"] .card-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-3) 20%, transparent), color-mix(in srgb, var(--color-accent-3) 6%, transparent)); }

.card-media img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 24px 38px rgba(0, 0, 0, 0.24));
  transition: transform 0.7s cubic-bezier(0.16, 0.84, 0.44, 1);
}

.product-card:hover .card-media img { transform: scale(1.045) translateY(-4px); }

.card-media-placeholder {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.75rem 2rem 1.75rem;
}

.card-body .label-row { margin-bottom: 1.25rem; }

.card-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  line-height: 1.18;
  letter-spacing: -0.02em;
  margin: 0 0 0.85rem;
}

.card-blurb {
  font-size: 0.9375rem;
  line-height: 1.65;
  margin: 0 0 1.75rem;
}

.card-foot {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hairline);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.card-price {
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
}

.card-actions {
  display: flex;
  align-items: baseline;
  gap: 1.75rem;
}

.card-preview,
.card-buy {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding-bottom: 0.3rem;
  white-space: nowrap;
}

.card-preview {
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.product-card:hover .card-preview {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

.card-buy {
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-text-primary);
  transition: opacity var(--transition-fast);
}

.card-buy:hover { opacity: 0.55; }

.card-soon {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-tertiary);
}

/* ─────────────── Preview panel ─────────────── */
.preview-panel {
  padding: 2rem 3rem 6rem;
}

.panel-back { margin-bottom: 1.5rem; }

.preview-layout {
  display: grid;
  grid-template-columns: 6fr 5fr;
  gap: 5rem;
  max-width: 1160px;
  margin: 1.5rem auto 0;
  align-items: start;
}

.preview-gallery {
  position: sticky;
  top: 5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-media {
  position: relative;
  min-height: 520px;
  border: 1px solid var(--hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem;
}

.preview-panel[data-accent="1"] .preview-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-1) 20%, transparent), color-mix(in srgb, var(--color-accent-1) 6%, transparent)); }
.preview-panel[data-accent="2"] .preview-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-2) 26%, transparent), color-mix(in srgb, var(--color-accent-2) 8%, transparent)); }
.preview-panel[data-accent="3"] .preview-media { background: linear-gradient(160deg, color-mix(in srgb, var(--color-accent-3) 20%, transparent), color-mix(in srgb, var(--color-accent-3) 6%, transparent)); }

.preview-image {
  max-width: 100%;
  max-height: 520px;
  object-fit: contain;
  filter: drop-shadow(0 28px 44px rgba(0, 0, 0, 0.26));
  animation: image-settle 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes image-settle {
  from { opacity: 0; filter: blur(8px) drop-shadow(0 28px 44px rgba(0, 0, 0, 0)); }
  to { opacity: 1; filter: blur(0) drop-shadow(0 28px 44px rgba(0, 0, 0, 0.26)); }
}

.preview-media-placeholder {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
}

.preview-thumbs {
  display: flex;
  gap: 0.75rem;
}

.preview-thumb {
  width: 64px;
  height: 64px;
  padding: 0.4rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--hairline);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-thumb:hover { border-color: var(--hairline-strong); }

.preview-thumb.is-active {
  background: #ffffff;
  border-color: var(--color-text-primary);
}

.preview-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.preview-info .label-row {
  width: 100%;
  margin-bottom: 2rem;
}

.preview-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 1rem;
}

.preview-price {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
}

.accent-rule {
  display: block;
  width: 32px;
  height: 1px;
  margin: 2rem 0;
}

.preview-panel[data-accent="1"] .accent-rule { background: var(--color-accent-1); }
.preview-panel[data-accent="2"] .accent-rule { background: var(--color-accent-2); }
.preview-panel[data-accent="3"] .accent-rule { background: var(--color-accent-3); }

.preview-description {
  font-size: 0.9375rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.preview-description :deep(p) { margin-bottom: 1rem; }
.preview-description :deep(p:last-child) { margin-bottom: 0; }
.preview-description :deep(ul) { padding-left: 1.25rem; margin-bottom: 1rem; }
.preview-description :deep(strong) { font-weight: var(--font-weight-medium); color: var(--color-text-primary); }

.preview-facts {
  width: 100%;
  margin: 0 0 2.5rem;
  border-top: 1px solid var(--hairline);
}

.preview-buy {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 2.75rem;
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

.buy-arrow {
  display: inline-block;
  transition: transform var(--transition-fast);
}

.preview-buy:hover .buy-arrow { transform: translateX(4px); }

/* ─────────────── Responsive ─────────────── */
@media (max-width: 1024px) {
  .presale-band {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    max-width: 28rem;
    margin: 0 auto;
  }

  .shop-body { padding-top: 4rem; }

  .presale-headline { font-size: 1.75rem; }

  .preview-panel { padding: 1.5rem 1.75rem 4rem; }
  .preview-layout { grid-template-columns: 1fr; gap: 2.5rem; }
  .preview-gallery { position: static; }
  .preview-media { min-height: 320px; padding: 2rem; }
  .preview-image { max-height: 320px; }
  .preview-title { font-size: 1.875rem; }
}
</style>
