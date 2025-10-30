/**
 * Central data exports for the Pattern Language application
 * 
 * This index file provides a single import point for all data modules:
 * - Links: External resources and organizations
 * - Challenges: Core rural community challenges
 * - Patterns: 45 regenerative patterns across 6 categories
 * - Stories: Case studies and real-world examples
 * - Static Content: Team info, principles, and UI text
 */

// Re-export all data modules
export * from './links'
export * from './challenges'
export * from './patterns'
export * from './stories'
export * from './static-content'

// Derived data
import { allPatterns } from './patterns'
import type { Pattern } from '@/types'

/**
 * First 6 patterns for homepage featured section
 */
export const highlightedPatterns: Pattern[] = allPatterns.slice(0, 6)
