// Single source of truth for the homepage and the /resume page.
// Edit copy here; both the site and the resume PDF read from this file.

export const person = {
  name: "Gokul Madan Alikkal",
  shortName: "Gokul",
  location: "Belfast, Northern Ireland",
  email: "gokulmadan2@gmail.com",
  linkedin: "https://linkedin.com/in/gokulmadan",
  linkedinLabel: "linkedin.com/in/gokulmadan",
  website: "https://gokulmadan.com",
  websiteLabel: "gokulmadan.com",
  portrait: "/images/8cc9d0fe-9220-494f-84f5-9b5f765a8d3f.png",
  resumePdf: "/resume.pdf",
  resumeFileName: "Gokul Madan - Resume - Nov 2026.pdf",
};

export const hero = {
  eyebrow: "Consulting · Product · AI",
  headline: {
    lead: "From deals and data to ",
    highlight: "deployed AI.",
  },
  sublines: [
    "Understanding how a business works is the part I enjoy most. Building something that makes it work better is a very close second.",
    "Over the past 16 years, that’s meant analytics for Fortune 500 companies, deals advisory at PwC, founding a SaaS company, and now AI solutions engineering.",
  ],
  chips: ["Whitespace", "Founder, Xolution", "Ex-PwC US"],
};

export const arc = [
  { years: "2010 – 2015", label: "Analytics", detail: "Cognizant · Mu Sigma" },
  { years: "2015 – 2023", label: "Deals advisory", detail: "PwC US" },
  { years: "2023 – 2026", label: "Founder", detail: "Xolution" },
  { years: "2026 –", label: "Sovereign AI", detail: "Whitespace" },
];

export type Logo = { src: string; alt: string; className?: string };

export const clientLogos: Logo[] = [
  { src: "/logos/whitespace.svg", alt: "Whitespace" },
  { src: "/logos/pwc.png", alt: "PwC" },
  { src: "/images/1f68f6ac-9673-4389-88a0-713912cec46e.png", alt: "Accordion" },
  { src: "/images/64a96aef-ba27-448b-9b28-edb7fcc441b3.png", alt: "AT&T" },
  { src: "/images/ee904dae-73ef-4ba8-a44b-910102e0178e.png", alt: "GE" },
  { src: "/images/bfccb223-9fb9-4400-91ab-523c8a4abec0.png", alt: "Hewlett Packard Enterprise" },
  { src: "/images/06605beb-1704-4008-9ef8-9f0226f8b6e7.png", alt: "DXC" },
  { src: "/images/88064e12-18aa-42ef-b6fb-7e21e834eaff.png", alt: "Maersk" },
  { src: "/images/2a736e24-15d0-4879-b154-b1c8a89c2bc0.png", alt: "Symantec" },
  { src: "/images/2e8e1f34-d32d-49fb-8294-4d4670c7f88e.png", alt: "Mu Sigma" },
  { src: "/images/c18351e1-f187-4f17-9d0e-537024853b11.png", alt: "Cognizant" },
];

// ── Selected work ────────────────────────────────────────────────────────────

