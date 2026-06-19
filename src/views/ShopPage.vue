<template>
  <div class="shop-page">
    <Navbar />

    <PageHero
      label="Shop"
      title="The Book"
      subtitle="The methodology behind Pattern Language —<br>in print, in your hands, on your shelf."
    />

    <section class="section product-section">
      <div class="container product-layout">
        <div class="product-art">
          <img v-if="productData?.images?.length" :src="productData.images[0].src" :alt="productData.title" class="book-cover" />
          <div class="cover-placeholder" v-else>
            <span class="text-xs text-tertiary">Cover</span>
          </div>
        </div>

        <div class="product-detail">
          <span class="label text-xs text-tertiary">By Jože Petrich</span>
          <h2 class="product-title">{{ productData?.title || 'A Pattern Language for Rural Regeneration' }}</h2>
          <div class="product-price text-xl text-secondary" v-if="productData?.price">{{ productData.price }}</div>
          
          <div class="product-tagline text-secondary" v-if="productData?.descriptionHtml" v-html="productData.descriptionHtml"></div>
          <p class="product-tagline text-secondary" v-else>
            A field guide to the patterns rural communities use to build resilience,
            opportunity, and belonging — adapted from Christopher Alexander, forged in
            practice.
          </p>

          <div v-if="configured" class="buy-button-shell">
            <a
              v-if="storeFallbackUrl || productData?.onlineStoreUrl"
              :href="productData?.onlineStoreUrl || storeFallbackUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="buy-fallback btn btn-lg"
            >
              Buy on Shopify <span class="chevron">⌝</span>
            </a>
          </div>

          <!-- Bespoke coming-soon panel -->
          <div v-else class="coming-soon">
            <div class="coming-soon-marquee">
              <span class="marquee-dot" data-accent="1"></span>
              <span class="marquee-dot" data-accent="2"></span>
              <span class="marquee-dot" data-accent="3"></span>
            </div>
            <span class="coming-soon-label text-xs text-tertiary">In the press</span>
            <h3 class="coming-soon-heading">Coming soon.</h3>
            <p class="coming-soon-body text-secondary">
              The first edition is being typeset right now. We'll let you know the moment
              it's ready to ship — first copies always go to readers on the list.
            </p>

            <form class="notify-form" @submit.prevent="onNotifySubmit">
              <label class="visually-hidden" for="notify-email">Email address</label>
              <input
                id="notify-email"
                v-model="notifyEmail"
                type="email"
                required
                placeholder="you@somewhere.good"
                class="notify-input text-sm"
                :disabled="notifyState === 'submitting' || notifyState === 'success'"
              />
              <button
                type="submit"
                class="notify-button"
                :disabled="notifyState === 'submitting' || notifyState === 'success'"
              >
                <span v-if="notifyState === 'success'">Thank you</span>
                <span v-else-if="notifyState === 'submitting'">Sending…</span>
                <span v-else>Notify me</span>
              </button>
            </form>

            <p class="coming-soon-meta text-xs text-tertiary">
              No spam, ever. One short note when the book is ready.
            </p>
          </div>
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
const SHOPIFY_PRODUCT_ID = import.meta.env.VITE_SHOPIFY_PRODUCT_ID as string | undefined
const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL as string | undefined

const configured = !!(SHOPIFY_DOMAIN && SHOPIFY_STOREFRONT_TOKEN && SHOPIFY_PRODUCT_ID)
const storeFallbackUrl = SHOPIFY_STORE_URL || (SHOPIFY_DOMAIN ? `https://${SHOPIFY_DOMAIN}` : '')

const notifyEmail = ref('')
const notifyState = ref<'idle' | 'submitting' | 'success'>('idle')
const productData = ref<any>(null) // Holds the dynamically fetched Shopify product data

async function onNotifySubmit() {
  notifyState.value = 'submitting'
  // Stash locally until a backend list endpoint exists.
  try {
    const list: string[] = JSON.parse(localStorage.getItem('shop-notify-list') || '[]')
    if (!list.includes(notifyEmail.value)) list.push(notifyEmail.value)
    localStorage.setItem('shop-notify-list', JSON.stringify(list))
  } catch {
    // Ignore storage failures — UI still confirms.
  }
  notifyState.value = 'success'
}

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

