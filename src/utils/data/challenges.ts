import type { Challenge } from '@/types'

/**
 * Core challenges facing rural communities
 */
export const allChallenges: Challenge[] = [
  {
    id: 1,
    title: 'Youth Flight & Talent Drain',
    description: 'Young people leave for education or work and don\'t return.',
    context: 'Youth leave rural areas for perceived opportunities elsewhere, often never returning even when they want to. This creates a self-reinforcing cycle where fewer young people means fewer services, which drives more youth away.',
    manifestations: [
      'Declining school enrollment and eventual school closures',
      'Aging workforce with no succession planning',
      'Loss of community vitality and innovative thinking',
      'Decreased tax base and public service capacity',
      'Difficulty attracting new businesses due to labor shortages'
    ],
    relatedPatterns: ['Youth Return Pathway', 'Creative Apprenticeships', 'Local Pride Rituals', 'Village Learning Hub']
  },
  {
    id: 2,
    title: 'Aging Population Without Succession',
    description: 'Businesses, farms, and leadership face a cliff with no handoff plan.',
    context: 'As baby boomers retire, many rural businesses, farms, and civic organizations face closure because no succession plan exists. Knowledge, relationships, and enterprises disappear overnight.',
    manifestations: [
      'Main street businesses closing permanently when owners retire',
      'Agricultural land sold to corporate buyers or developers',
      'Loss of institutional memory and local expertise',
      'Leadership gaps in civic organizations and government',
      'Disruption of essential services and supply chains'
    ],
    relatedPatterns: ['Generational Transition Planning', 'Elder Mentorship Circles', 'Creative Apprenticeships', 'Community Land Trust']
  },
  {
    id: 3,
    title: 'Low Civic Trust',
    description: 'Division and broken promises make it hard to believe people and institutions will act fairly.',
    context: 'Years of broken promises, political polarization, and institutional failures erode the foundational trust needed for collective action. Without trust, communities can\'t organize effectively.',
    manifestations: [
      'Low participation in civic meetings and elections',
      'Suspicion of new initiatives and outside help',
      'Difficulty forming coalitions across different groups',
      'Rumors and misinformation spread quickly',
      'Projects stall due to lack of buy-in and cooperation'
    ],
    relatedPatterns: ['Trust Infrastructure', 'Community Anchor Point', 'Listening Infrastructure', 'Nested Governance Tables']
  },
  {
    id: 4,
    title: 'Isolation & Disconnection',
    description: 'Distance, weak infrastructure, and social fragmentation limit collaboration and belonging.',
    context: 'Physical distance is compounded by digital divides, transportation barriers, and social fragmentation. People feel alone even in communities with shared challenges.',
    manifestations: [
      'Mental health challenges and increased substance abuse',
      'Difficulty coordinating collective action',
      'Lack of knowledge about available resources and opportunities',
      'Social divisions along economic, political, or cultural lines',
      'Elders, disabled, and low-income residents especially isolated'
    ],
    relatedPatterns: ['Community Anchor Point', 'Village Broadcast Loop', 'Digital Root System', 'Multipurpose Mobility Hubs']
  },
  {
    id: 5,
    title: 'Economic Stagnation',
    description: 'Few ways to build local wealth; dependence on declining or extractive industries.',
    context: 'Traditional rural industries decline while new economic opportunities don\'t emerge. Wealth flows out to distant corporations and urban centers, leaving communities poorer.',
    manifestations: [
      'Declining wages and incomes compared to urban areas',
      'Loss of local businesses to chain stores or closures',
      'Young people forced to leave for economic opportunity',
      'Tax base erosion affecting public services',
      'Dependence on boom-bust extractive industries'
    ],
    relatedPatterns: ['Regenerative Micro-Enterprise', 'Creative Workyards', 'Culture-as-Economy', 'Main Street Reawakening']
  },
  {
    id: 6,
    title: 'Lack of Shared Vision',
    description: 'Competing priorities stall collective action.',
    context: 'Without a unifying vision, communities fragment into competing factions. Energy gets spent on conflicts rather than building shared futures.',
    manifestations: [
      'Endless debates without decisions or action',
      'Multiple groups working on similar issues in parallel',
      'Inability to prioritize limited resources effectively',
      'New leaders encounter resistance and burnout',
      'Community plans sit on shelves unused'
    ],
    relatedPatterns: ['Shared Cultural Story', 'Nested Governance Tables', 'Civic Intermediary Table', 'Listening Infrastructure']
  },
  {
    id: 7,
    title: 'Generational Poverty',
    description: 'Limited mobility and opportunity passed down over decades.',
    context: 'Systemic barriers create cycles of poverty that span generations. Lack of access to education, capital, and networks makes upward mobility nearly impossible.',
    manifestations: [
      'Limited educational attainment and skill development',
      'Poor health outcomes and reduced life expectancy',
      'Housing insecurity and substandard living conditions',
      'Difficulty accessing credit and capital for entrepreneurship',
      'Children inheriting economic disadvantages of parents'
    ],
    relatedPatterns: ['Village Learning Hub', 'Micro-Credential Academy', 'Commons Finance Toolkit', 'Community Land Trust']
  },
  {
    id: 8,
    title: 'Polarization',
    description: 'Social and political divides block dialogue and cooperation.',
    context: 'National political polarization manifests locally, fracturing communities along partisan, cultural, and economic lines. Common ground becomes difficult to find.',
    manifestations: [
      'Social groups segregate along political or cultural identities',
      'Productive dialogue becomes impossible on contentious issues',
      'Win-lose thinking dominates over problem-solving',
      'Community events and spaces become politicized',
      'Leaders face attacks regardless of the merits of their proposals'
    ],
    relatedPatterns: ['Trust Infrastructure', 'Shared Cultural Story', 'Listening Infrastructure', 'Intergenerational Wisdom Exchange']
  },
  {
    id: 9,
    title: 'Institutional Distrust',
    description: 'Wariness toward outside funders or agencies after past harms.',
    context: 'Extractive relationships with outside institutions—universities, agencies, corporations—leave communities wary of new partnerships. Past harms create legitimate skepticism.',
    manifestations: [
      'Resistance to university research and data collection',
      'Suspicion of government programs and regulations',
      'Difficulty recruiting for new initiatives with outside partners',
      'Community knowledge and assets not leveraged for fear of exploitation',
      'Grant funding sits unused due to distrust of strings attached'
    ],
    relatedPatterns: ['Institutional Partnership Liaisons', 'Community-Based Research', 'Trust Infrastructure', 'Public Data Commons']
  },
  {
    id: 10,
    title: 'Underused Local Assets',
    description: 'Skills, land, and spaces sit idle for lack of connection or coordination.',
    context: 'Communities have untapped resources—empty buildings, skilled retirees, available land—but lack systems to match assets with needs effectively.',
    manifestations: [
      'Vacant buildings deteriorate on main streets',
      'Retired professionals with valuable skills don\'t mentor or teach',
      'Agricultural land sits fallow or is underutilized',
      'Equipment and tools owned but not shared',
      'Cultural and heritage assets not leveraged for economic benefit'
    ],
    relatedPatterns: ['Community Anchor Point', 'Elder Mentorship Circles', 'Social Timebank', 'Heritage-to-Market Program']
  },
  {
    id: 11,
    title: 'Food Insecurity & Fragile Supply Chains',
    description: 'Weak local food systems leave residents vulnerable.',
    context: 'Despite growing food, many rural areas are food deserts. Long supply chains, lack of processing infrastructure, and limited retail options create vulnerability.',
    manifestations: [
      'Limited access to fresh, healthy, affordable food',
      'Small farms struggle without processing and distribution',
      'Reliance on distant supply chains vulnerable to disruption',
      'Dollar stores replace grocery stores',
      'Diet-related health problems increase'
    ],
    relatedPatterns: ['Food Infrastructure Spine', 'Regenerative Micro-Enterprise', 'Commons Stewardship', 'Circular Water Systems']
  },
  {
    id: 12,
    title: 'Infrastructure Decay',
    description: 'Broadband, roads, water, and public spaces lag or fail.',
    context: 'Aging infrastructure deteriorates faster than it\'s maintained or replaced. Limited tax bases and deferred maintenance create cascading failures.',
    manifestations: [
      'Inadequate or nonexistent broadband internet',
      'Crumbling roads and bridges',
      'Aging water and sewer systems failing',
      'Deteriorating public buildings and spaces',
      'Lack of modern energy infrastructure'
    ],
    relatedPatterns: ['Digital Root System', 'Circular Water Systems', 'Resilient Energy Microgrids', 'Main Street Reawakening']
  },
  {
    id: 13,
    title: 'Civic Apathy',
    description: 'Low participation in decisions and leadership.',
    context: 'When people feel powerless to change conditions, they stop participating. This creates a vicious cycle where fewer voices lead to worse decisions.',
    manifestations: [
      'Low voter turnout and civic meeting attendance',
      'Difficulty recruiting volunteers and board members',
      'Same few people doing all the work and burning out',
      'Young people especially disengaged from local governance',
      'Important decisions made by small, unrepresentative groups'
    ],
    relatedPatterns: ['Nested Governance Tables', 'Local Pride Rituals', 'Youth Return Pathway', 'Listening Infrastructure']
  },
  {
    id: 14,
    title: 'Environmental Degradation',
    description: 'Land, water, and ecosystems damaged by neglect or extraction.',
    context: 'Extractive industries, industrial agriculture, and climate change degrade the natural systems that rural communities depend on.',
    manifestations: [
      'Soil erosion and declining agricultural productivity',
      'Water pollution and aquifer depletion',
      'Loss of biodiversity and ecosystem services',
      'Increased vulnerability to floods, droughts, and fires',
      'Health impacts from environmental contamination'
    ],
    relatedPatterns: ['Regenerative Micro-Enterprise', 'Circular Water Systems', 'Commons Stewardship', 'Eco-Adaptive Building Codes']
  },
  {
    id: 15,
    title: 'Institutional Breakdown',
    description: 'Local or regional institutions lose capacity, leaving gaps in essential services.',
    context: 'Schools, hospitals, government offices, and nonprofits close or dramatically reduce services. Communities lose the institutional capacity to address challenges.',
    manifestations: [
      'School consolidations and closures',
      'Hospital and clinic closures creating healthcare deserts',
      'Post offices and government services relocate or close',
      'Nonprofit capacity erodes due to funding and staffing challenges',
      'Essential services become inaccessible or unaffordable'
    ],
    relatedPatterns: ['Community Anchor Point', 'Local Capacity Backbone', 'Regional Mutual Aid Protocols', 'Shared Grant Navigator Network']
  }
]
