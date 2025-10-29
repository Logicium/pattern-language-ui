import type { Pattern, CaseStudy } from '@/types'

export const allPatterns: Pattern[] = [
  // Part I: Foundations (8 patterns)
  {
    id: 1,
    title: 'Community Anchor Point',
    description: 'A welcoming, visible, multipurpose place where everything connects.',
    addresses: ['Isolation', 'Aging Population', 'Economic Stagnation'],
    category: 'Foundations',
    problem: 'Too many rural towns don\'t have a clear "home base." People don\'t know where to go to plug in, get help, or meet others. The result: fragmentation, isolation, and duplicated effort.',
    context: 'Over time, schools, civic centers, and gathering places closed or siloed. Newcomers, young families, and small businesses can\'t see the on-ramps. Energy exists—but it\'s scattered.',
    solution: 'Stand up a physical or hybrid community anchor point—a trusted, easy-to-find hub that hosts programs, shares information, sparks collaboration, and helps people feel at home.',
    implementation: [
      'Repurpose an underused building (library, firehouse, church) as a shared-use hub',
      'Make it obviously welcoming: clear exterior signage, posted hours, simple wayfinding, a friendly host',
      'Run easy-entry programming: resource fairs, idea jams, study hall, "drop-in coffee" with a community host',
      'Keep a visible wall (and online page) of local opportunities, events, and services'
    ],
    examples: [
      'Trinidad, CO: Emergent Campus—coworking + youth + creative programs under one roof',
      'Nebraska: A multi-use school building re-opened as a town resource and collaboration space',
      'Eastern Oregon: A converted bus as a mobile anchor to reach remote residents'
    ],
    relatedPatterns: ['Village Broadcast Loop', 'Local Pride Rituals', 'Youth Return Pathway']
  },
  {
    id: 2,
    title: 'Shared Cultural Story',
    description: 'Building identity through storytelling and inclusive narrative.',
    addresses: ['Youth Flight', 'Isolation', 'Civic Apathy'],
    category: 'Foundations',
    problem: 'Fractured identity and "decline stories" sap motivation. People don\'t see themselves (or each other) in the town\'s story.',
    context: 'When industries shift and populations diversify, the old narrative stops fitting. Without a living, shared story about who we are and where we\'re headed, energy scatters and belonging thins out.',
    solution: 'Create low-barrier ways for residents to co-author the town\'s story—story circles, oral histories, podcasts, zines, public art. Lift many voices. Make what\'s shared visible, portable, and proud.',
    implementation: [
      'Host potlucks where elders and newcomers swap stories (record with consent)',
      'Launch a simple town history podcast or zine; invite youth as producers',
      'Partner with schools for art projects that spotlight local heroes and everyday makers',
      'Collect oral histories and display quotes/photos in windows, buses, and gathering places'
    ],
    examples: [
      'Nebraska: Center for Rural Affairs storytelling projects connecting legacy and youth',
      'North Carolina: "Story Circles" bridging new immigrants and long-time residents',
      'Alaska: Tribal storytelling sessions turned into illustrated classroom booklets'
    ],
    relatedPatterns: ['Local Pride Rituals', 'Culture-as-Economy', 'Intergenerational Wisdom Exchange']
  },
  {
    id: 3,
    title: 'Trust Infrastructure',
    description: 'Visible, reliable, community-run systems that make fairness real.',
    addresses: ['Low Trust', 'Polarization', 'Institutional Breakdown'],
    category: 'Foundations',
    problem: 'Low trust stalls collaboration, leadership emergence, and shared risk-taking.',
    context: 'History, politics, and institutional failures can erode trust—even when people care deeply about each other and the place.',
    solution: 'Stand up operational trust: peer mediation circles, open-door civic hours, transparent community boards, and simple shared-decision tools. Trust isn\'t just a feeling—it\'s a set of practices people can see.',
    implementation: [
      'Host trust circles or story gatherings across differences (with ground rules and a neutral host)',
      'Install a public community board or lightweight digital platform with transparent updates',
      'Offer open office hours for civic leaders or mediators—same time, same place, every week',
      'Co-write a community charter/code of conduct with residents and post it publicly'
    ],
    examples: [
      'Vermont: Front Porch Forum—moderated neighborhood boards that build day-to-day trust',
      'Oregon: Rural fire department holds quarterly open forums and publishes action logs',
      'South Dakota: Tribal-led mediation group restoring inter-family trust after conflict'
    ],
    relatedPatterns: ['Nested Governance Tables', 'Listening Infrastructure', 'Civic Intermediary Table']
  },
  {
    id: 4,
    title: 'Social Timebank',
    description: 'A circular system of value, dignity, and shared support.',
    addresses: ['Low Trust', 'Isolation', 'Civic Apathy'],
    category: 'Foundations',
    problem: 'Lack of cash, jobs, or formal credentials leaves many residents idle or isolated—even when they have skills and a willingness to help.',
    context: 'In towns with high unemployment or thin job markets, retirees, single parents, and newcomers may struggle to find paid work or on-ramps to contribute, despite having plenty to offer.',
    solution: 'Stand up a timebank where people exchange services based on time, not money. Every hour is valued equally—tutoring equals cooking equals gardening equals tech help. Reciprocity (not charity) builds pride and connection.',
    implementation: [
      'Start small (church, library, school club) and pilot with a paper/whiteboard system',
      'Choose a host who logs exchanges and mediates mismatches',
      'Promote dignity by spotlighting unique contributions (e.g., "elder tech coach," "bike fixer")',
      'Keep it low-tech at first: index cards, wall calendars, or a simple Google Form'
    ],
    examples: [
      'Mountain Time Exchange (Appalachia): Swapping tutoring, yard work, rides, and elder support',
      'Santa Fe Time Bank (NM): Volunteers earn credits for car repairs, massage therapy, and more',
      'Port Townsend Time Bank (WA): Local nonprofits participate, bridging civic groups and individuals'
    ],
    relatedPatterns: ['Talent Export Co-op', 'Community Anchor Point', 'Trust Infrastructure']
  },
  {
    id: 5,
    title: 'Local Pride Rituals',
    description: 'A culture of confidence, visibility, and belonging.',
    addresses: ['Youth Flight', 'Isolation', 'Civic Apathy'],
    category: 'Foundations',
    problem: 'Years of disinvestment (and being overlooked) flatten morale, drain talent, and blur shared identity.',
    context: 'Younger people, newcomers, and folks on the margins often feel invisible—uncertain where they fit in the town\'s story.',
    solution: 'Create simple, consistent pride rituals that make people feel seen and proud—festivals, showcases, local symbols, storytelling nights. Keep them low-barrier and repeatable so they stick.',
    implementation: [
      'Launch a monthly Local Legends night to celebrate unsung heroes',
      'Paint murals/banners with neighborhood names and local symbols',
      'Welcome newcomers and spotlight returning youth publicly',
      'Add local flavor to existing school, sports, or holiday gatherings'
    ],
    examples: [
      'Walsenburg, CO: Local shirts with "Huajatolla" to honor Indigenous place names',
      'Hazelwood, PA: Monthly "blocklight" storytelling nights with food and music',
      'Raton, NM: Youth-designed pride posters displayed in downtown windows'
    ],
    relatedPatterns: ['Intergenerational Wisdom Exchange', 'Village Broadcast Loop', 'Creative Apprenticeships']
  },
  {
    id: 6,
    title: 'Commons Stewardship',
    description: 'A community-led approach to protecting and renewing shared spaces and resources.',
    addresses: ['Low Trust', 'Environmental Degradation', 'Civic Apathy'],
    category: 'Foundations',
    problem: 'Public assets—parks, greens, waterways, buildings—slip into neglect, privatization, or misuse when no one clearly owns their care.',
    context: 'Rural places hold shared spaces tied to identity and wellbeing. Without organized stewardship, they degrade—or disappear into private sale and disrepair.',
    solution: 'Create stewardship groups that take responsibility for the commons through clear agreements, shared budgets, and collaborative planning. Give residents real ownership in caring for places everyone values.',
    implementation: [
      'Host "imagination nights" to gather ideas for how spaces could better serve the community',
      'Invite visual artists to create murals/maps of possible futures for the commons',
      'Assign simple, rotating roles (park monitor, trail cleaner, garden caretaker)',
      'Start with easy-win sites: pocket parks, vacant lots, community gardens'
    ],
    examples: [
      'Wales: Rural regions use "vision maps" to plan for common land collectively',
      'New Mexico: Acequia Associations coordinate shared care for irrigation canals',
      'Vermont: Village greens maintained by volunteer committees with rotating leadership'
    ],
    relatedPatterns: ['Community Land Trust', 'Resilient Energy Microgrids', 'Trust Infrastructure']
  },
  {
    id: 7,
    title: 'Village Broadcast Loop',
    description: 'Amplifying local voice, visibility, and coordination through grassroots media.',
    addresses: ['Low Trust', 'Isolation', 'Civic Apathy'],
    category: 'Foundations',
    problem: 'Information doesn\'t flow. Events, opportunities, and services exist—but many people never hear about them. Traditional media has faded; online spaces are fragmented or hard to access.',
    context: 'Flyers, word-of-mouth, and small-town Facebook groups are common but uneven. Elders, shift workers, newcomers, and non-English speakers often get left out.',
    solution: 'Build a consistent, human-centered broadcast loop that meets people where they are—mix analog and digital channels to share timely updates, celebrate small wins, and invite participation.',
    implementation: [
      'Publish a monthly "What\'s Happening" digest (print, SMS, radio, email)',
      'Recruit neighborhood info stewards to gather/share updates',
      'Post at high-traffic analog touchpoints: grocery, clinic, church, post office, café, farm co-op',
      'Keep content short, visual, bilingual (as needed), inclusion-first'
    ],
    examples: [
      'Alabama (Black Belt): Youth-led radio segments with elder interviews + announcements',
      'Colorado: Bilingual WhatsApp groups moderated by trusted community advocates',
      'West Virginia: Bulletin-board circuit refreshed weekly by rotating volunteers'
    ],
    relatedPatterns: ['Shared Cultural Story', 'Local Pride Rituals', 'Listening Infrastructure']
  },
  {
    id: 8,
    title: 'Intergenerational Wisdom Exchange',
    description: 'Sharing stories, skills, and support between elders and youth.',
    addresses: ['Youth Flight', 'Aging Population', 'Isolation'],
    category: 'Foundations',
    problem: 'Older and younger people rarely spend time together. Elders feel sidelined; youth feel unheard. Local knowledge slips away.',
    context: 'Youth programs and senior services run in parallel. Schools, senior centers, and businesses seldom collaborate. Culture shifts make it harder to connect across ages.',
    solution: 'Create regular, low-barrier ways for elders and youth to exchange stories, skills, and support. Elders bring history and know-how; youth bring ideas, energy, and tech. Meet often enough that relationships stick.',
    implementation: [
      'Run monthly story circles or skill-swaps (cooking, repair, oral history)',
      'Pair youth with elder mentors for hands-on projects (gardening, building, genealogy)',
      'Record and archive what\'s shared (with consent) for community use',
      'Use festivals, school events, and town gatherings to mix age groups on purpose'
    ],
    examples: [
      'Appalachia: Elder Memory Project where youth interview and film local elders',
      'Maine: Boat-building apprenticeships pairing high school students with retired craftspeople',
      'North Dakota: 4-H and VFW host multi-age community meals'
    ],
    relatedPatterns: ['Youth Return Pathway', 'Local Pride Rituals', 'Creative Apprenticeships']
  },
  
  // Part II: People & Learning (8 patterns)
  {
    id: 9,
    title: 'Youth Return Pathway',
    description: 'Building bridges for young people to return home with purpose.',
    addresses: ['Youth Flight', 'Economic Stagnation', 'Civic Apathy'],
    category: 'People & Learning',
    problem: 'Rural towns lose their youth to cities—and even when young people want to come back, there\'s no clear path, job, or invitation.',
    context: 'Many leave for school or experience and would return if they could see real roles for themselves. Most towns don\'t plan for returners or keep track of who left and what they learned.',
    solution: 'Make the "come home" path visible and welcoming—mentorships, alumni networks, a simple newsletter or podcast, and light-lift "boomerang" programs that say we want you back and show where to plug in.',
    implementation: [
      'Build a "hometown alumni" network via social media, newsletter, or annual gatherings',
      'Host "come home" events during holidays when people are visiting',
      'Create a job board highlighting opportunities and entrepreneurship support',
      'Map community needs to the skills your young people are gaining away'
    ],
    examples: [
      'Vermont: "Stay to Stay" weekend programs inviting young professionals to explore rural living',
      'Kansas: Alumni coffee meetups in cities where many locals have moved',
      'West Virginia: Regional workforce teams actively recruit local grads back'
    ],
    relatedPatterns: ['Creative Apprenticeships', 'Local Pride Rituals', 'Community Anchor Point']
  },
  {
    id: 10,
    title: 'Village Learning Hub',
    description: 'Flexible, local learning for all ages and needs.',
    addresses: ['Economic Stagnation', 'Isolation', 'Generational Poverty'],
    category: 'People & Learning',
    problem: 'In too many rural places, training and classes are far away or hard to access. That shrinks job options, entrepreneurship, and personal growth.',
    context: 'Without nearby training centers—or with internet gaps—online-only learning can feel isolating or out of reach. Meanwhile, empty buildings sit ready for new life as classrooms and labs.',
    solution: 'Create a central learning hub—part physical, part online—where anyone can pick up skills, take classes, and learn from neighbors. Blend university and trade partners with local experts so it feels owned by the town.',
    implementation: [
      'Repurpose underused space (library, school wing, storefront) as a learning commons',
      'Offer hybrid programming: in-person workshops + online course access + peer study groups',
      'Partner with community colleges, trade schools, and online providers for credit-bearing options',
      'Schedule intergenerational teaching—elders, pros, and youth sharing skills'
    ],
    examples: [
      'Idaho: Rural innovation hubs blending tech training with community gathering spaces',
      'Mississippi: Library-based learning centers offering GED prep, coding, and entrepreneurship',
      'Alaska: Village learning centers pairing high schoolers with onsite workforce training'
    ],
    relatedPatterns: ['Micro-Credential Academy', 'Youth Return Pathway', 'Creative Apprenticeships']
  },
  {
    id: 11,
    title: 'Elder Mentorship Circles',
    description: 'Passing skills, stories, and wisdom across generations.',
    addresses: ['Aging Population', 'Youth Flight', 'Underused Assets'],
    category: 'People & Learning',
    problem: 'Elders hold deep skills, local history, and life lessons—but much of it goes unshared. Youth miss role models and practical know-how; the community loses living memory.',
    context: 'Aging populations and fewer natural gathering spots widen the gap between elders and youth. Schools, clubs, and civic groups rarely carve out structured, cross-generational time.',
    solution: 'Host regular mentorship circles where elders share practical skills, community history, and personal stories with younger generations. Keep the format public, informal, welcoming—and frequent enough for relationships to stick.',
    implementation: [
      'Launch monthly skill-shares: cooking, woodwork, gardening, repair, storytelling',
      'Pair youth with elder mentors on hands-on projects (building, sewing, oral history)',
      'Record sessions (with consent) for a community archive',
      '"Ask an Elder" booths at fairs, markets, and festivals'
    ],
    examples: [
      'Tennessee: Appalachian elders teach traditional food preservation in schools',
      'Montana: Retired ranchers mentor 4-H members in livestock and land stewardship',
      'Arizona: Elders lead desert-survival and native-plant workshops'
    ],
    relatedPatterns: ['Intergenerational Wisdom Exchange', 'Youth Return Pathway', 'Creative Apprenticeships']
  },
  {
    id: 12,
    title: 'Micro-Credential Academy',
    description: 'Fast, practical learning for real jobs and rural needs.',
    addresses: ['Economic Stagnation', 'Generational Poverty', 'Youth Flight'],
    category: 'People & Learning',
    problem: 'Many rural adults need new skills but can\'t spend years in school or travel far. That locks people out of better-paying work and growing industries.',
    context: 'As industries shift, reskilling becomes urgent. Traditional degrees are often too costly, too slow, or too distant to be practical.',
    solution: 'Offer short, stackable training programs—micro-credentials that can be completed in weeks, not years. Aim directly at skills tied to real local opportunities.',
    implementation: [
      'Partner with employers to identify in-demand skills (welding, solar install, IT support, healthcare)',
      'Offer focused 4–12 week courses with clear outcomes and digital badges',
      'Provide flexible scheduling (evenings, weekends, hybrid online/in-person)',
      'Design stackable courses so learners can build toward larger certifications over time'
    ],
    examples: [
      'Kentucky: Short welding certifications linked directly to manufacturing job placements',
      'Oregon: Solar panel installation micro-credentials feeding clean energy jobs',
      'Colorado: Remote IT helpdesk training linked to local internship placements'
    ],
    relatedPatterns: ['Village Learning Hub', 'Work-and-Learn Tracks', 'Youth Return Pathway']
  },
  {
    id: 13,
    title: 'Work-and-Learn Tracks',
    description: 'Learning while earning, with a clear path to local careers.',
    addresses: ['Economic Stagnation', 'Youth Flight', 'Generational Poverty'],
    category: 'People & Learning',
    problem: 'People finish training and still struggle to get hired. Employers need talent, but classroom learning doesn\'t always translate to day-one readiness.',
    context: 'You can have unemployed residents and labor shortages at the same time. Traditional training alone isn\'t enough—people need experience and a paycheck while they learn.',
    solution: 'Build structured tracks where participants split time between paid work and modular education designed with local employers. Tight loops: learn → apply → get feedback → level up.',
    implementation: [
      'Co-design programs with employers (healthcare, trades, hospitality, tech)',
      'Pay participants a training wage while they work part-time and learn',
      'Use competency-based progression tied to real tasks, not just seat time',
      'Align coursework to tasks they\'ll perform this week on the job'
    ],
    examples: [
      'Iowa: Apprenticeship programs blending classroom and paid farm/manufacturing work',
      'Montana: Healthcare aide tracks with clinic rotations and weekend coursework',
      'Alabama: Healthcare tracks with part-time hospital work during certifications'
    ],
    relatedPatterns: ['Micro-Credential Academy', 'Creative Apprenticeships', 'Village Learning Hub']
  },
  {
    id: 14,
    title: 'Creative Apprenticeships',
    description: 'Hands-on training in arts, trades, and local enterprise.',
    addresses: ['Youth Flight', 'Economic Stagnation', 'Underused Assets'],
    category: 'People & Learning',
    problem: 'Youth leave because they don\'t see pathways to creative or skilled work at home. Local craftspeople, artists, and makers struggle to find successors.',
    context: 'Traditional apprenticeships have faded, even as demand grows for handmade goods, cultural production, and skilled trades. Without structured learning pathways, knowledge dies with each generation.',
    solution: 'Launch apprenticeship programs pairing youth and adults with master practitioners in arts, trades, and heritage crafts. Pay stipends, provide workspace, and create visible pathways from learning to livelihood.',
    implementation: [
      'Identify local masters willing to teach (blacksmiths, potters, weavers, builders, chefs)',
      'Offer 6–12 month paid apprenticeships with structured skill progression',
      'Provide shared workspace and materials through a creative hub or makerspace',
      'Showcase apprentice work publicly (markets, galleries, online) to build demand'
    ],
    examples: [
      'North Carolina: Craft revival apprenticeships in woodworking and textile arts',
      'New Mexico: Pueblo pottery apprenticeships linking youth with master artisans',
      'Vermont: Farm-to-table culinary apprenticeships pairing chefs and beginning cooks'
    ],
    relatedPatterns: ['Elder Mentorship Circles', 'Creative Workyards', 'Heritage-to-Market Program']
  },
  {
    id: 15,
    title: 'Community-Based Research',
    description: 'Local knowledge generation led by residents and institutions together.',
    addresses: ['Institutional Distrust', 'Underused Assets', 'Lack of Vision'],
    category: 'People & Learning',
    problem: 'Research happens to rural communities, not with them. Data extraction leaves towns with reports on shelves and little say in what gets studied or how findings are used.',
    context: 'Universities and agencies need rural insights, but one-way research erodes trust. Meanwhile, communities hold deep knowledge that never gets documented or leveraged.',
    solution: 'Co-design research projects where residents shape questions, gather data, interpret findings, and own the outcomes. Build capacity locally while generating useful knowledge.',
    implementation: [
      'Partner with universities on community-driven research questions (housing, health, economy)',
      'Train residents as peer researchers and interviewers',
      'Share findings in accessible formats: town halls, one-pagers, videos, not just academic papers',
      'Ensure community owns data and decides how it\'s used'
    ],
    examples: [
      'Montana: Community health assessments led by residents with university technical support',
      'Appalachia: Oral history projects documenting local knowledge with academic partners',
      'Southwest: Tribal communities directing climate research priorities and protocols'
    ],
    relatedPatterns: ['Public Data Commons', 'Listening Infrastructure', 'Institutional Partnership Liaisons']
  },
  {
    id: 16,
    title: 'Digital Literacy for All',
    description: 'Ensuring everyone can fully participate in modern life.',
    addresses: ['Isolation', 'Generational Poverty', 'Economic Stagnation'],
    category: 'People & Learning',
    problem: 'Digital divides lock people out of jobs, services, and civic life. Even with broadband, many lack the skills or confidence to use digital tools effectively.',
    context: 'Telehealth, online banking, job applications, and government services increasingly require digital fluency. Without it, elders, low-income families, and non-English speakers fall further behind.',
    solution: 'Offer free, welcoming digital literacy programs in trusted spaces. Meet people where they are—from "how to send an email" to "how to start an online business."',
    implementation: [
      'Run drop-in tech help sessions at libraries, senior centers, and community hubs',
      'Train peer digital navigators from the community (especially multilingual and elder-friendly)',
      'Offer device lending programs and low-cost internet access',
      'Create simple how-to guides and videos in multiple languages'
    ],
    examples: [
      'Maine: Libraries offering one-on-one tech coaching for elders and jobseekers',
      'Texas: Bilingual digital literacy classes at community centers',
      'Wisconsin: Mobile tech labs bringing digital skills training to rural areas'
    ],
    relatedPatterns: ['Village Learning Hub', 'Digital Root System', 'Community Anchor Point']
  },

  // Part III: Places & Infrastructure (8 patterns)
  {
    id: 17,
    title: 'Digital Root System',
    description: 'Community-led broadband as the backbone for modern rural life.',
    addresses: ['Infrastructure Decay', 'Isolation', 'Economic Stagnation'],
    category: 'Places & Infrastructure',
    problem: 'Slow, expensive, or absent internet access cuts rural communities off from jobs, education, healthcare, and civic participation.',
    context: 'Commercial providers often skip rural areas. Without reliable broadband, remote work, online learning, and telemedicine remain out of reach—deepening the urban-rural divide.',
    solution: 'Build community-owned or cooperative broadband networks that prioritize local needs over shareholder returns. Combine public investment, local leadership, and appropriate technology.',
    implementation: [
      'Form a broadband coalition with residents, businesses, and local government',
      'Conduct a community needs assessment and feasibility study',
      'Explore fiber, fixed wireless, or hybrid models based on geography and budget',
      'Secure funding through federal/state grants, bonds, or cooperative membership'
    ],
    examples: [
      'Tennessee: Electric co-ops building fiber networks across rural counties',
      'Colorado: Towns bonding together to build regional fiber infrastructure',
      'Minnesota: Community-owned wireless ISPs serving remote areas'
    ],
    relatedPatterns: ['Community Anchor Point', 'Digital Literacy for All', 'Talent Export Co-op']
  },
  {
    id: 18,
    title: 'Affordable Rural Housing Nodes',
    description: 'Housing solutions that anchor families and workers in place.',
    addresses: ['Youth Flight', 'Economic Stagnation', 'Generational Poverty'],
    category: 'Places & Infrastructure',
    problem: 'Lack of affordable, quality housing keeps workers away and forces young families to leave—even when jobs exist.',
    context: 'Rural housing stock is often old, inefficient, or too expensive for local wages. New construction is rare. Workers can\'t find places to live, so businesses can\'t grow.',
    solution: 'Develop small-scale, mixed-income housing near jobs, services, and transit. Use innovative models: tiny homes, modular builds, community land trusts, employer partnerships.',
    implementation: [
      'Identify infill sites and underused land near downtown or anchor employers',
      'Partner with community land trusts to separate land cost from home cost',
      'Pilot modular or prefab construction to reduce costs and timelines',
      'Blend funding: local bonds, state housing credits, philanthropy, employer investment'
    ],
    examples: [
      'Vermont: Modular tiny-home villages for seasonal workers and young families',
      'Wyoming: Employer-sponsored workforce housing near energy and tourism jobs',
      'Oregon: Community land trust holding land while residents build equity in homes'
    ],
    relatedPatterns: ['Community Land Trust', 'Youth Return Pathway', 'Main Street Reawakening']
  },
  {
    id: 19,
    title: 'Multipurpose Mobility Hubs',
    description: 'Shared transit and flexible transport for scattered populations.',
    addresses: ['Isolation', 'Infrastructure Decay', 'Economic Stagnation'],
    category: 'Places & Infrastructure',
    problem: 'Distance and lack of transportation lock people out of jobs, healthcare, and community life. Traditional transit doesn\'t work at rural densities.',
    context: 'People without cars—elders, youth, low-income families—face isolation. Meanwhile, underused vehicles (school buses, church vans, ride shares) sit idle most of the time.',
    solution: 'Create mobility hubs that coordinate flexible transit: vanpools, volunteer drivers, e-bikes, micro-transit apps. Make hubs multipurpose: waiting areas, wi-fi, info kiosks, bike share.',
    implementation: [
      'Identify high-need routes: medical appointments, jobs, groceries, school',
      'Pool resources: share school buses off-hours, recruit volunteer drivers, lease vans',
      'Use simple scheduling tools (phone line, app, or ride-board)',
      'Co-locate hubs with community anchors for comfort and visibility'
    ],
    examples: [
      'Montana: Volunteer driver networks coordinated through rural health clinics',
      'Iowa: Shared vanpool system connecting small towns to regional job centers',
      'Maine: E-bike lending library at community hub for short-distance trips'
    ],
    relatedPatterns: ['Community Anchor Point', 'Digital Root System', 'Food Infrastructure Spine']
  },
  {
    id: 20,
    title: 'Main Street Reawakening',
    description: 'Bringing downtown back to life through mixed-use activation.',
    addresses: ['Economic Stagnation', 'Underused Assets', 'Civic Apathy'],
    category: 'Places & Infrastructure',
    problem: 'Empty storefronts and vacant upper floors signal decline, drain civic pride, and make it hard to attract new investment or residents.',
    context: 'Retail has shifted online and to highways. Historic downtowns hold beautiful bones but lack foot traffic, modern uses, and a clear strategy for revival.',
    solution: 'Reactivate Main Street through mixed-use: ground-floor creative businesses, upstairs housing, pop-ups, arts venues, and public gathering spaces. Prioritize beauty, walkability, and local ownership.',
    implementation: [
      'Start with quick wins: murals, pocket parks, outdoor seating, window displays',
      'Offer low-cost leases or "try it" pop-up programs for local entrepreneurs',
      'Convert upper floors to affordable live/work studios or housing',
      'Host regular programming: markets, music, art walks, story nights'
    ],
    examples: [
      'Trinidad, CO: Arts district anchored by Emergent Campus revitalizing downtown',
      'Arkansas: Main Street program blending local shops, galleries, and upstairs housing',
      'Michigan: Pop-up retail incubator helping local makers test storefronts'
    ],
    relatedPatterns: ['Creative Workyards', 'Culture-as-Economy', 'Community Anchor Point']
  },
  {
    id: 21,
    title: 'Eco-Adaptive Building Codes',
    description: 'Climate-smart design standards that respect local context.',
    addresses: ['Environmental Degradation', 'Infrastructure Decay'],
    category: 'Places & Infrastructure',
    problem: 'Outdated building codes block innovative, sustainable construction. Rural builders face red tape that favors conventional (and often wasteful) approaches.',
    context: 'Climate change demands new building strategies: passive solar, natural materials, water capture, energy efficiency. But codes often lag or assume urban contexts.',
    solution: 'Update local building codes to encourage climate-smart design while respecting rural traditions and affordability. Create pathways for alternative materials, techniques, and demonstration projects.',
    implementation: [
      'Convene builders, planners, and residents to review and modernize codes',
      'Allow variance applications for green building pilots (straw bale, rammed earth, greywater)',
      'Adopt energy efficiency incentives and renewable-ready requirements',
      'Provide technical assistance and model code language from peer jurisdictions'
    ],
    examples: [
      'New Mexico: Counties adopting codes friendly to adobe, straw bale, and earthen construction',
      'Oregon: Expedited permitting for net-zero and passive house projects',
      'Colorado: Incentives for solar-ready and wildfire-resilient building standards'
    ],
    relatedPatterns: ['Resilient Energy Microgrids', 'Circular Water Systems', 'Commons Stewardship']
  },
  {
    id: 22,
    title: 'Food Infrastructure Spine',
    description: 'Local food systems connecting producers, processors, and eaters.',
    addresses: ['Food Insecurity', 'Economic Stagnation', 'Environmental Degradation'],
    category: 'Places & Infrastructure',
    problem: 'Rural areas grow food but often can\'t access it affordably. Lack of processing, storage, and distribution infrastructure forces dependence on distant supply chains.',
    context: 'Small farms struggle without nearby processing facilities, cold storage, or wholesale buyers. Meanwhile, residents drive miles for fresh food or rely on dollar stores.',
    solution: 'Build shared food infrastructure: community kitchens, food hubs, cold storage, mobile markets. Connect local growers to schools, hospitals, and consumers.',
    implementation: [
      'Develop a regional food hub with aggregation, storage, and distribution',
      'Build shared-use commercial kitchens for value-added processing',
      'Coordinate farm-to-institution programs (schools, hospitals, senior centers)',
      'Launch mobile markets or food box delivery to underserved areas'
    ],
    examples: [
      'New Mexico: Pueblo food sovereignty hubs connecting traditional growers and tribal programs',
      'Vermont: Regional food hubs aggregating from small farms for institutional buyers',
      'Kentucky: Mobile farmers markets bringing fresh produce to food deserts'
    ],
    relatedPatterns: ['Regenerative Micro-Enterprise', 'Circular Water Systems', 'Commons Stewardship']
  },
  {
    id: 23,
    title: 'Circular Water Systems',
    description: 'Regenerative water management for resilience and ecology.',
    addresses: ['Environmental Degradation', 'Infrastructure Decay', 'Food Insecurity'],
    category: 'Places & Infrastructure',
    problem: 'Aging water infrastructure, drought, and pollution threaten rural water security. Linear "use and dump" systems waste a precious resource.',
    context: 'Climate change intensifies water stress. Many rural systems rely on outdated pipes, groundwater depletion, or contaminated sources. Meanwhile, rainwater and greywater go unused.',
    solution: 'Design circular water systems that capture, store, reuse, and restore water locally. Integrate rainwater harvesting, greywater recycling, wetland restoration, and watershed protection.',
    implementation: [
      'Audit current water use and identify conservation opportunities',
      'Install rainwater harvesting at public buildings and homes',
      'Pilot greywater systems for irrigation and landscape watering',
      'Restore wetlands and riparian buffers to filter and store water naturally'
    ],
    examples: [
      'Arizona: Rainwater harvesting mandates for new public buildings',
      'New Mexico: Acequia restoration integrating traditional and modern water management',
      'Oregon: Watershed councils coordinating conservation across private and public lands'
    ],
    relatedPatterns: ['Food Infrastructure Spine', 'Eco-Adaptive Building Codes', 'Commons Stewardship']
  },
  {
    id: 24,
    title: 'Resilient Energy Microgrids',
    description: 'Community-owned renewable energy for independence and adaptation.',
    addresses: ['Infrastructure Decay', 'Environmental Degradation', 'Economic Stagnation'],
    category: 'Places & Infrastructure',
    problem: 'Centralized energy systems leave rural communities vulnerable to outages, high costs, and fossil fuel dependence. Climate disruptions increase vulnerability.',
    context: 'Rural areas often have abundant sun, wind, and biomass but limited control over energy infrastructure. Rising costs and reliability issues hurt residents and businesses.',
    solution: 'Develop community-owned renewable energy microgrids that provide local resilience, lower costs, and environmental benefits. Prioritize solar, wind, battery storage, and demand management.',
    implementation: [
      'Conduct community energy assessment: needs, resources, feasibility',
      'Form energy cooperative or public utility district to own and operate system',
      'Pilot microgrid at anchor institution (school, hospital, community center)',
      'Secure funding through federal grants, green banks, or cooperative financing'
    ],
    examples: [
      'Alaska: Village microgrids combining solar, wind, and battery storage for energy independence',
      'Minnesota: Cooperative-owned wind farms providing local power and revenue sharing',
      'California: Rural microgrids with solar and storage surviving wildfire power shutoffs'
    ],
    relatedPatterns: ['Eco-Adaptive Building Codes', 'Commons Stewardship', 'Regenerative Micro-Enterprise']
  },

  // Part IV: Economy & Work (8 patterns)
  {
    id: 25,
    title: 'Regenerative Micro-Enterprise',
    description: 'Small businesses that repair ecosystems while creating wealth.',
    addresses: ['Economic Stagnation', 'Environmental Degradation', 'Youth Flight'],
    category: 'Economy & Work',
    problem: 'Economic development often means extraction—logging, mining, industrial farming—that degrades land and leaves little lasting wealth in communities.',
    context: 'As climate and ecological crises deepen, rural areas need businesses that restore rather than deplete. Youth especially want work that aligns with environmental values.',
    solution: 'Support micro-enterprises that generate income while healing land, water, and ecosystems: regenerative agriculture, ecological restoration, sustainable forestry, green energy services.',
    implementation: [
      'Provide training and startup grants for regenerative business models',
      'Connect entrepreneurs to technical assistance (permaculture, restoration ecology, carbon markets)',
      'Create peer networks and cooperative structures for shared marketing and resources',
      'Link businesses to values-aligned buyers and impact investors'
    ],
    examples: [
      'Oregon: Watershed restoration enterprises employing youth in stream and forest recovery',
      'Montana: Regenerative ranch cooperatives improving soil health while raising livestock',
      'Appalachia: Sustainable forestry businesses producing value-added wood products'
    ],
    relatedPatterns: ['Food Infrastructure Spine', 'Circular Water Systems', 'Heritage-to-Market Program']
  },
  {
    id: 26,
    title: 'Creative Workyards',
    description: 'Shared spaces for making, learning, and building enterprises.',
    category: 'Economy & Work',
    addresses: ['Economic Stagnation', 'Underused Assets', 'Youth Flight'],
    problem: 'Makers, artists, and small manufacturers lack affordable workspace and access to tools. Isolation stifles collaboration and growth.',
    context: 'Empty warehouses, old schools, and industrial buildings sit unused while creative entrepreneurs work from home garages or leave town for better infrastructure.',
    solution: 'Create shared creative workyards: makerspaces, studios, light manufacturing hubs with tools, equipment, and peer community. Keep rent affordable and energy collaborative.',
    implementation: [
      'Repurpose underused industrial or commercial space as shared workspace',
      'Equip with tools for woodworking, metalwork, textiles, digital fabrication, food production',
      'Offer tiered membership (hobbyists to full-time businesses) with flexible access',
      'Host skill-shares, open houses, and markets to build community and customers'
    ],
    examples: [
      'Trinidad, CO: Emergent Campus blending coworking, maker studio, and youth programs',
      'North Carolina: Shared woodshop and metal fab space for furniture makers',
      'Vermont: Cooperative food production kitchen for value-added ag businesses'
    ],
    relatedPatterns: ['Creative Apprenticeships', 'Main Street Reawakening', 'Culture-as-Economy']
  },
  {
    id: 27,
    title: 'Culture-as-Economy',
    description: 'Turning heritage, arts, and story into sustainable livelihoods.',
    addresses: ['Economic Stagnation', 'Youth Flight', 'Underused Assets'],
    category: 'Economy & Work',
    problem: 'Cultural assets—stories, crafts, music, heritage sites—are celebrated but rarely monetized in ways that benefit local creators and communities.',
    context: 'Artists and culture-bearers struggle to make a living. Meanwhile, tourism and attention flow elsewhere. Without economic pathways, cultural knowledge fades and youth leave.',
    solution: 'Build economic models around culture: heritage tourism, craft markets, festivals, artist residencies, media production. Ensure creators capture value and control their narratives.',
    implementation: [
      'Develop cultural districts or creative corridors with studios, galleries, and performance spaces',
      'Launch heritage tourism experiences led by local guides and storytellers',
      'Create online marketplaces and e-commerce for local artists and makers',
      'Host annual festivals and markets that draw visitors and revenue to the community'
    ],
    examples: [
      'New Mexico: Pueblo feast days and art markets as major economic drivers',
      'Appalachia: Music heritage tourism supporting local musicians and venues',
      'Montana: Artist residencies bringing visiting creatives and cultural exchange'
    ],
    relatedPatterns: ['Heritage-to-Market Program', 'Creative Apprenticeships', 'Main Street Reawakening']
  },
  {
    id: 28,
    title: 'Talent Export Co-op',
    description: 'Organizing remote workers to stay local while serving global markets.',
    addresses: ['Youth Flight', 'Economic Stagnation', 'Infrastructure Decay'],
    category: 'Economy & Work',
    problem: 'Skilled rural residents leave for cities because they don\'t see how to earn urban wages while living at home. Remote work is possible but feels isolating and uncertain.',
    context: 'The remote work revolution could revitalize rural areas—but freelancers lack community, benefits, and collective bargaining power. Without support, they still leave.',
    solution: 'Form talent export cooperatives: groups of remote workers who share workspace, negotiate as a collective, pool benefits, and market services together while staying rooted in place.',
    implementation: [
      'Recruit freelancers and remote workers in design, tech, writing, consulting, creative services',
      'Provide shared coworking space with reliable internet and professional amenities',
      'Negotiate group health insurance, retirement plans, and contracts',
      'Market the cooperative as a rural-based, values-aligned service provider'
    ],
    examples: [
      'Vermont: Freelancer cooperative offering tech and creative services to Northeast clients',
      'New Mexico: Remote worker hub with shared benefits and client referrals',
      'Montana: Design collective marketing rural creativity to national brands'
    ],
    relatedPatterns: ['Digital Root System', 'Creative Workyards', 'Youth Return Pathway']
  },
  {
    id: 29,
    title: 'Heritage-to-Market Program',
    description: 'Commercializing traditional crafts and knowledge with integrity.',
    addresses: ['Economic Stagnation', 'Underused Assets', 'Generational Poverty'],
    category: 'Economy & Work',
    problem: 'Traditional skills—weaving, pottery, foodways, herbalism—risk being lost. Elders hold knowledge but lack pathways to market. Youth don\'t see heritage work as economically viable.',
    context: 'Consumer demand for authentic, handmade, and place-based goods is growing. But rural makers lack business training, market access, and quality control support.',
    solution: 'Build programs that help heritage practitioners turn traditional knowledge into income: business training, quality standards, branding, e-commerce, wholesale relationships—all while honoring cultural integrity.',
    implementation: [
      'Identify traditional crafts and knowledge holders willing to teach and produce',
      'Provide business development support: pricing, branding, marketing, online sales',
      'Create quality standards and certifications that protect authenticity',
      'Connect makers to regional buyers, galleries, tourism, and online marketplaces'
    ],
    examples: [
      'Appalachia: Quilting and basket-weaving cooperatives selling through regional craft councils',
      'Southwest: Native pottery and jewelry programs with artist-controlled branding',
      'Alaska: Traditional food products marketed through tribal enterprises'
    ],
    relatedPatterns: ['Culture-as-Economy', 'Creative Apprenticeships', 'Elder Mentorship Circles']
  },
  {
    id: 30,
    title: 'Public Data Commons',
    description: 'Shared local data infrastructure for better decisions and opportunity.',
    addresses: ['Low Trust', 'Institutional Distrust', 'Lack of Vision'],
    category: 'Economy & Work',
    problem: 'Critical local data lives in silos or corporate platforms. Communities can\'t see patterns, measure progress, or make informed decisions about their own future.',
    context: 'Schools, health systems, employers, and governments collect data about communities—but rarely share it back in useful forms. Lack of transparency fuels distrust and poor planning.',
    solution: 'Build public data commons: shared platforms where community-controlled data is accessible, transparent, and used to inform local decisions. Balance openness with privacy and sovereignty.',
    implementation: [
      'Inventory existing data sources and identify gaps (economy, health, education, environment)',
      'Create simple dashboards showing key indicators: jobs, housing, graduation rates, health outcomes',
      'Establish data governance agreements: who owns it, who can access it, how it\'s used',
      'Train community members as data stewards and interpreters'
    ],
    examples: [
      'Detroit: Neighborhood data portals showing real-time conditions and trends',
      'Portland: Open data platform with community-contributed datasets',
      'Tribal Nations: Sovereign data systems ensuring cultural protocols and community control'
    ],
    relatedPatterns: ['Community-Based Research', 'Listening Infrastructure', 'Trust Infrastructure']
  },
  {
    id: 31,
    title: 'Civic Gig Platform',
    description: 'Locally-owned marketplace for services, gigs, and mutual aid.',
    addresses: ['Economic Stagnation', 'Isolation', 'Generational Poverty'],
    category: 'Economy & Work',
    problem: 'Corporate gig platforms (Uber, TaskRabbit) extract value from rural areas and don\'t serve local needs. Meanwhile, neighbors need help but can\'t find it easily.',
    context: 'Rural economies need flexible, trusted ways to match needs with skills—childcare, repairs, rides, yard work, elder care—without corporate middlemen taking cuts or controlling data.',
    solution: 'Build community-owned gig platforms that keep value local, prioritize trust and transparency, and blend paid work with mutual aid. Simple, mobile-friendly, locally governed.',
    implementation: [
      'Start with a simple directory or matchmaking tool (Google Sheet, Airtable, or lightweight app)',
      'Focus on high-need services: rides, repairs, childcare, tech help, yard work',
      'Build trust through ratings, references, and local governance of disputes',
      'Keep fees low or zero; consider sliding scale or time-banking integration'
    ],
    examples: [
      'Vermont: Community Rides app connecting volunteer drivers with riders needing transport',
      'Rural Midwest: Faith-based service-sharing networks coordinating help across congregations',
      'Oregon: Tool-lending libraries with online reservation systems'
    ],
    relatedPatterns: ['Social Timebank', 'Multipurpose Mobility Hubs', 'Trust Infrastructure']
  },
  {
    id: 32,
    title: 'Community Land Trust',
    description: 'Permanent affordability through collective land ownership.',
    addresses: ['Youth Flight', 'Generational Poverty', 'Economic Stagnation'],
    category: 'Economy & Work',
    problem: 'Land and housing speculation prices out locals. Young families, workers, and longtime residents can\'t afford to stay or return. Wealth leaves the community.',
    context: 'When land is treated only as a commodity, affordability disappears. Rural gentrification, absentee ownership, and vacation-home markets displace residents and hollow out communities.',
    solution: 'Establish community land trusts (CLTs) that remove land from the speculative market. The trust owns land permanently; residents own homes and build equity—but resale prices stay affordable forever.',
    implementation: [
      'Form a nonprofit CLT governed by residents, community members, and public representatives',
      'Acquire land through donation, purchase, or public transfer',
      'Develop or steward affordable housing, community facilities, and commercial space on trust land',
      'Use ground leases that keep resale prices affordable while allowing homeowners to build equity'
    ],
    examples: [
      'Vermont: Champlain Housing Trust pioneering the CLT model for rural affordability',
      'Oregon: Coastal CLTs protecting affordable housing from resort development pressures',
      'New Mexico: Land trusts preserving agricultural land and multigenerational family access'
    ],
    relatedPatterns: ['Affordable Rural Housing Nodes', 'Commons Stewardship', 'Generational Transition Planning']
  },

  // Part V: Governance & Capacity (8 patterns)
  {
    id: 33,
    title: 'Nested Governance Tables',
    description: 'Inclusive decision-making structures from block to region.',
    addresses: ['Low Trust', 'Civic Apathy', 'Polarization'],
    category: 'Governance & Capacity',
    problem: 'Top-down decisions alienate residents. Single big meetings exclude many voices. People feel powerless and stop participating.',
    context: 'Effective governance needs multiple scales: neighborhood circles for hyperlocal issues, town tables for broader decisions, regional networks for shared challenges. Without nesting, voices get lost.',
    solution: 'Create nested governance structures where decisions flow between neighborhood, town, and regional levels. Small groups have real power; broader tables coordinate and align without dictating.',
    implementation: [
      'Start with neighborhood circles (10-30 households) meeting monthly on local issues',
      'Create town coordination tables with reps from neighborhoods, sectors, and groups',
      'Link towns into regional peer networks for shared learning and advocacy',
      'Use clear decision-making protocols: what gets decided where, and how voices move up and down'
    ],
    examples: [
      'Participatory budgeting models in rural Oregon allowing neighborhood-level allocation decisions',
      'Neighborhood association networks in Vermont coordinating with town selectboards',
      'Regional councils of governments in Appalachia bridging town and county planning'
    ],
    relatedPatterns: ['Trust Infrastructure', 'Civic Intermediary Table', 'Listening Infrastructure']
  },
  {
    id: 34,
    title: 'Local Capacity Backbone',
    description: 'Shared infrastructure for coordination, admin, and follow-through.',
    category: 'Governance & Capacity',
    addresses: ['Institutional Breakdown', 'Civic Apathy', 'Lack of Vision'],
    problem: 'Good ideas die from lack of follow-through. Volunteers burn out. Nobody handles the unglamorous work: scheduling, notes, tracking, reporting, coordination.',
    context: 'Rural communities run on volunteer energy—but without administrative backbone, initiatives stall. People want to help but don\'t have time to run the logistics.',
    solution: 'Build shared capacity infrastructure: a small backbone team or organization that provides coordination, grant management, communications, data tracking, and administrative support across multiple community efforts.',
    implementation: [
      'Hire or fund 1-2 backbone coordinators serving multiple initiatives',
      'Provide shared services: meeting facilitation, note-taking, grant writing, reporting',
      'Use simple project management tools to track commitments and progress',
      'Host regular cross-initiative gatherings to share learning and coordinate calendars'
    ],
    examples: [
      'Collective Impact initiatives with dedicated backbone staff supporting coalitions',
      'Rural community foundations providing administrative home for grassroots efforts',
      'AmeriCorps VISTA members serving as capacity builders for multiple local groups'
    ],
    relatedPatterns: ['Shared Grant Navigator Network', 'Civic Intermediary Table', 'Peer Exchange Network']
  },
  {
    id: 35,
    title: 'Rural Policy Sandbox',
    description: 'Safe space to test new rules, partnerships, and approaches.',
    addresses: ['Institutional Distrust', 'Lack of Vision', 'Economic Stagnation'],
    category: 'Governance & Capacity',
    problem: 'Outdated regulations block innovation. Fear of failure keeps officials cautious. Communities and institutions can\'t experiment without risking penalties or political backlash.',
    context: 'Rural areas need flexibility to adapt policies to local context—but bureaucratic rigidity and risk-aversion prevent experimentation. Good ideas die in committee.',
    solution: 'Create policy sandboxes: temporary, bounded spaces where communities can test new approaches with protection from usual penalties. Learn fast, document what works, scale successes.',
    implementation: [
      'Negotiate waivers or pilots with state/federal agencies for specific experiments',
      'Define clear scope, timeline, and success metrics for each sandbox initiative',
      'Build in rapid feedback loops: quarterly reviews, course corrections, transparent reporting',
      'Share learning across peer communities and advocate for policy changes based on results'
    ],
    examples: [
      'Arizona: Regulatory sandboxes for fintech innovations, adapted for rural broadband cooperatives',
      'Colorado: Pilot programs testing flexible zoning for accessory dwelling units and tiny homes',
      'Federal Opportunity Zones allowing experimentation with economic development incentives'
    ],
    relatedPatterns: ['Eco-Adaptive Building Codes', 'Peer Exchange Network', 'Community-Based Research']
  },
  {
    id: 36,
    title: 'Peer Exchange Network',
    description: 'Learning and mutual support across similar rural communities.',
    addresses: ['Isolation', 'Institutional Breakdown', 'Lack of Vision'],
    category: 'Governance & Capacity',
    problem: 'Rural communities reinvent the wheel because they don\'t know what\'s working elsewhere. Leaders feel isolated and lack peer support for shared challenges.',
    context: 'Many small towns face similar issues—but work in silos. Peer learning could accelerate progress, build confidence, and reduce costly mistakes.',
    solution: 'Build networks connecting similar communities for peer exchange: site visits, virtual cohorts, shared toolkits, problem-solving circles. Learn from each other, not just consultants.',
    implementation: [
      'Form regional cohorts of 5-10 towns with similar contexts and challenges',
      'Host quarterly peer learning exchanges (in-person site visits or virtual sessions)',
      'Create shared resource libraries: templates, playbooks, contact lists, lessons learned',
      'Pair experienced communities with those just starting similar initiatives'
    ],
    examples: [
      'Strong Towns member network: small cities sharing incremental development strategies',
      'Main Street America: peer communities learning downtown revitalization approaches',
      'Rural LISC networks connecting community development leaders across regions'
    ],
    relatedPatterns: ['Local Capacity Backbone', 'Civic Intermediary Table', 'Institutional Partnership Liaisons']
  },
  {
    id: 37,
    title: 'Commons Finance Toolkit',
    description: 'Shared funding models for community-led projects.',
    addresses: ['Economic Stagnation', 'Institutional Distrust', 'Civic Apathy'],
    category: 'Governance & Capacity',
    problem: 'Good ideas lack funding. Traditional grants are competitive, slow, and restrict local control. Communities can\'t rely solely on outside money.',
    context: 'Rural communities need diverse, flexible funding that doesn\'t come with strings that distort local priorities. Reliance on single funders creates fragility and mission drift.',
    solution: 'Build commons finance tools: community investment funds, crowdfunding, solidarity lending, revenue-sharing models, participatory budgeting. Blend local and outside capital with community control.',
    implementation: [
      'Launch community investment campaigns: local bonds, crowdfunding for specific projects',
      'Create revolving loan funds managed by community boards for small business and housing',
      'Pilot participatory budgeting: residents decide how to allocate a portion of public funds',
      'Form giving circles or community foundations pooling local philanthropic dollars'
    ],
    examples: [
      'Slow Money networks: local investors funding food and farm enterprises',
      'Community Development Financial Institutions (CDFIs) offering patient capital in rural areas',
      'Participatory budgeting in rural towns allocating municipal funds through resident votes'
    ],
    relatedPatterns: ['Community Land Trust', 'Regenerative Micro-Enterprise', 'Local Capacity Backbone']
  },
  {
    id: 38,
    title: 'Regional Mutual Aid Protocols',
    description: 'Agreements for sharing resources, labor, and crisis support.',
    addresses: ['Isolation', 'Institutional Breakdown', 'Food Insecurity'],
    category: 'Governance & Capacity',
    problem: 'Rural towns face crises (floods, fires, economic shocks) with limited local capacity. Without formal mutual aid, communities struggle alone or wait for distant help.',
    context: 'Small towns can\'t afford full emergency services or specialized equipment on their own. Meanwhile, neighboring communities have complementary strengths but no framework for coordination.',
    solution: 'Establish regional mutual aid agreements: towns share equipment, personnel, expertise, and supplies during crises and beyond. Formalize with clear protocols, training, and reciprocity commitments.',
    implementation: [
      'Map regional assets: fire equipment, medical supplies, heavy machinery, skilled personnel',
      'Draft mutual aid compacts: who provides what, how costs are shared, decision-making protocols',
      'Conduct joint training exercises and scenario planning',
      'Extend beyond emergencies: share services like code enforcement, planning, equipment rentals'
    ],
    examples: [
      'Fire district mutual aid compacts common across rural America',
      'Regional food banks coordinating emergency food distribution across counties',
      'Vermont towns sharing road equipment and maintenance crews'
    ],
    relatedPatterns: ['Peer Exchange Network', 'Local Capacity Backbone', 'Food Infrastructure Spine']
  },
  {
    id: 39,
    title: 'Generational Transition Planning',
    description: 'Structured handoffs for businesses, farms, and leadership.',
    addresses: ['Aging Population', 'Economic Stagnation', 'Youth Flight'],
    category: 'Governance & Capacity',
    problem: 'Aging business owners, farmers, and civic leaders have no succession plans. When they retire or die, businesses close, land sells off, and institutional knowledge disappears.',
    context: 'Rural America faces a "silver tsunami"—mass retirements with no next generation ready. Without planning, wealth and knowledge leave communities permanently.',
    solution: 'Build structured transition programs that pair exiting leaders with successors, facilitate ownership transfers, document knowledge, and ensure continuity of businesses and civic roles.',
    implementation: [
      'Inventory businesses, farms, and civic roles facing succession in next 5-10 years',
      'Offer transition planning workshops covering legal, financial, and relational aspects',
      'Facilitate mentorship pairings between retiring and emerging leaders',
      'Provide financing tools for next-generation ownership: seller financing, cooperative conversions, land trusts'
    ],
    examples: [
      'Farm succession programs helping families transfer land to next generation',
      'Employee Stock Ownership Plans (ESOPs) transitioning businesses to worker ownership',
      'Leadership pipeline programs in rural nonprofits and civic organizations'
    ],
    relatedPatterns: ['Elder Mentorship Circles', 'Community Land Trust', 'Youth Return Pathway']
  },
  {
    id: 40,
    title: 'Co-Governed Platforms',
    description: 'Digital tools owned and steered by users, not corporations.',
    addresses: ['Low Trust', 'Institutional Distrust', 'Economic Stagnation'],
    category: 'Governance & Capacity',
    problem: 'Corporate platforms (Facebook, Nextdoor, Google) control community data, conversation, and commerce. They prioritize profit over local needs and trust.',
    context: 'Digital infrastructure shapes civic life. When communities depend on extractive platforms, they lose sovereignty, transparency, and the ability to govern their own digital commons.',
    solution: 'Build or adopt co-governed digital platforms owned by users or communities. Prioritize transparency, data sovereignty, and democratic governance over growth and extraction.',
    implementation: [
      'Explore platform cooperatives and community-owned alternatives (Mastodon, cooperative apps)',
      'Establish clear governance: user representation, transparent algorithms, privacy protections',
      'Start small: community calendar, service exchange, or local news platform',
      'Build in public: open-source code, public roadmaps, user feedback loops'
    ],
    examples: [
      'Platform cooperatives like Stocksy (photography) and Resonate (music streaming)',
      'Mastodon instances run by and for specific communities',
      'Municipal broadband providers offering community-governed digital services'
    ],
    relatedPatterns: ['Public Data Commons', 'Digital Root System', 'Civic Gig Platform']
  },

  // Part VI: Institutional Partnerships (5 patterns)
  {
    id: 41,
    title: 'Institutional Partnership Liaisons',
    description: 'Bridge-builders connecting community to universities, agencies, and funders.',
    addresses: ['Institutional Distrust', 'Isolation', 'Lack of Vision'],
    category: 'Institutional Partnerships',
    problem: 'Communities need outside resources and expertise, but don\'t know how to navigate complex institutions. Misaligned expectations and broken promises erode trust.',
    context: 'Universities, agencies, and foundations want to help rural areas—but often lack deep community relationships. Without trusted liaisons, partnerships stay transactional or fail.',
    solution: 'Designate partnership liaisons who bridge community and institutions. They translate needs, navigate bureaucracy, build relationships, and ensure reciprocity and accountability.',
    implementation: [
      'Hire or designate community-trusted liaisons (not just institutional staff)',
      'Create clear partnership protocols: co-design, shared decision-making, transparent budgets',
      'Build long-term relationships, not just project-based transactions',
      'Ensure community voice in setting priorities and evaluating outcomes'
    ],
    examples: [
      'Extension agents serving as university-community bridges in land-grant systems',
      'Community navigators helping residents access health and social services',
      'Tribal liaisons ensuring culturally appropriate partnerships with state/federal agencies'
    ],
    relatedPatterns: ['Cross-Sector Exchange Fellows', 'Civic Intermediary Table', 'Community-Based Research']
  },
  {
    id: 42,
    title: 'Shared Grant Navigator Network',
    description: 'Pooled capacity for finding, writing, and managing grants together.',
    category: 'Institutional Partnerships',
    addresses: ['Institutional Breakdown', 'Civic Apathy', 'Economic Stagnation'],
    problem: 'Grant opportunities exist, but small organizations lack staff to research, write proposals, and manage compliance. Capacity gaps lock out rural communities from funding.',
    context: 'Grantseeking is specialized, time-intensive work. Most rural nonprofits, towns, and schools can\'t afford dedicated development staff—so they miss opportunities or burn out trying.',
    solution: 'Create shared grant navigator services: a regional team that helps multiple communities find funding, write proposals, and manage grants. Pool costs, share expertise, increase success rates.',
    implementation: [
      'Hire or contract 1-2 grant professionals serving a cohort of communities',
      'Build a shared opportunity database tracking relevant funding sources',
      'Offer proposal development support: templates, editing, budget help',
      'Provide post-award support: reporting, compliance, evaluation'
    ],
    examples: [
      'Regional councils of government offering grant writing services to member towns',
      'Community foundation grant support programs for local nonprofits',
      'Rural LISC navigators helping communities access federal and philanthropic funding'
    ],
    relatedPatterns: ['Local Capacity Backbone', 'Institutional Partnership Liaisons', 'Peer Exchange Network']
  },
  {
    id: 43,
    title: 'Civic Intermediary Table',
    description: 'Neutral convening space for cross-sector alignment and action.',
    addresses: ['Low Trust', 'Lack of Vision', 'Polarization'],
    category: 'Institutional Partnerships',
    problem: 'Silos prevent collaboration. Government, nonprofits, businesses, schools, and residents work in parallel instead of together. Duplication wastes resources; gaps persist.',
    context: 'Complex challenges require coordination across sectors—but no one owns the convening role. Without neutral ground and trusted facilitation, partnerships stall.',
    solution: 'Establish a civic intermediary table: a regular, neutral convening space where cross-sector leaders align on priorities, coordinate efforts, and solve problems together.',
    implementation: [
      'Identify a neutral host (community foundation, backbone organization, or rotating leadership)',
      'Invite representatives from government, business, nonprofits, education, faith, residents',
      'Meet quarterly to share priorities, identify gaps and overlaps, coordinate action',
      'Use clear facilitation protocols: shared agendas, transparent notes, accountability tracking'
    ],
    examples: [
      'Collective Impact backbone tables coordinating multi-sector initiatives',
      'Community development corporations serving as neutral conveners in rural towns',
      'Regional planning commissions hosting cross-sector economic development forums'
    ],
    relatedPatterns: ['Nested Governance Tables', 'Local Capacity Backbone', 'Trust Infrastructure']
  },
  {
    id: 44,
    title: 'Cross-Sector Exchange Fellows',
    description: 'Embedding outsiders in community roles and insiders in institutions.',
    addresses: ['Institutional Distrust', 'Isolation', 'Youth Flight'],
    category: 'Institutional Partnerships',
    problem: 'Communities and institutions speak different languages. Mistrust grows from lack of understanding. Talented locals can\'t access institutional opportunities; institutional staff lack community grounding.',
    context: 'Deep partnerships require people who understand both worlds. Short-term exchanges build empathy, transfer skills, and create lasting relationships.',
    solution: 'Create fellowship programs that embed community members in universities, agencies, or foundations—and institutional staff in community organizations. Build bridges through lived experience.',
    implementation: [
      'Design 6-12 month fellowships with clear learning goals and responsibilities',
      'Pair fellows with mentors in host organizations',
      'Provide stipends, housing support, and professional development',
      'Document learning and facilitate post-fellowship collaboration'
    ],
    examples: [
      'AmeriCorps VISTA placements building capacity in rural nonprofits',
      'University extension fellows embedded in community organizations',
      'Foundation-sponsored community leadership institutes bringing locals into philanthropic networks'
    ],
    relatedPatterns: ['Institutional Partnership Liaisons', 'Youth Return Pathway', 'Community-Based Research']
  },
  {
    id: 45,
    title: 'Listening Infrastructure',
    description: 'Ongoing systems for gathering community voice and closing feedback loops.',
    addresses: ['Low Trust', 'Civic Apathy', 'Institutional Distrust'],
    category: 'Institutional Partnerships',
    problem: 'Communities get surveyed to death but rarely see results. Leaders don\'t know what residents actually need. Feedback loops stay broken, trust erodes.',
    context: 'Good decisions require good listening—but most communities lack systematic ways to gather, interpret, and act on resident input. One-off surveys don\'t build relationships or accountability.',
    solution: 'Build listening infrastructure: regular, accessible ways for residents to share input, see what was heard, and track how feedback shapes decisions. Close the loop visibly and consistently.',
    implementation: [
      'Host recurring listening sessions in accessible locations and formats (town halls, coffee talks, online)',
      'Use multiple channels: surveys, text polls, story circles, walk-along interviews',
      'Publish "what we heard" summaries and "here\'s what changed" updates',
      'Train community ambassadors to gather input from hard-to-reach populations'
    ],
    examples: [
      'Vermont Front Porch Forum enabling ongoing neighborhood conversations',
      'Participatory budgeting processes with built-in community input and feedback stages',
      'City listening tours with public reporting on what was heard and what will change'
    ],
    relatedPatterns: ['Trust Infrastructure', 'Village Broadcast Loop', 'Community-Based Research']
  },
]