onMounted(async () => {
  if (!configured) return
  try {
    const ShopifyBuy = await loadBuyButtonSdk()
    const client = ShopifyBuy.buildClient({
      domain: SHOPIFY_DOMAIN,
      storefrontAccessToken: SHOPIFY_STOREFRONT_TOKEN,
    })

    // Fetch the product directly from the Storefront API.
    // The Storefront API client typically expects the full gid:// string.
    const fullId = SHOPIFY_PRODUCT_ID?.startsWith('gid://') 
      ? SHOPIFY_PRODUCT_ID 
      : `gid://shopify/Product/${SHOPIFY_PRODUCT_ID}`

    const product = await client.product.fetch(fullId)
    if (product) {
      // Extract price from the first variant
      const variant = product.variants?.[0]
      let formattedPrice = ''
      if (variant?.price) {
        // Handle both older string format and newer object format
        const amount = variant.price.amount || variant.price
        const currency = variant.price.currencyCode || 'USD'
        formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
      }

      // Extract only what we need into a plain object. 
      // This prevents Vue from attempting to Proxy Shopify's internal read-only objects.
      productData.value = {
        title: product.title,
        descriptionHtml: product.descriptionHtml,
        onlineStoreUrl: product.onlineStoreUrl,
        images: product.images?.map((img: any) => ({ src: img.src || img.url || '' })) || [],
        price: formattedPrice
      }
    }
  } catch (error) {
    console.error('Failed to fetch Shopify product data:', error)
  }
})
</script>

<style scoped>
.shop-page { min-height: 100vh; }

.product-section { background: var(--color-bg-primary); }

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 6rem;
  align-items: start;
}

.product-art { position: sticky; top: 6rem; }

.book-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border: 1px solid rgba(42, 42, 42, 0.08);
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.15);
}

.cover-placeholder {
  aspect-ratio: 2 / 3;
  background: linear-gradient(
    135deg,
    rgba(232, 180, 160, 0.12),
    rgba(184, 212, 200, 0.12),
    rgba(201, 184, 232, 0.12)
  );
  border: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 1.25rem;
}

.product-detail .label { margin-bottom: 1rem; }

.product-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.product-price {
  font-weight: var(--font-weight-medium);
  margin-bottom: 1.5rem;
}

.product-tagline {
  font-size: 1.0625rem;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.buy-button-shell {
  padding-top: 2rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.buy-button-mount { min-height: 60px; }

.buy-fallback {
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

/* Coming-soon panel */
.coming-soon {
  position: relative;
  padding: 2.5rem 2rem 2.25rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  background:
    linear-gradient(
      135deg,
      rgba(232, 180, 160, 0.06),
      rgba(184, 212, 200, 0.06),
      rgba(201, 184, 232, 0.08)
    );
  overflow: hidden;
}

.coming-soon::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 18%, rgba(232, 180, 160, 0.14), transparent 38%),
    radial-gradient(circle at 88% 82%, rgba(201, 184, 232, 0.14), transparent 42%);
  pointer-events: none;
}

.coming-soon-marquee {
  display: flex;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.marquee-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-soft 2.4s ease-in-out infinite;
}

.marquee-dot[data-accent="1"] { background: var(--color-accent-1, #d47b5f); }
.marquee-dot[data-accent="2"] {
  background: var(--color-accent-2, #b8d4c8);
  animation-delay: 0.3s;
}
.marquee-dot[data-accent="3"] {
  background: var(--color-accent-3, #c9b8e8);
  animation-delay: 0.6s;
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.coming-soon-label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  display: block;
  margin-bottom: 0.75rem;
  position: relative;
}

.coming-soon-heading {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 1rem;
  position: relative;
}

.coming-soon-body {
  font-size: 1rem;
  line-height: 1.75;
  margin-bottom: 2rem;
  max-width: 32rem;
  position: relative;
}

.notify-form {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border: 1px solid rgba(42, 42, 42, 0.18);
  background: var(--color-bg-primary);
  position: relative;
  transition: border-color 200ms ease;
}

.notify-form:focus-within {
  border-color: rgba(42, 42, 42, 0.55);
}

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

.notify-input::placeholder {
  color: var(--color-text-tertiary);
}

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

.notify-button:hover:not(:disabled) {
  background: #1a1a1a;
}

.notify-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.coming-soon-meta {
  position: relative;
  letter-spacing: 0.04em;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1024px) {
  .product-layout { grid-template-columns: 1fr; gap: 3rem; }
  .product-art { position: static; max-width: 320px; margin: 0 auto; }
}

@media (max-width: 768px) {
  .product-title { font-size: 2rem; }
  .coming-soon-heading { font-size: 1.5rem; }
  .coming-soon { padding: 2rem 1.5rem; }
  .notify-form { flex-direction: column; }
  .notify-button { padding: 1rem; }
}
</style>
