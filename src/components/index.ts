import { defineAsyncComponent } from 'vue'

export { default as Navbar } from './layout/Navbar.vue'
export { default as Footer } from './layout/Footer.vue'
export { default as PageHero } from './layout/PageHero.vue'
export { default as DashboardPageHeader } from './layout/DashboardPageHeader.vue'
export { default as BrandLogo } from './layout/BrandLogo.vue'
export { default as HeroSection } from './sections/HeroSection.vue'
export { default as FeaturedPatternsSection } from './sections/FeaturedPatternsSection.vue'
export { default as FeaturedStoriesSection } from './sections/FeaturedStoriesSection.vue'
export { default as CTASection } from './sections/CTASection.vue'
export { default as AiAvatar } from './AiAvatar.vue'
// The three.js canvases are decorative and heavy; async so three.js stays out
// of the initial bundle and loads after first paint.
export const RibbonCanvas = defineAsyncComponent(() => import('./RibbonCanvas.vue'))
export const LatticeCanvas = defineAsyncComponent(() => import('./hero/LatticeCanvas.vue'))
export const OrbitCanvas = defineAsyncComponent(() => import('./hero/OrbitCanvas.vue'))
export { default as HeroBackdrop } from './hero/HeroBackdrop.vue'
export { default as PatternConstellation } from './PatternConstellation.vue'
export { default as Pagination } from './Pagination.vue'
export { default as ConfirmModal } from './ConfirmModal.vue'
export { default as ErrorModal } from './ErrorModal.vue'
export { default as MessageModal } from './MessageModal.vue'
export { default as Toast } from './Toast.vue'
export { default as PlaybookPreview } from './PlaybookPreview.vue'
export { default as SlideInModal } from './SlideInModal.vue'
export { default as AppCheckbox } from './AppCheckbox.vue'
export { default as AppDropdown } from './AppDropdown.vue'
export { default as ColorPicker } from './ColorPicker.vue'
