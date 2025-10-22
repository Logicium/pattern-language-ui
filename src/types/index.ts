export interface Pattern {
  id: number
  title: string
  description: string
  addresses: string[]
}

export interface CaseStudy {
  id: number
  location: string
  color: string
  title: string
  problem: string
  solution: string
  patterns: string[]
}

export interface ConstellationNode {
  x: number
  y: number
  targetX: number
  targetY: number
  label: string
  opacity: number
}
