import type { Pattern, CaseStudy } from '@/types'

export const highlightedPatterns: Pattern[] = [
  {
    id: 1,
    title: 'Community Anchor Point',
    description: 'A welcoming, multipurpose hub where everything connects—programs, people, and possibility.',
    addresses: ['Isolation', 'Fragmentation', 'Low Trust']
  },
  {
    id: 2,
    title: 'Youth Return Pathway',
    description: 'Clear, welcoming routes for young people to come home and thrive with purpose.',
    addresses: ['Talent Drain', 'Aging Population']
  },
  {
    id: 3,
    title: 'Creative Workyards',
    description: 'Shared spaces for making, learning, and building creative enterprises.',
    addresses: ['Economic Stagnation', 'Underused Assets']
  },
  {
    id: 4,
    title: 'Digital Root System',
    description: 'Community-led broadband as the backbone for modern rural life and opportunity.',
    addresses: ['Infrastructure Decay', 'Skills Gap']
  },
  {
    id: 5,
    title: 'Social Timebank',
    description: 'A circular system where time and skills count alongside money.',
    addresses: ['Low Civic Trust', 'Civic Apathy']
  },
  {
    id: 6,
    title: 'Village Learning Hub',
    description: 'Flexible, local learning for all ages—from certifications to creative skills.',
    addresses: ['Skills Gap', 'Generational Poverty']
  }
]

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    location: 'Trinidad, Colorado',
    color: '#e8b4a0',
    title: 'From Ghost Town to Creative Hub',
    problem: 'Downtown vacancy, youth flight, and declining population left the historic main street empty.',
    solution: 'Emergent Campus created a mixed-use community anchor with coworking, youth programs, and cultural activation.',
    patterns: ['Community Anchor', 'Creative Workyards', 'Main Street']
  },
  {
    id: 2,
    location: 'Rural Nebraska',
    color: '#b8d4c8',
    title: 'School Building Becomes Community Center',
    problem: 'Closed school left a gap in community gathering space and youth programming.',
    solution: 'Multi-use resource center with workforce training, library services, and civic hub.',
    patterns: ['Anchor Point', 'Learning Hub', 'Micro-Credential']
  },
  {
    id: 3,
    location: 'Eastern Oregon',
    color: '#c9b8e8',
    title: 'Mobile Anchor Reaches Remote Residents',
    problem: 'Distance and transportation barriers prevented residents from accessing services.',
    solution: 'Converted bus as mobile community center bringing programs to isolated areas.',
    patterns: ['Anchor Point', 'Mobility Hubs', 'Digital Literacy']
  }
]

export const typingPhrases = [
  "create affordable housing for returning youth?",
  "revive our downtown with local makers?",
  "build a community learning hub?",
  "turn heritage into sustainable income?",
  "establish a timebank for local services?",
  "develop a regenerative food system?"
]