export const caseStudy = {
  kicker: "Featured case study · Xolution × Accordion",
  title: "Post-acquisition reporting for an Apax portfolio company",
  context:
    "Accordion used Xolution to manage post-acquisition reporting for a multi-billion-dollar Apax portfolio company, bringing financial adjustments, reviews and reporting into one place.",
  built: [
    "One reporting layer for financial data, adjustments and documentation across every entity.",
    "Structured GAAP, purchase accounting, consolidation and day-one transaction adjustments, with audit-ready views.",
    "Review workflow with internal and client approvals and a full audit trail.",
    "Excel-ready outputs, so advisers could keep working the way they already did.",
  ],
  outcome:
    "Replaced multiple 48+ tab Excel models by one unified platform the advisory, client and audit teams all worked from.",
  stats: [
    { value: "7", label: "Entities consolidated" },
    { value: "22", label: "Users across advisory, client and audit teams" },
    { value: "66", label: "Financial adjustments managed" },
    { value: "3", label: "Reporting periods" },
  ],
  // Overlapping collage, laid out as on the original case-study slide.
  // Positions are % of the collage box. `mobile` is a smaller three-piece collage led by the P&L;
  // images without it (the team panel) are desktop-only.
  images: [
    { src: "/work/xolution/team.webp", caption: "Adjustments and project team", pos: { left: 0, top: 0, width: 64.7 }, z: 10 },
    { src: "/work/xolution/pnl.webp", caption: "P&L with the adjustment overlay", pos: { left: 29.2, top: 43.2, width: 70.5 }, z: 20, mobile: { left: 0, top: 0, width: 94, z: 10 } },
    { src: "/work/xolution/status.png", caption: "Adjustment review status", pos: { left: 47.8, top: 16.9, width: 48.2 }, z: 30, mobile: { left: 44, top: 53.8, width: 56, z: 20 } },
    { src: "/work/xolution/audit.webp", caption: "Audit trail", pos: { left: 3.4, top: 36.3, width: 23.6 }, z: 40, mobile: { left: 3, top: 47.3, width: 30, z: 30 } },
  ],
  stack: ["Bubble front end", "Azure SQL", ".NET APIs on Azure", "Excel outputs"],
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  url: string;
  image: string;
};

export const projects: Project[] = [
  {
    slug: "northwind-close-demo",
    title: "Northwind close",
    category: "AI-run year-end close",
    summary:
      "From inbox to accounts: a year-end close for a fictional PE-backed logistics company, with AI booking journals, agreeing cash to bank and proposing EBITDA adjustments for a human to approve.",
    tags: ["Financial close", "AI workflows", "PE reporting"],
    url: "https://northwind-close-demo.vercel.app/",
    image: "/work/northwind-close-demo.webp",
  },
  {
    slug: "recoup-revenue-leakage",
    title: "RECOUP",
    category: "Revenue leakage recovery",
    summary:
      "Reads customer contracts against billing exports and ranks what is owed: escalators never applied, expired discounts, tier breaches, each with the clause to cite.",
    tags: ["Contract AI", "Revenue assurance"],
    url: "https://recoup-revenue-leakage.vercel.app/",
    image: "/work/recoup-revenue-leakage.webp",
  },
  {
    slug: "deal-clearance-intelligence",
    title: "Deal Clearance Intelligence",
    category: "Merger-control research",
    summary:
      "Source-backed regulatory research for transaction lawyers: precedent timelines, matter horizons and briefings built from public competition-authority records.",
    tags: ["M&A", "Legal research"],
    url: "https://deal-clearance-intelligence.vercel.app/",
    image: "/work/deal-clearance-intelligence.webp",
  },
  {
    slug: "workflow-library",
    title: "Workflow Library",
    category: "AI adoption playbook",
    summary:
      "Most AI pilots never reach production. A filterable catalogue of 34 finance and operations workflows, each scoped by tier, function, inputs, outputs and time to deploy.",
    tags: ["AI adoption", "Finance ops", "Solution design"],
    url: "https://workflow-library-iota.vercel.app/",
    image: "/work/workflow-library.webp",
  },
  {
    slug: "board-pack-studio",
    title: "Board Pack Studio",
    category: "Board reporting workspace",
    summary:
      "A CFO's monthly board-pack cycle in one place: prep timeline, lock checks, alerts on what moved against budget, and commentary drafted from live data.",
    tags: ["FP&A", "Board reporting"],
    url: "https://board-pack-studio-black.vercel.app/",
    image: "/work/board-pack-studio.webp",
  },
  {
    slug: "acme-reporting-pack",
    title: "Adjusted EBITDA pack",
    category: "Multi-entity consolidation",
    summary:
      "Group and entity P&L with intercompany eliminations and a live adjustment overlay, so every reported number ties back to the adjusted EBITDA bridge.",
    tags: ["Consolidation", "Adjusted EBITDA", "PE reporting"],
    url: "https://acme-reporting-pack.vercel.app/",
    image: "/work/acme-reporting-pack.webp",
  },
  {
    slug: "pe-vc-value-ledger",
    title: "Value Ledger",
    category: "Value creation tracking",
    summary:
      "A one-page PE value creation plan turned into a live execution ledger: every initiative owned and dated, status derived from progress, and value at risk shown in pounds.",
    tags: ["Value creation", "Portfolio monitoring"],
    url: "https://pe-vc-value-ledger.vercel.app/",
    image: "/work/pe-vc-value-ledger.webp",
  },
  {
    slug: "anla-intercompany-tracker",
    title: "ANLA intercompany tracker",
    category: "Regulatory liquidity",
    summary:
      "AI-matched intercompany balances across six regulated Jersey entities, showing how reconciliation and netting take two of three entities out of liquidity breach.",
    tags: ["Regulatory reporting", "Intercompany", "AI matching"],
    url: "https://anla-intercompany-tracker.vercel.app/",
    image: "/work/anla-intercompany-tracker.webp",
  },
  {
    slug: "forensic-income-reconstruction-engine",
    title: "Forensic income reconstruction",
    category: "Forensic accounting",
    summary:
      "Three indirect methods (net worth, expenditures and bank deposits) converge on one defensible figure for income that exists but was never declared.",
    tags: ["Forensics", "Litigation support"],
    url: "https://forensic-income-reconstruction-engi.vercel.app/",
    image: "/work/forensic-income-reconstruction-engine.webp",
  },
];

