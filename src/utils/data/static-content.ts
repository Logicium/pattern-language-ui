/**
 * Static content: team members, principles, and UI text
 */

export const typingPhrases = [
  "create affordable housing for returning youth?",
  "revive our downtown with local makers?",
  "build a community learning hub?",
  "turn heritage into sustainable income?",
  "establish a timebank for local services?",
  "develop a regenerative food system?"
]

export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Joze Petrich',
    role: 'Founder & Pattern Architect',
    bio: 'Built Emergent Campus in Trinidad, CO. Inspired by Christopher Alexander\'s work and a decade of community development.'
  },
  {
    id: 2,
    name: 'Community Contributors',
    role: 'Rural Leaders Network',
    bio: 'Patterns co-created with practitioners across rural America—mayors, organizers, entrepreneurs, and neighbors building resilience.'
  }
]

export const principles = [
  {
    id: 1,
    title: 'Start Where You Are',
    description: 'No silver bullets. Pick one or two patterns that fit your context and build momentum with small wins.'
  },
  {
    id: 2,
    title: 'Community Decides',
    description: 'AI suggests pathways, but people shape the future. Final decisions belong to the community, always.'
  },
  {
    id: 3,
    title: 'Build in Public',
    description: 'Share progress, iterate openly, and learn from other towns doing the work.'
  },
  {
    id: 4,
    title: 'Trust Takes Time',
    description: 'Sustainable change requires consistent, visible action. Keep your promises and momentum follows.'
  }
]
