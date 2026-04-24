const resourceSeed = [
  {
    id: 'frontend-roadmaps',
    title: 'Frontend Roadmaps',
    description: 'Step-by-step learning paths from basics to advanced frontend engineering.',
    type: 'Roadmap',
    count: '12 Guides',
    iconKey: 'workflow',
  },
  {
    id: 'javascript-practice',
    title: 'JavaScript Practice Sets',
    description: 'Topic-wise coding questions with simple hints and expected output.',
    type: 'Practice',
    count: '180 Problems',
    iconKey: 'code2',
  },
  {
    id: 'dsa-cheatsheets',
    title: 'DSA Cheat Sheets',
    description: 'Quick revision sheets for arrays, strings, trees, graphs, and DP.',
    type: 'Cheat Sheet',
    count: '45 Sheets',
    iconKey: 'notebook',
  },
  {
    id: 'react-patterns',
    title: 'React Component Patterns',
    description: 'Reusable component structure examples for real-world React projects.',
    type: 'Code Samples',
    count: '60 Snippets',
    iconKey: 'layout',
  },
  {
    id: 'backend-handbook',
    title: 'Backend API Handbook',
    description: 'Practical API design, auth flow, validation, and error handling reference.',
    type: 'Reference',
    count: '30 Chapters',
    iconKey: 'server',
  },
  {
    id: 'sql-library',
    title: 'SQL Query Library',
    description: 'Ready-to-use SQL examples from basic filtering to advanced joins.',
    type: 'Database',
    count: '90 Queries',
    iconKey: 'database',
  },
  {
    id: 'system-design-notes',
    title: 'System Design Notes',
    description: 'Simple architecture notes with diagrams for common interview systems.',
    type: 'Notes',
    count: '28 Topics',
    iconKey: 'filetext',
  },
  {
    id: 'interview-bank',
    title: 'Interview Question Bank',
    description: 'Role-based interview questions for frontend, backend, and full-stack roles.',
    type: 'Interview Prep',
    count: '420 Questions',
    iconKey: 'pen',
  },
  {
    id: 'resume-kit',
    title: 'Resume + Portfolio Kit',
    description: 'ATS-friendly resume templates and portfolio content structure examples.',
    type: 'Career',
    count: '15 Templates',
    iconKey: 'book',
  },
  {
    id: 'youtube-playlists',
    title: 'Free Video Playlists',
    description: 'Handpicked topic playlists for quick concept understanding and revision.',
    type: 'Video',
    count: '200+ Videos',
    iconKey: 'video',
  },
  {
    id: 'project-ideas',
    title: 'Project Idea Vault',
    description: 'Beginner to advanced project ideas with features and implementation hints.',
    type: 'Projects',
    count: '110 Ideas',
    iconKey: 'lightbulb',
  },
  {
    id: 'revision-notes',
    title: 'Last-Minute Revision Notes',
    description: 'Compact notes for interview week preparation and fast recap.',
    type: 'Revision',
    count: '24 Packs',
    iconKey: 'revision',
  },
];

