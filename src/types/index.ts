export interface Pattern {
  id: number
  title: string
  description: string
  addresses: string[]
  problem?: string
  context?: string
  solution?: string
  implementation?: string[]
  examples?: string[]
  relatedPatterns?: string[]
  category?: string
}

export interface CaseStudy {
  id: number
  location: string
  color: string
  image?: string
  title: string
  problem: string
  solution: string
  patterns: string[]
  excerpt?: string
  timeframe?: string
}

export interface Challenge {
  id: number
  title: string
  description: string
  context: string
  manifestations: string[]
  relatedPatterns: string[]
}

export interface Link {
  id: number
  location: string
  name: string
  url: string
  description: string
  category?: string
}

export interface ConstellationNode {
  x: number
  y: number
  targetX: number
  targetY: number
  label: string
  opacity: number
}

export type AvatarState = 'idle' | 'thinking' | 'chatting'