// ── Experience ───────────────────────────────────────────────────────────────

export type Role = {
  id: string;
  company: string;
  companyUrl?: string;
  logo?: string;
  logoIsSvgMark?: boolean;
  title: string;
  team?: string;
  location: string;
  start: string;
  end: string;
  current?: boolean;
  intro: string[];
  focus?: string[];
  stack?: string[];
  practice?: { title: string; body: string; image?: string; imageAlt?: string }[]; // site-only: concrete work in the role
  resumeIntro?: string; // resume-only context line under the role
  bullets: string[]; // resume bullets
};

export const roles: Role[] = [
  {
    id: "whitespace",
    company: "Whitespace",
    companyUrl: "https://white.space",
    logo: "/logos/whitespace.svg",
    logoIsSvgMark: true,
    title: "Lead Solutions Engineer",
    location: "Belfast",
    start: "Aug 2026",
    end: "Present",
    current: true,
    intro: [
      "Whitespace is a Belfast-based sovereign AI company. Its AI operating system, Collective, helps organisations make faster, better-informed decisions while keeping control of their data, models and infrastructure.",
      "I work directly with customers to understand their operational problems, prototype solutions with them, and bring those solutions to life on Collective with our engineering and product teams.",
    ],
    focus: [
      "Customer discovery",
      "Solution architecture",
      "Rapid prototyping",
      "Enterprise AI implementation",
    ],
    practice: [
      {
        title: "A finance lens on public-sector contracts",
        image: "/work/whitespace-contracts.webp",
        imageAlt: "Contract opportunities dashboard: spend over cap, close to cap, renewals and price increases",
        body: "Collective had already parsed thousands of contracts for a UK local-government reorganisation bringing several councils into one. I added the financial layer: a platform that flags contracts over or approaching their cap and under-utilised commitments, surfacing savings and risk opportunities.",
      },
      {
        title: "A knowledge graph of how products get built",
        image: "/work/whitespace-bench-graph.webp",
        imageAlt: "Build graph linking decisions, Jira tickets and versions over time",
        body: "A graph of the key decisions, Jira tickets, Slack threads and GitLab activity behind a product build, so the whole project can be queried in one place. The goal: a \u201cmeta\u201d graph for every project that Collective agents can use in the app builder to build applications the Whitespace way.",
      },
      {
        title: "An operating system for leadership",
        body: "An internal product that brings together CRM (HubSpot), HR, time tracking, project management and finance (Xero) data, so leadership can monitor the deal pipeline and live projects in one place.",
      },
    ],
    resumeIntro:
      "Whitespace is a Belfast-based sovereign AI company. Its AI operating system, Collective, helps organisations make faster, better-informed decisions while keeping control of their data, models and infrastructure.",
    bullets: [
      "Work directly with customers to uncover operational problems, shape requirements and prototype solutions on Collective, then partner with engineering and product teams to take them into production.",
      "Public-sector contracts: Collective had already parsed thousands of contracts for a UK local-government reorganisation bringing several councils into one. Added the financial layer: a platform flagging contracts over or approaching their cap and under-utilised commitments, surfacing savings and risk opportunities.",
      "Leadership operating system: an internal product bringing HubSpot, HR, time tracking, project management and Xero data together so leadership can monitor the deal pipeline and live projects in one place.",
      "Project knowledge graph: maps the key decisions, Jira tickets, Slack threads and GitLab activity behind a product build into one queryable graph, the basis for reusable project graphs that Collective agents use in the app builder.",
    ],
  },
  {
    id: "xolution",
    company: "Xolution",
    companyUrl: "https://xolution.io",
    logo: "/images/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png",
    title: "Founder & CEO",
    location: "Belfast",
    start: "Aug 2023",
    end: "Jul 2026",
    intro: [
      "I founded Xolution to simplify financial consolidation, reporting and analytics for private equity-backed businesses and the advisory firms that support them.",
      "I designed the product and led the development of a SaaS platform that brings fragmented financial data into a unified reporting model, so teams can automate complex workflows, keep data consistent and report to stakeholders without rebuilding spreadsheets each month. I owned product design, the financial data model and customer implementation; the platform was built with engineering collaborators.",
    ],
    stack: ["Bubble front end", "Azure SQL", ".NET APIs on Azure", "Financial data mapping", "Workflow design"],
    resumeIntro:
      "A SaaS platform for financial consolidation, reporting and analytics, built for private equity-backed businesses and the advisory firms that support them.",
    bullets: [
      "Founded the company and took the product from concept to paying customers: a platform that brings fragmented financial data into one reporting model, so teams can automate complex workflows and report without rebuilding spreadsheets each month.",
      "Owned product design, the financial data model and workflows, and led development with engineering collaborators (Bubble front end, Azure SQL, .NET APIs on Azure).",
      "Accordion case study: post-acquisition reporting for a multi-billion-dollar Apax portfolio company. 7 entities consolidated, 66 financial adjustments managed, 22 users across advisory, client and audit teams, 3 reporting periods; multiple 48+ tab Excel models replaced.",
      "Ran customer discovery, implementation and onboarding end to end, turning difficult reporting processes into repeatable workflows.",
    ],
  },
  {
    id: "pwc",
    company: "PwC US",
    logo: "/logos/pwc.png",
    title: "Senior Manager",
    team: "Deals Strategy and PE Value Creation",
    location: "Washington DC",
    start: "Nov 2015",
    end: "Apr 2023",
    intro: [
      "I led analytics and strategy work in PwC's US Deals practice across Fortune 100 companies, M&A, IPOs and divestitures, and specialised in value creation for private equity clients. Below are a few highlights.",
    ],
    resumeIntro:
      "Led analytics and strategy work in the US Deals practice across Fortune 100 companies, M&A, IPOs and divestitures, specialising in value creation for private equity clients.",
    bullets: [
      "Led the team that built a customer and product insights engine for the sell-side diligence of Pilot Freight Services (backed by ATL Partners and BCI) in its $1.7B sale to Maersk.",
      "Complex carve-outs: led the deals analytics team on a three-way carve-out at DXC (AP, AR, revenue and expense allocations, plus a consolidation automation tool); supported the four-way separation of HPE (legal-entity P&L separation with complex transfer pricing); and worked on the divestitures of GE Healthcare, GE Power (Vernova) and GE Lighting, and of Verisign from Symantec.",
      "Built a bottom-up indirect revenue forecasting model, with significant accounting standards implications, ahead of the IPO of Carlyle portfolio company PPD.",
      "Set the direction for an accounts receivable collections model that predicted customers' propensity to pay and shaped invoicing strategy.",
      "Combined six data sources into a consolidated data cube for monthly sponsor reporting after GoFan's acquisition by PlayOn, a KKR portfolio company.",
      "Used Palantir Foundry to drive a cost takeout initiative for AT&T Engineering Operations, identifying $25M+ of opportunity.",
      "Owned project planning, scoping, proposals and client relationships; mentored and led analytics teams across high-profile transactions.",
    ],
  },
  {
    id: "musigma",
    company: "Mu Sigma",
    companyUrl: "https://www.mu-sigma.com",
    logo: "/images/2e8e1f34-d32d-49fb-8294-4d4670c7f88e.png",
    title: "Associate",
    team: "Telecommunications · Banking and Finance",
    location: "Atlanta",
    start: "Apr 2011",
    end: "Oct 2015",
    intro: ["I led digital adoption work for Fortune 500 companies in telecommunications and banking."],
    resumeIntro: "Digital adoption and analytics for Fortune 500 companies in telecommunications and banking.",
    bullets: [
      "Built statistical models at the AT&T Big Data Centre of Excellence to improve customer targeting for digital channels.",
      "Led teams launching cross-channel sales processes for AT&T's Buy Online, Pick Up in Store initiative, and managed web analytics for the iPhone 6 launch on att.com.",
      "Developed segmentation frameworks for KeyBank to support sales performance management and staff optimisation.",
    ],
  },
  {
    id: "cognizant",
    company: "Cognizant",
    logo: "/images/c18351e1-f187-4f17-9d0e-537024853b11.png",
    title: "Programmer Analyst",
    team: "Insurance and Financial Services",
    location: "Bangalore",
    start: "Sep 2010",
    end: "Apr 2011",
    intro: ["Requirements analysis, test design and production support for a leading US insurer."],
    bullets: [
      "Translated business requirements into test scenarios and worked directly with the client (Farmers Insurance) on production defects.",
    ],
  },
];