// Featured patterns for homepage (first 6)
export const highlightedPatterns: Pattern[] = allPatterns.slice(0, 6)

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    location: 'Trinidad, Colorado',
    color: '#e8b4a0',
    image: '/places/trinidad.jpg',
    title: 'From Ghost Town to Creative Hub',
    problem: 'Downtown vacancy, youth flight, and declining population left the historic main street empty.',
    solution: 'Emergent Campus created a mixed-use community anchor with coworking, youth programs, and cultural activation.',
    patterns: ['Community Anchor Point', 'Creative Workyards', 'Main Street Reawakening']
  },
  {
    id: 2,
    location: 'Rural Nebraska',
    color: '#b8d4c8',
    image: '/places/rural-nebraska.jpg',
    title: 'School Building Becomes Community Center',
    problem: 'Closed school left a gap in community gathering space and youth programming.',
    solution: 'Multi-use resource center with workforce training, library services, and civic hub.',
    patterns: ['Community Anchor Point', 'Village Learning Hub', 'Micro-Credential Academy']
  },
  {
    id: 3,
    location: 'Eastern Oregon',
    color: '#c9b8e8',
    image: '/places/eastern-oregon.jpg',
    title: 'Mobile Anchor Reaches Remote Residents',
    problem: 'Distance and transportation barriers prevented residents from accessing services.',
    solution: 'Converted bus as mobile community center bringing programs to isolated areas.',
    patterns: ['Community Anchor Point', 'Multipurpose Mobility Hubs', 'Digital Literacy for All']
  },
  {
    id: 4,
    location: 'Appalachia, West Virginia',
    color: '#d4c5a0',
    image: '/places/appalachia.jpg',
    title: 'Heritage Crafts Build New Economy',
    problem: 'Coal industry decline left few job options and eroded community identity.',
    solution: 'Heritage-to-market program connects traditional crafters with regional buyers and online sales.',
    patterns: ['Heritage-to-Market Program', 'Elder Mentorship Circles', 'Creative Workyards']
  },
  {
    id: 5,
    location: 'Northern Maine',
    color: '#a0c4d4',
    image: '/places/northern-maine.jpg',
    title: 'Timebank Rebuilds Trust',
    problem: 'Isolated residents struggled with basic needs and deep social divisions.',
    solution: 'Social timebank created reciprocal exchange network spanning political and economic lines.',
    patterns: ['Social Timebank', 'Trust Infrastructure', 'Village Broadcast Loop']
  },
  {
    id: 6,
    location: 'New Mexico Pueblos',
    color: '#d4a0c8',
    image: '/places/new-mexico-pueblos.jpeg',
    title: 'Food Sovereignty Through Infrastructure',
    problem: 'Food deserts and broken traditional food systems threatened health and culture.',
    solution: 'Community-owned food hub connecting farms, processors, and distribution for food sovereignty.',
    patterns: ['Food Infrastructure Spine', 'Commons Stewardship', 'Shared Cultural Story']
  },
  {
    id: 7,
    location: 'Idaho',
    color: '#b8d4e8',
    image: '/places/idaho.jpg',
    title: 'Regional STEM Hubs Bridge Education and Innovation',
    problem: 'Rural schools and communities lacked access to hands-on STEM resources and tech training.',
    solution: 'Regional STEM/innovation hubs blending tech training, civic engagement, and full-service community school models.',
    patterns: ['Community Anchor Point', 'Village Learning Hub', 'Village Learning Hub']
  },
  {
    id: 8,
    location: 'New Mexico Tribal Communities',
    color: '#e8c4b0',
    image: '/places/navajo-nation.webp',
    title: 'Community Learning Centers Preserve Culture',
    problem: 'Tribal and Hispanic towns struggled to maintain cultural identity while accessing modern education.',
    solution: 'Public-private community learning centers offering Montessori, library services, and cultural preservation programs in tribal contexts.',
    patterns: ['Community Anchor Point', 'Shared Cultural Story', 'Village Learning Hub']
  },
  {
    id: 9,
    location: 'Thomasville, Georgia',
    color: '#c8e8b4',
    image: '/places/thomasville-georgia.webp',
    title: 'Closed School Becomes Multi-Service Resilience Hub',
    problem: 'Aging population needed health services, entrepreneurship support, and elder care in underserved area.',
    solution: 'Former high school transformed into multi-use hub offering entrepreneurship programs, health services, and elder care.',
    patterns: ['Community Anchor Point', 'Elder Mentorship Circles', 'Commons Stewardship']
  },
  {
    id: 10,
    location: 'Nebraska',
    color: '#d4b8c8',
    image: '/places/nebraska.jpg',
    title: 'Storytelling Projects Build Rural Inclusion',
    problem: 'Communities struggled with division between long-time residents and recent immigrants.',
    solution: 'Center for Rural Affairs facilitates statewide storytelling projects focusing on welcoming, inclusion, and immigrant narratives.',
    patterns: ['Shared Cultural Story', 'Trust Infrastructure', 'Listening Infrastructure']
  },
  {
    id: 11,
    location: 'North Carolina',
    color: '#a0d4c8',
    image: '/places/north-carolina.jpg',
    title: 'Story Circles Bridge Immigrant and Legacy Communities',
    problem: 'New immigrants and long-time residents lived in parallel without connection or understanding.',
    solution: 'Public storytelling and dialogue formats bringing together diverse community voices through Story Circles and community conversations.',
    patterns: ['Shared Cultural Story', 'Trust Infrastructure', 'Intergenerational Wisdom Exchange']
  },
  {
    id: 12,
    location: 'Alaska Native Communities',
    color: '#e8d4a0',
    image: '/places/alaska-native-community.jpg',
    title: 'Elder Stories Become Classroom Curriculum',
    problem: 'Traditional knowledge and language were being lost as elders passed away.',
    solution: 'Tribal storytelling sessions documented and transformed into illustrated classroom booklets and culturally-grounded curricula.',
    patterns: ['Shared Cultural Story', 'Elder Mentorship Circles', 'Intergenerational Wisdom Exchange']
  },
  {
    id: 13,
    location: 'Appalachian Region',
    color: '#c8b8d4',
    image: '/places/appalachian-region.jpg',
    title: 'Community Memory Project Archives Regional History',
    problem: 'Oral histories and regional heritage were disappearing without documentation.',
    solution: 'Appalachian Memory Project creating community-archived oral histories, images, and regional storytelling model.',
    patterns: ['Shared Cultural Story', 'Heritage-to-Market Program', 'Elder Mentorship Circles']
  },
  {
    id: 14,
    location: 'Rural Oregon',
    color: '#b8e8c8',
    image: '/places/rural-oregon.jpg',
    title: 'Heritage Podcasts Drive Tourism',
    problem: 'Town history and local stories were unknown to residents and visitors alike.',
    solution: 'Town-wide oral-history podcasts and heritage content leveraged for local heritage tourism and community pride.',
    patterns: ['Shared Cultural Story', 'Local Pride Rituals', 'Culture-as-Economy']
  },
  {
    id: 15,
    location: 'Arizona Border Communities',
    color: '#e8b4c8',
    image: '/places/arizona-border.webp',
    title: 'Story Quilts Facilitate Difficult Dialogues',
    problem: 'Immigration tensions created division and prevented honest community conversations.',
    solution: 'Immigrant family story quilts used at town-hall dialogues as storytelling and public dialogue catalysts.',
    patterns: ['Shared Cultural Story', 'Trust Infrastructure', 'Local Pride Rituals']
  },
  {
    id: 16,
    location: 'Vermont',
    color: '#a0c8e8',
    image: '/places/vermont.jpg',
    title: 'Hyper-Local Network Builds Daily Trust',
    problem: 'Neighbors didn\'t know each other or have trusted ways to communicate and coordinate.',
    solution: 'Front Porch Forum provides statewide hyper-local civic network with moderated neighborhood boards.',
    patterns: ['Trust Infrastructure', 'Village Broadcast Loop', 'Civic Intermediary Table']
  },
  {
    id: 17,
    location: 'Rural Oregon Fire District',
    color: '#d4e8b8',
    image: '/places/oregon-fire-district.png',
    title: 'Transparent Operations Build Community Trust',
    problem: 'Residents distrusted local government and felt excluded from decision-making.',
    solution: 'Fire department holds quarterly open forums and publishes detailed action logs and transparency reports.',
    patterns: ['Trust Infrastructure', 'Listening Infrastructure', 'Nested Governance Tables']
  },
  {
    id: 18,
    location: 'South Dakota Tribal Lands',
    color: '#c8d4e8',
    image: '/places/south-dakota-tribal-lands.webp',
    title: 'Peacemaking Circles Restore Justice',
    problem: 'Criminal justice system and inter-family conflicts eroded community cohesion.',
    solution: 'Tribal-led mediation and peacemaking circles using restorative justice for community trust building.',
    patterns: ['Trust Infrastructure', 'Shared Cultural Story', 'Commons Stewardship']
  },
  {
    id: 19,
    location: 'Vancouver, Canada',
    color: '#e8c8b8',
    image: '/places/grandview-woodland-vancouver.jpeg',
    title: 'Citizens\' Assembly Shapes Neighborhood Future',
    problem: 'Top-down planning excluded residents from decisions about their own neighborhoods.',
    solution: 'Citizens\' assemblies for participatory budgeting and neighborhood design in Grandview-Woodland.',
    patterns: ['Trust Infrastructure', 'Nested Governance Tables', 'Listening Infrastructure']
  },
  {
    id: 20,
    location: 'California School Districts',
    color: '#b8c8e8',
    image: '/places/california-school-district.jpg',
    title: 'Open Dashboards Create Accountability',
    problem: 'School performance data was opaque, reducing trust between parents and institutions.',
    solution: 'Public open data dashboards tracking school and civic performance as transparent accountability tools.',
    patterns: ['Trust Infrastructure', 'Public Data Commons', 'Listening Infrastructure']
  },
  {
    id: 21,
    location: 'Montana',
    color: '#d4c8b8',
    image: '/places/montana.jpg',
    title: 'Health Coalition Rebuilds Regional Trust',
    problem: 'Fragmented health services and institutional distrust limited public health effectiveness.',
    solution: 'Rural public-health coalition with shared-trust pledge and statewide investments in local partnership infrastructure.',
    patterns: ['Trust Infrastructure', 'Institutional Partnership Liaisons', 'Regional Mutual Aid Protocols']
  },
  {
    id: 22,
    location: 'Appalachian Communities',
    color: '#c8e8d4',
    image: '/places/appalachian-communities.jpg',
    title: 'Regional Timebank Network Builds Reciprocity',
    problem: 'High unemployment and isolation left skills untapped and needs unmet.',
    solution: 'Mountain Time Exchange creating regional timebank for swapping services like tutoring, yard work, and elder support.',
    patterns: ['Social Timebank', 'Trust Infrastructure', 'Civic Gig Platform']
  },
  {
    id: 23,
    location: 'Santa Fe, New Mexico',
    color: '#e8d4c8',
    image: '/places/santa-fe.jpeg',
    title: 'Local Timebank Connects Skills and Needs',
    problem: 'Residents with skills couldn\'t find work; others couldn\'t afford needed services.',
    solution: 'Santa Fe Time Bank enabling volunteers to earn credits for car repairs, massage therapy, and reciprocal exchanges.',
    patterns: ['Social Timebank', 'Civic Gig Platform', 'Community Anchor Point']
  },
  {
    id: 24,
    location: 'Port Townsend, Washington',
    color: '#b8d4d4',
    image: '/places/port-townsend.jpg',
    title: 'Timebank Links Nonprofits and Residents',
    problem: 'Civic organizations and individuals worked in silos without mutual support.',
    solution: 'Port Townsend Time Bank serving Jefferson/Clallam counties with local nonprofits participating.',
    patterns: ['Social Timebank', 'Trust Infrastructure', 'Civic Intermediary Table']
  },
  {
    id: 25,
    location: 'London, UK',
    color: '#d4b8e8',
    image: '/places/london-uk.jpeg',
    title: 'Large-Scale Timebank Engages Institutions',
    problem: 'Urban isolation and service gaps despite proximity to major institutions.',
    solution: 'Echo (Economy of Hours) creating large-scale timebank with institutional partners and evolving model.',
    patterns: ['Social Timebank', 'Institutional Partnership Liaisons', 'Co-Governed Platforms']
  },
  {
    id: 26,
    location: 'Portland, Maine',
    color: '#c8b8e8',
    image: '/places/portland-maine.webp',
    title: 'Long-Running Timebank Proves Model',
    problem: 'Economic inequality limited access to essential services and skills.',
    solution: 'Hour Exchange Portland operating as long-running U.S. timebank model for reciprocal exchange.',
    patterns: ['Social Timebank', 'Trust Infrastructure', 'Community Anchor Point']
  },
  {
    id: 27,
    location: 'Huerfano County, Colorado',
    color: '#e8c8d4',
    image: '/places/huerfano-county.jpg',
    title: 'Indigenous Place Names Build Pride',
    problem: 'Colonial place names erased Indigenous heritage and cultural identity.',
    solution: '"Huajatolla" place-name pride campaign with tees, cultural festivals, and heritage events honoring Indigenous names.',
    patterns: ['Local Pride Rituals', 'Shared Cultural Story', 'Heritage-to-Market Program']
  },
  {
    id: 28,
    location: 'Hazelwood, Pennsylvania',
    color: '#b8e8d4',
    image: '/places/hazelwood-pittsburgh.jpeg',
    title: 'Monthly Story Nights Activate Neighborhood',
    problem: 'Neighborhood felt disconnected with no regular gathering traditions.',
    solution: 'Monthly neighborhood storytelling and "light-up" nights with regular, hyperlocal arts and story activations.',
    patterns: ['Local Pride Rituals', 'Shared Cultural Story', 'Village Broadcast Loop']
  },
  {
    id: 29,
    location: 'Raton, New Mexico',
    color: '#d4e8c8',
    image: '/places/raton-new-mexico.webp',
    title: 'Youth-Designed Posters Foster Civic Pride',
    problem: 'Youth felt invisible and disconnected from community identity.',
    solution: 'Youth-designed pride posters displayed downtown as youth/artist poster-led pride campaigns.',
    patterns: ['Local Pride Rituals', 'Youth Return Pathway', 'Creative Apprenticeships']
  },
  {
    id: 30,
    location: 'Trinidad, Colorado',
    color: '#e8b4a0',
    image: '/places/trinidad-colorado.jpg',
    title: 'Creative District Drives Cultural Revival',
    problem: 'Declining downtown lacked cultural programming and unified identity.',
    solution: 'Corazón de Trinidad Creative District with certified status, Get Lit Literary Festival, and seasonal story campaigns.',
    patterns: ['Local Pride Rituals', 'Culture-as-Economy', 'Main Street Reawakening']
  },
  {
    id: 31,
    location: 'Winters, California',
    color: '#c8d4b8',
    image: '/places/winters-california.webp',
    title: 'Downtown Branding Creates Pride Rituals',
    problem: 'Small town struggled with identity and attracting visitors or investment.',
    solution: 'Branded neighborhood banners and seasonal story campaigns with recurring events as pride rituals.',
    patterns: ['Local Pride Rituals', 'Culture-as-Economy', 'Main Street Reawakening']
  },
  {
    id: 32,
    location: 'Boone, North Carolina',
    color: '#b8c8d4',
    image: '/places/boone-north-carolina.jpg',
    title: 'Community-Driven Brand Refresh',
    problem: 'Town identity was unclear and failed to reflect current community values.',
    solution: '"My Boone" branding effort with community-driven town identity refresh and downtown roll-out.',
    patterns: ['Local Pride Rituals', 'Shared Cultural Story', 'Main Street Reawakening']
  }
]

export const allStories: CaseStudy[] = caseStudies

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