const detailsById = {
  'frontend-roadmaps': {
    level: 'Beginner to Advanced',
    format: 'Visual Roadmap + Weekly Tasks',
    estimateTime: '6-8 weeks per track',
    updatedAt: 'Updated every week',
    accentLabel: 'Roadmap Blueprint',
    subtitle:
      'A milestone-driven path so students can stop guessing what to learn next and focus on shipping.',
    outcomes: [
      'Understand the exact sequence for HTML, CSS, JavaScript, React, and deployment.',
      'Track your progress through milestone checkpoints and mini deliverables.',
      'Balance concept learning with project implementation every single week.',
      'Avoid tutorial hopping by following one curated route end to end.',
    ],
    modules: [
      { title: 'Foundation Sprint', detail: 'Web basics, semantic HTML, modern CSS.', duration: 'Week 1-2' },
      { title: 'JavaScript Core', detail: 'ES6+, DOM, asynchronous patterns.', duration: 'Week 3-4' },
      { title: 'React Build Loop', detail: 'State, component architecture, API integration.', duration: 'Week 5-6' },
      { title: 'Launch + Polish', detail: 'Performance, accessibility, deployment checklist.', duration: 'Week 7-8' },
    ],
    workflow: [
      { title: 'Pick your current level', detail: 'Start from Beginner, Intermediate, or Fast Track.' },
      { title: 'Follow weekly goals', detail: 'Each week has clear outcomes and practical tasks.' },
      { title: 'Ship one mini project', detail: 'Build after every learning block for retention.' },
      { title: 'Review with checklist', detail: 'Close each week by verifying your milestone.' },
    ],
    includes: ['Progress tracker sheet', 'Weekly milestone checklist', 'Career direction map', 'Project readiness rubric'],
    previewTitle: 'Roadmap Snapshot',
    previewCode: `Week 1: HTML + CSS fundamentals
Week 2: Responsive UI + Flex/Grid
Week 3: JavaScript core + DOM
Week 4: Async JS + API handling`,
  },
  'javascript-practice': {
    level: 'Beginner to Intermediate',
    format: 'Problem Bank + Hints',
    estimateTime: '30-45 min daily',
    updatedAt: 'New sets every Friday',
    accentLabel: 'Practice Stack',
    subtitle:
      'Practice sets designed to build speed and confidence with real coding patterns used in interviews.',
    outcomes: [
      'Strengthen problem-solving for arrays, objects, strings, and recursion.',
      'Learn to write cleaner and readable JavaScript under time pressure.',
      'Improve debugging speed with expected output references.',
      'Build confidence for coding rounds and machine tests.',
    ],
    modules: [
      { title: 'Warm-up Sets', detail: 'Basic syntax, loops, conditionals.', duration: '40 problems' },
      { title: 'Core Logic Sets', detail: 'Arrays, strings, object transformations.', duration: '85 problems' },
      { title: 'Interview Sets', detail: 'Timed practice and edge-case scenarios.', duration: '55 problems' },
    ],
    workflow: [
      { title: 'Solve', detail: 'Attempt without looking at hints first.' },
      { title: 'Compare', detail: 'Check expected output and optimize your solution.' },
      { title: 'Refactor', detail: 'Rewrite once for readability and once for performance.' },
      { title: 'Repeat', detail: 'Revisit wrong problems after 48 hours.' },
    ],
    includes: ['Difficulty tags', 'Expected output panel', 'Hint ladder (3 levels)', 'Progress score board'],
    previewTitle: 'Sample Problem',
    previewCode: `Input: [1,2,3,4,5]
Task: Return only even numbers squared
Output: [4,16]`,
  },
  'dsa-cheatsheets': {
    level: 'Beginner to Advanced',
    format: 'One-page Revision Sheets',
    estimateTime: '15 min quick revision',
    updatedAt: 'Refreshed monthly',
    accentLabel: 'Revision Pack',
    subtitle:
      'Compact DSA maps that let you revise concepts, complexity, and common patterns in minutes.',
    outcomes: [
      'Revise high-frequency data structures quickly before tests and interviews.',
      'Remember time and space complexity for key operations.',
      'Connect problem patterns to right data structures faster.',
      'Reduce anxiety with structured last-minute revision.',
    ],
    modules: [
      { title: 'Arrays + Strings', detail: 'Sliding window, two pointers, prefix sums.', duration: '12 sheets' },
      { title: 'Trees + Graphs', detail: 'Traversal maps, BFS/DFS decision guide.', duration: '16 sheets' },
      { title: 'DP + Greedy', detail: 'State definitions and transition templates.', duration: '17 sheets' },
    ],
    workflow: [
      { title: 'Pick topic', detail: 'Select topic based on your upcoming round.' },
      { title: 'Revise formula', detail: 'Memorize complexity and approach rules.' },
      { title: 'Attempt one problem', detail: 'Immediately apply the sheet to practice.' },
      { title: 'Self-check', detail: 'Mark confidence level in your tracker.' },
    ],
    includes: ['Complexity table', 'Pattern cues', 'Common pitfalls list', 'Interview recap notes'],
    previewTitle: 'Complexity Preview',
    previewCode: `HashMap:
Insert -> O(1) avg
Lookup -> O(1) avg
Worst case -> O(n)`,
  },
  'react-patterns': {
    level: 'Intermediate',
    format: 'Architecture Patterns + Snippets',
    estimateTime: '2-3 hrs per module',
    updatedAt: 'Updated biweekly',
    accentLabel: 'Component Architecture',
    subtitle:
      'Production-style React structures to help students move from toy projects to real maintainable apps.',
    outcomes: [
      'Build reusable and scalable component systems.',
      'Organize state and side effects with clean boundaries.',
      'Apply composition patterns for better code reuse.',
      'Understand when to split, memoize, and optimize components.',
    ],
    modules: [
      { title: 'Component Composition', detail: 'Compound components and slot patterns.', duration: '14 patterns' },
      { title: 'Data + State Layer', detail: 'Container/presentational and custom hook systems.', duration: '18 patterns' },
      { title: 'Performance Patterns', detail: 'Memoization, virtualization, lazy boundaries.', duration: '28 patterns' },
    ],
    workflow: [
      { title: 'Read pattern intent', detail: 'Understand where this pattern is useful.' },
      { title: 'Copy starter snippet', detail: 'Use the base skeleton in your project.' },
      { title: 'Customize for feature', detail: 'Adjust props and state boundaries.' },
      { title: 'Benchmark', detail: 'Check render behavior after changes.' },
    ],
    includes: ['Folder structure guide', 'Naming conventions', 'Anti-pattern checklist', 'Code review rubric'],
    previewTitle: 'Pattern Preview',
    previewCode: `function useDisclosure() {
  const [open, setOpen] = useState(false);
  return { open, openPanel: () => setOpen(true), closePanel: () => setOpen(false) };
}`,
  },
  'backend-handbook': {
    level: 'Intermediate',
    format: 'API Handbook + Ready Checklists',
    estimateTime: '4-5 hrs per chapter',
    updatedAt: 'Updated monthly',
    accentLabel: 'Backend Reference',
    subtitle:
      'A practical backend handbook for designing stable APIs with clean auth, validation, and error contracts.',
    outcomes: [
      'Design predictable API response structures.',
      'Apply authentication and authorization in scalable ways.',
      'Handle validation and errors with production standards.',
      'Write maintainable controller-service architecture.',
    ],
    modules: [
      { title: 'API Fundamentals', detail: 'REST conventions, versioning, endpoint naming.', duration: '8 chapters' },
      { title: 'Security + Validation', detail: 'Auth tokens, role checks, request validation.', duration: '11 chapters' },
      { title: 'Reliability Layer', detail: 'Error handling, logs, pagination, rate limiting.', duration: '11 chapters' },
    ],
    workflow: [
      { title: 'Read chapter summary', detail: 'Understand principle before implementation.' },
      { title: 'Apply checklist', detail: 'Implement standards in your own endpoint.' },
      { title: 'Test contract', detail: 'Verify success and failure payloads.' },
      { title: 'Review against rubric', detail: 'Use quality checklist before shipping.' },
    ],
    includes: ['Auth flow diagrams', 'Error response templates', 'Pagination guide', 'API review checklist'],
    previewTitle: 'API Contract Sample',
    previewCode: `{
  "success": true,
  "message": "Profile fetched",
  "data": { "id": "u_102", "name": "Asha" }
}`,
  },
  'sql-library': {
    level: 'Beginner to Intermediate',
    format: 'Query Cookbook',
    estimateTime: '20-30 min daily',
    updatedAt: 'Updated weekly',
    accentLabel: 'SQL Cookbook',
    subtitle:
      'From basics to joins and analytics, this library gives students ready SQL patterns they can adapt quickly.',
    outcomes: [
      'Write accurate SELECT queries with confidence.',
      'Master joins, grouping, and aggregate functions.',
      'Handle filtering and ranking scenarios for interviews.',
      'Translate business questions into SQL statements.',
    ],
    modules: [
      { title: 'Core SQL', detail: 'SELECT, WHERE, ORDER BY, LIMIT.', duration: '28 queries' },
      { title: 'Relational Joins', detail: 'INNER, LEFT, FULL, self joins.', duration: '31 queries' },
      { title: 'Analytics Blocks', detail: 'Window functions and grouped reporting.', duration: '31 queries' },
    ],
    workflow: [
      { title: 'Choose query pattern', detail: 'Select the closest real-world query template.' },
      { title: 'Replace table schema', detail: 'Swap column and table names with your project data.' },
      { title: 'Run and inspect output', detail: 'Validate correctness with edge filters.' },
      { title: 'Optimize', detail: 'Use indexes and explain plan where needed.' },
    ],
    includes: ['Schema notes', 'Join cheat cards', 'Index reminders', 'Interview query drills'],
    previewTitle: 'Query Preview',
    previewCode: `SELECT student_name, score
FROM scores
WHERE score >= 80
ORDER BY score DESC;`,
  },
  'system-design-notes': {
    level: 'Intermediate to Advanced',
    format: 'Diagram Notes + Tradeoff Sheets',
    estimateTime: '2 hrs per topic',
    updatedAt: 'Updated monthly',
    accentLabel: 'Architecture Notes',
    subtitle:
      'Simple visual breakdowns of real systems so students can discuss tradeoffs clearly in interviews.',
    outcomes: [
      'Explain architecture decisions with confidence.',
      'Understand scaling, caching, partitioning, and queues.',
      'Communicate tradeoffs across availability and consistency.',
      'Design interview-ready system diagrams quickly.',
    ],
    modules: [
      { title: 'Core Building Blocks', detail: 'Load balancer, cache, DB, queue, CDN.', duration: '8 topics' },
      { title: 'Popular Systems', detail: 'Chat app, URL shortener, feed, payment flow.', duration: '12 topics' },
      { title: 'Interview Strategy', detail: 'How to present assumptions and tradeoffs.', duration: '8 topics' },
    ],
    workflow: [
      { title: 'Read base architecture', detail: 'Understand baseline version first.' },
      { title: 'Add scaling layers', detail: 'Evolve design for high traffic scenarios.' },
      { title: 'Compare tradeoffs', detail: 'Decide between cost, latency, and reliability.' },
      { title: 'Present in 10 minutes', detail: 'Practice concise interview explanation.' },
    ],
    includes: ['System diagrams', 'Scale scenarios', 'Tradeoff matrix', 'Mock interview prompts'],
    previewTitle: 'Interview Structure',
    previewCode: `1) Clarify requirements
2) Define high-level architecture
3) Deep dive critical components
4) Discuss bottlenecks + tradeoffs`,
  },
  'interview-bank': {
    level: 'All Levels',
    format: 'Question Bank + Model Direction',
    estimateTime: '30 min mock practice',
    updatedAt: 'New questions weekly',
    accentLabel: 'Interview Prep Vault',
    subtitle:
      'Role-wise interview question bank with practical directions so students can prepare with structure.',
    outcomes: [
      'Practice role-specific technical and behavioral rounds.',
      'Identify weak areas quickly through categorized sets.',
      'Build better answer structure with concise thinking.',
      'Improve confidence in live interviews.',
    ],
    modules: [
      { title: 'Frontend Round', detail: 'React, JS, performance, accessibility.', duration: '150 questions' },
      { title: 'Backend Round', detail: 'API, auth, DB design, scaling.', duration: '145 questions' },
      { title: 'Full Stack Round', detail: 'System integration and architecture.', duration: '125 questions' },
    ],
    workflow: [
      { title: 'Pick role pack', detail: 'Use focused set based on job target.' },
      { title: 'Attempt timed round', detail: 'Simulate interview pressure conditions.' },
      { title: 'Review ideal direction', detail: 'Compare your flow with model structure.' },
      { title: 'Repeat with weak tags', detail: 'Close gaps week by week.' },
    ],
    includes: ['Role filters', 'Difficulty bands', 'Mock round tracker', 'Behavioral framework'],
    previewTitle: 'Sample Prompt',
    previewCode: `Q: How would you optimize a React page with heavy lists?
Expected direction: profiling -> memoization -> windowing -> data fetch strategy`,
  },
  'resume-kit': {
    level: 'Beginner to Intermediate',
    format: 'Template Kit + Writing Guide',
    estimateTime: '2-3 hrs setup',
    updatedAt: 'Updated every month',
    accentLabel: 'Career Launch Kit',
    subtitle:
      'ATS-friendly resumes and portfolio structures that help students present skills clearly and professionally.',
    outcomes: [
      'Build role-focused resumes without unnecessary clutter.',
      'Write measurable project bullets that stand out.',
      'Create a clear portfolio narrative with proof of work.',
      'Align profile for internship and entry-level roles.',
    ],
    modules: [
      { title: 'Resume Templates', detail: 'Frontend, backend, and full stack versions.', duration: '9 templates' },
      { title: 'Project Positioning', detail: 'How to write impact-based project lines.', duration: '4 guides' },
      { title: 'Portfolio Storyline', detail: 'Case study layout and recruiter scan flow.', duration: '2 frameworks' },
    ],
    workflow: [
      { title: 'Choose target role', detail: 'Pick one role for sharper profile positioning.' },
      { title: 'Fill ATS template', detail: 'Use keyword-aware section structure.' },
      { title: 'Refine project bullets', detail: 'Add metrics and technical depth.' },
      { title: 'Publish portfolio', detail: 'Ship your final profile page.' },
    ],
    includes: ['ATS resume templates', 'Portfolio wireframe', 'Bullet writing formula', 'Profile quality checklist'],
    previewTitle: 'Bullet Formula',
    previewCode: `Built [feature] using [tech stack], improved [metric] by [value], and deployed to [platform].`,
  },
  'youtube-playlists': {
    level: 'All Levels',
    format: 'Curated Video Tracks',
    estimateTime: 'Flexible self pace',
    updatedAt: 'Curated weekly',
    accentLabel: 'Video Learning Tracks',
    subtitle:
      'Topic-first playlists that help students revise quickly, clear doubts, and follow guided visual learning.',
    outcomes: [
      'Learn concepts faster through guided visual explanations.',
      'Use topic playlists for revision before practice rounds.',
      'Combine videos with assignments for active retention.',
      'Build a consistent self-learning routine.',
    ],
    modules: [
      { title: 'Frontend Playlists', detail: 'HTML/CSS/JS/React learning tracks.', duration: '85 videos' },
      { title: 'Backend Playlists', detail: 'Node, API, auth, DB sessions.', duration: '62 videos' },
      { title: 'Interview + Career', detail: 'Mock rounds and strategy breakdowns.', duration: '53 videos' },
    ],
    workflow: [
      { title: 'Pick one topic', detail: 'Start with current weak area only.' },
      { title: 'Watch with notes', detail: 'Capture key ideas and examples.' },
      { title: 'Practice immediately', detail: 'Apply learning in coding task.' },
      { title: 'Revise from bookmark', detail: 'Keep your own quick revision set.' },
    ],
    includes: ['Playlist bookmarks', 'Topic tagging', 'Revision queue', 'Practice mapping'],
    previewTitle: 'Playlist Plan',
    previewCode: `Day 1: JavaScript closures
Day 2: Async patterns
Day 3: API integration
Day 4: Build mini feature`,
  },
  'project-ideas': {
    level: 'Beginner to Advanced',
    format: 'Idea Vault + Scope Guide',
    estimateTime: '1 project per 1-2 weeks',
    updatedAt: 'New ideas every two weeks',
    accentLabel: 'Build Track',
    subtitle:
      'A complete vault of practical project ideas that grow with your skills from beginner to advanced levels.',
    outcomes: [
      'Pick projects with clear outcomes and measurable scope.',
      'Avoid overbuilding by using milestone-based implementation.',
      'Learn how to convert ideas into portfolio-ready products.',
      'Increase confidence by shipping consistently.',
    ],
    modules: [
      { title: 'Starter Ideas', detail: 'Simple apps for fundamentals and confidence.', duration: '40 ideas' },
      { title: 'Intermediate Ideas', detail: 'API and auth driven projects.', duration: '45 ideas' },
      { title: 'Advanced Ideas', detail: 'Scalable full-stack architecture projects.', duration: '25 ideas' },
    ],
    workflow: [
      { title: 'Select difficulty', detail: 'Match project with your current stage.' },
      { title: 'Read feature scope', detail: 'Understand must-have and optional parts.' },
      { title: 'Build in milestones', detail: 'Ship by phases instead of one giant push.' },
      { title: 'Publish showcase', detail: 'Write case study and demo your build.' },
    ],
    includes: ['Feature checklist', 'Tech stack suggestions', 'Milestone templates', 'Portfolio writeup format'],
    previewTitle: 'Project Scope Example',
    previewCode: `Project: Job Tracker App
Core: auth, CRUD, filters
Plus: analytics dashboard, reminders, export`,
  },
  'revision-notes': {
    level: 'All Levels',
    format: 'Quick Revision Packs',
    estimateTime: '10-20 min daily',
    updatedAt: 'Refreshed before placement season',
    accentLabel: 'Final Revision',
    subtitle:
      'Fast recap packs for interview week so students can revise confidently without overwhelming notes.',
    outcomes: [
      'Revise critical concepts quickly before interviews.',
      'Keep your revision structured across frontend and backend.',
      'Use short memory triggers for formulas and patterns.',
      'Reduce last-week preparation stress.',
    ],
    modules: [
      { title: 'Frontend Recap', detail: 'React, JS, browser, performance points.', duration: '9 packs' },
      { title: 'Backend Recap', detail: 'API, auth, DB and system notes.', duration: '8 packs' },
      { title: 'Interview Week Pack', detail: 'Most asked concepts and summary maps.', duration: '7 packs' },
    ],
    workflow: [
      { title: 'Pick daily pack', detail: 'Study one pack each day with timer.' },
      { title: 'Mark confidence', detail: 'Track weak and strong topics.' },
      { title: 'Revise weak areas', detail: 'Repeat low-confidence packs first.' },
      { title: 'Final recap', detail: 'Run complete summary before interviews.' },
    ],
    includes: ['One-page summaries', 'Memory triggers', 'Interview quick checks', 'Final revision tracker'],
    previewTitle: 'Interview Week Checklist',
    previewCode: `Day -5: JavaScript + React core
Day -4: API + auth + DB
Day -3: DSA + complexity recap
Day -2: Projects + resume walkthrough`,
  },
};

const defaultDetails = {
  level: 'All Levels',
  format: 'Structured Resource Pack',
  estimateTime: '2-3 hours per week',
  updatedAt: 'Updated regularly',
  accentLabel: 'Free Resource',
  subtitle: 'A practical free resource to make learning clear, consistent, and result focused.',
  outcomes: ['Build clarity', 'Improve implementation', 'Track progress', 'Prepare for interviews'],
  modules: [],
  workflow: [],
  includes: [],
  previewTitle: 'Resource Preview',
  previewCode: '',
};

export const freeResources = resourceSeed.map((resource) => ({
  ...resource,
  ...defaultDetails,
  ...(detailsById[resource.id] || {}),
}));

export const getFreeResourceById = (resourceId) =>
  freeResources.find((resource) => resource.id === resourceId);