export type Highlight = {
  title: string;
  tags: string[];
  body: string[];
  logos: Logo[];
};

export const pwcHighlights: Highlight[] = [
  {
    title: "Customer & product insights",
    tags: ["Private Equity", "Sell-side diligence"],
    body: [
      "Led a team that built a customer and product insights engine, central to the sell-side diligence for the $1.7B sale of Pilot Freight Services (backed by ATL Partners and BCI) to Maersk.",
    ],
    logos: [
      { src: "/images/1af70454-605a-4248-8505-92fa5666d3ea.png", alt: "Maersk", className: "h-6" },
      { src: "/images/5e8c18be-970d-4977-b433-7ef973e4ce29.png", alt: "Pilot Freight Services", className: "h-9" },
      { src: "/images/1ec2cced-d590-43d0-a971-d323e1d47af8.png", alt: "ATL Partners", className: "h-10" },
      { src: "/images/0b165cc7-8ff4-486e-966b-89d71eb26e01.png", alt: "BCI", className: "h-5" },
    ],
  },
  {
    title: "Complex carve-outs",
    tags: ["Carve-out", "Deals analytics"],
    body: [
      "HPE: supported the four-way separation of Hewlett Packard Enterprise, focused on legal-entity P&L separation with complex transfer pricing.",
      "DXC: led the deals analytics team on a three-way carve-out, covering the data-heavy financials (AP, AR, revenue, expense allocations) and a consolidation automation tool.",
      "GE: divestitures of GE Power (Vernova) and GE Healthcare across multi-layer accounting and reporting systems. Symantec: the divestiture of Verisign.",
    ],
    logos: [
      { src: "/images/8ab96d05-60f7-416c-8d2f-eae3620b04d5.png", alt: "Hewlett Packard Enterprise", className: "h-6" },
      { src: "/images/25d8be60-48bf-4948-9391-bc12f2ddd5ce.png", alt: "DXC Technology", className: "h-6" },
      { src: "/images/cd70899d-30be-4e36-9dc6-9b9a04e6d71e.png", alt: "General Electric", className: "h-7" },
      { src: "/images/4523e26c-e0e1-4376-a6fe-f8a75656d689.png", alt: "Symantec", className: "h-6" },
    ],
  },
  {
    title: "IPO forecasting & AR modelling",
    tags: ["Financial modelling", "IPO"],
    body: [
      "Built a bottom-up indirect revenue forecasting model ahead of the IPO of PPD, a Carlyle portfolio company.",
      "Set the direction for an accounts receivable collections model that predicted customers' propensity to pay and shaped invoicing strategy.",
    ],
    logos: [
      { src: "/images/19f5f5c6-8131-47f2-998b-d1fd113ca882.png", alt: "The Carlyle Group", className: "h-6" },
      { src: "/images/4f5b142c-7aee-4a67-931d-3f480f421800.png", alt: "PPD", className: "h-6" },
    ],
  },
  {
    title: "Cost takeout",
    tags: ["Advanced analytics", "Cost takeout"],
    body: [
      "Used Palantir Foundry at AT&T to drive a cost takeout initiative for Engineering Operations, identifying $25M+ of opportunity.",
    ],
    logos: [
      { src: "/images/d8bd04f8-30e1-46b6-b2c6-3b51b81906c4.png", alt: "AT&T", className: "h-7" },
      { src: "/images/19818142-90f8-497a-85f3-68e7f3b2ebfb.png", alt: "Palantir", className: "h-6" },
    ],
  },
  {
    title: "Consolidated data cube",
    tags: ["Private Equity", "Consolidation"],
    body: [
      "Combined six data sources into a consolidated data cube for monthly sponsor reporting after GoFan's acquisition by PlayOn, a KKR portfolio company.",
    ],
    logos: [
      { src: "/images/eef35f22-2207-453e-b7a6-461ea39fbd05.png", alt: "KKR", className: "h-6" },
      { src: "/images/3860c3ed-d503-4eda-8c9f-f74bbab5eaeb.png", alt: "PlayOn", className: "h-7" },
      { src: "/images/b8f19173-4547-4d54-bb16-b241249d6af8.png", alt: "GoFan", className: "h-7" },
    ],
  },
];

// ── Resume-only content ──────────────────────────────────────────────────────

export const resume = {
  headline: "Solutions engineering · Deals & PE · Enterprise AI",
  summary: [
    "Understanding how a business works is the part I enjoy most. Building something that makes it work better is a very close second.",
    "Over 16 years that has meant analytics for Fortune 500 companies at Mu Sigma, leading deals analytics teams at PwC US on Fortune 100 carve-outs, IPOs and private equity transactions, and founding Xolution, a SaaS platform for post-deal financial reporting that I took from concept to paying customers. Today I am a Lead Solutions Engineer at Whitespace, a UK sovereign AI company, working directly with customers to prototype solutions and bring them to life on its Collective platform.",
  ],
  skills: [
    {
      label: "Solutions engineering",
      items:
        "Customer discovery, solution architecture, requirements, rapid prototyping, implementation and onboarding",
    },
    {
      label: "Finance & deals",
      items:
        "Carve-outs and divestitures, sell-side diligence, purchase price accounting, consolidation, adjusted EBITDA, FP&A, PE value creation",
    },
    {
      label: "Data & analytics",
      items: "SQL, statistical modelling, forecasting, segmentation, BI, Palantir Foundry, SAS, Hadoop/Hive, VBA",
    },
    {
      label: "Build & AI tools",
      items: "AI coding assistants, n8n, Gumloop, Bubble, Azure SQL, Vercel",
    },
  ],
  education: {
    school: "BMS Institute of Technology, VTU",
    degree: "Electrical and Electronics Engineering",
    years: "2006 – 2010",
  },
};

export const community = {
  name: "Belfast Builds AI",
  url: "https://belfastbuilds.ai",
  role: "Founder & co-host",
  body: [
    "What started as a landing page I built during a Claude Code event turned into 100+ people together for a night of live AI demos.",
    "That was the start of Belfast Builds AI, a meetup series bringing together people across Northern Ireland to build things, share experiences and learn from each other. No prizes or judging, just live demos of things people have actually built.",
  ],
  thumbnail: "/community/belfast-builds-ai.webp",
  photo: "/community/belfast-builds-ai-meetup.webp",
};
