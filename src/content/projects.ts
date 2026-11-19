import type { ProjectCategory, ProjectStatus } from "@/lib/domain";

/**
 * Curated project records for the owner's portfolio.
 *
 * Read from the public repositories at github.com/israeli-dev (README, topics,
 * package manifests and screenshots). Statuses reflect what each repository
 * actually documents — no project is described as finished unless it is.
 */

export interface ProjectSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  progress?: number | null;
  repoName: string;
  repoUrl: string;
  demoUrl?: string | null;
  imageUrl?: string | null;
  gallery?: { url: string; alt: string }[];
  stack: string[];
  features: string[];
  problem: string;
  contribution: string;
  architecture: string;
  featured: boolean;
  published: boolean;
  language: string;
  stars: number;
  forks: number;
  lastPushedAt: string;
  sortOrder: number;
}

export const PROJECTS: ProjectSeed[] = [
  {
    slug: "petrolens",
    name: "PetroLens",
    tagline: "A petroleum geoscience report in, a commercial verdict out.",
    description:
      "PetroLens reads a petroleum geoscience report — well report, field study or lab dataset — extracts the reservoir parameters, scores commercial viability and Chance of Success, and returns an investor-grade DEVELOP / APPRAISE / REJECT recommendation with a downloadable executive PDF.",
    category: "geoscience",
    status: "live",
    progress: null,
    repoName: "geoscience-doc-copilot",
    repoUrl: "https://github.com/israeli-dev/geoscience-doc-copilot",
    demoUrl: "https://geoscience-doc-copilot-5t3ani8cv8yuuqmqtgzhaq.streamlit.app/",
    imageUrl: "/projects/petrolens-1.png",
    gallery: [
      { url: "/projects/petrolens-2.png", alt: "PetroLens parameter extraction and risk factor panel" },
      { url: "/projects/petrolens-3.png", alt: "PetroLens rejection verdict for a non-commercial report" },
    ],
    stack: ["Python", "FastAPI", "Streamlit", "Gemini API", "Pydantic", "Plotly", "ReportLab", "Docker"],
    features: [
      "Viability and POSg gauges computed from extracted parameters",
      "Strict Pydantic-validated JSON response from the FastAPI service",
      "Executive PDF export sized for an investor pack",
      "Domain-specific petroleum prompt: Niger Delta, Agbada/Akata, source-rock maturity",
      "Rejects non-commercial documents instead of scoring every reservoir highly",
    ],
    problem:
      "Evaluating a prospect means reading 40–80 pages of reports to answer one question: is this commercial? Generic PDF summarisers fail here — they summarise rather than evaluate, and they happily assign a high score to an unrelated water-dam report.",
    contribution:
      "Designed and built the full application: prompt design and scoring rubric, FastAPI service, Pydantic schemas, Streamlit executive dashboard, PDF generation and Docker deployment.",
    architecture:
      "Streamlit dashboard → FastAPI `POST /api/upload-report` → document parsing → Gemini structured-output pass → Pydantic validation → scored dashboard and ReportLab PDF. The API is deployed separately from the frontend so the evaluation logic can serve other clients.",
    featured: true,
    published: true,
    language: "Python",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-10-11T15:26:57Z",
    sortOrder: 0,
  },
  {
    slug: "bado",
    name: "BADO",
    tagline: "Document before covering. Check before digging.",
    description:
      "An offline-first infrastructure documentation, asset management and GIS awareness platform for universities. Field technicians register buried assets with GPS accuracy and burial depth, supervisors verify them, and the record survives before anyone breaks ground. Phases 1–2 are implemented; phases 3–9 are documented and in progress.",
    category: "geoscience",
    status: "in-development",
    progress: 22,
    repoName: "BADO",
    repoUrl: "https://github.com/israeli-dev/BADO",
    demoUrl: "https://bado-seven.vercel.app",
    imageUrl: null,
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "PostgreSQL + PostGIS", "Leaflet", "Dexie", "Zod"],
    features: [
      "PostGIS-backed campuses, assets and survey benchmarks (EPSG:4326 + GIST indexes)",
      "Five roles with multi-institution isolation and forced row-level security",
      "Offline queue in IndexedDB with idempotent sync ledger",
      "GPS asset registration with manual pin adjustment tracking",
      "Supervisor verification workflow with immutable history and soft archival",
      "Live admin console for campuses, departments, roles and audit logs",
    ],
    problem:
      "Buried utilities on Nigerian campuses are undocumented and re-discovered by breaking them. Paper and spreadsheets cannot carry coordinates, burial depth, verification status and photographs into the field where there is no signal.",
    contribution:
      "Product design, schema and RLS design, frontend architecture, offline outbox, verification workflow and the demo data gateway used for training and automated tests.",
    architecture:
      "React 19 + Vite SPA with TanStack Query and Dexie for offline capture. Supabase provides Postgres/PostGIS, auth and storage; the data gateway is abstracted so a clearly labelled local demo gateway can replace it for training. RLS enforces institution scoping in the database, not the client.",
    featured: true,
    published: true,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-11-19T16:37:36Z",
    sortOrder: 1,
  },
  {
    slug: "kings-body-empire",
    name: "Kings Body Empire",
    tagline: "A coaching business, not a brochure.",
    description:
      "A fitness coaching platform: daily training, food and measurement logging, a Bronze→Diamond consistency rank, one-to-one call booking, paid coaching programmes and e-books through Paystack, home-visit consultations and an education video library.",
    category: "web-applications",
    status: "live",
    progress: null,
    repoName: "kings-body-empire",
    repoUrl: "https://github.com/israeli-dev/kings-body-empire",
    demoUrl: "https://kings-body-empire.vercel.app",
    imageUrl: null,
    stack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "NextAuth", "Paystack"],
    features: [
      "Credential auth with single-use hashed password-reset tokens",
      "Training, nutrition and measurement logging with streaks",
      "Consistency rank engine (Bronze, Silver, Gold, Diamond)",
      "Race-safe call-slot booking that frees cancelled slots",
      "Idempotent Paystack checkout with webhook confirmation",
      "Admin console for revenue, purchases, e-books, lessons and roles",
    ],
    problem:
      "Independent coaches sell through DMs and spreadsheets. Clients lose their logs, bookings collide and payment confirmation depends on a screenshot.",
    contribution:
      "End-to-end build: data model and Prisma migrations, auth and reset flows, rank engine, booking concurrency handling, Paystack integration and admin tooling.",
    architecture:
      "Next.js App Router with server-side session checks, Prisma over PostgreSQL, NextAuth credentials provider, Paystack transaction initialise → browser callback → webhook. 150 unit and flow tests plus typecheck in CI.",
    featured: true,
    published: true,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-11-13T23:14:25Z",
    sortOrder: 2,
  },
  {
    slug: "space-story",
    name: "Abandoned but Not Forgotten",
    tagline: "Every marker on the globe is a documented place.",
    description:
      "An interactive planetary atlas built for the NASA Space Apps Challenge. Orbit a textured Earth, Moon, Mars or Venus and open 99 sourced records of launch sites, landing sites, rovers and the equipment left behind — with nothing on the globe invented.",
    category: "web-applications",
    status: "live",
    progress: null,
    repoName: "Space_story",
    repoUrl: "https://github.com/israeli-dev/Space_story",
    demoUrl: "https://space-story-nine.vercel.app",
    imageUrl: null,
    stack: ["TypeScript", "React", "Three.js", "Vite", "Node.js", "GitHub Actions"],
    features: [
      "Camera-orbit globe where markers never drift off their coordinates",
      "99 records across four bodies, each with published sources",
      "Category legend that doubles as a filter, plus a year-range histogram",
      "Keyboard search across names, missions and keywords",
      "Sentence-by-sentence narration of the verified text",
      "Shareable URL hash for any site and body",
    ],
    problem:
      "Space storytelling tends to trade accuracy for spectacle. Here the constraint was inverted: no coordinate, date or artefact may be shown unless a published agency source supports it.",
    contribution:
      "Data model and ingestion pipeline for the curated and ingested datasets, globe interaction, filtering, narration and the deployment workflow.",
    architecture:
      "Vite + React + Three.js frontend, with a Node data pipeline that normalises NSSDCA, GISS and NASA imagery sources into a validated dataset built at deploy time. GitHub Actions publishes the built site.",
    featured: true,
    published: true,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-11-06T12:54:24Z",
    sortOrder: 3,
  },
  {
    slug: "iszyodds",
    name: "Iszyodds",
    tagline: "A prediction engine that refuses to invent statistics.",
    description:
      "A fixture-bound football analysis tool. Every prediction is tied to a real fixture and a data snapshot; in strict mode the LLM never supplies statistics, and missing data is reported as missing rather than filled with plausible numbers.",
    category: "data-science",
    status: "in-development",
    progress: null,
    repoName: "Iszyodds",
    repoUrl: "https://github.com/israeli-dev/Iszyodds",
    demoUrl: null,
    imageUrl: null,
    stack: ["Python", "Streamlit", "API-Football", "Groq", "Ollama", "NumPy"],
    features: [
      "Strict mode: genuine API data only, otherwise the match is flagged and staked at 0%",
      "Fixture binding with UTC and Africa/Lagos kickoff times",
      "Anti-leakage backtesting that only uses pre-kickoff information",
      "Data-quality ranking ahead of model confidence",
      "Venue-specific form blend with explicit weights",
    ],
    problem:
      "Most football 'AI' tools publish confident numbers with no provenance. The interesting engineering problem is integrity: proving what data existed at prediction time, and what happened when it did not.",
    contribution:
      "Model logic, data-integrity rules, backtesting harness and the Streamlit interface.",
    architecture:
      "Streamlit multipage app; API-Football provides fixtures and per-match statistics, with an LLM limited to explanations in strict mode. Prediction history is persisted with model version, data sources and snapshots so a backtest can be audited.",
    featured: false,
    published: true,
    language: "Python",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-11-04T21:29:59Z",
    sortOrder: 4,
  },
  {
    slug: "auraquote",
    name: "AuraQuote",
    tagline: "A motivational card that connects your work to something you love.",
    description:
      "Enter a role and a hobby, choose a tone, and Gemini writes a short quote and reflection. Style the card, save a browser-local library, and export square, story or banner PNGs or a print-ready PDF.",
    category: "ai-llm",
    status: "in-development",
    progress: null,
    repoName: "Motivitamine",
    repoUrl: "https://github.com/israeli-dev/Motivitamine",
    demoUrl: null,
    imageUrl: null,
    stack: ["TypeScript", "React", "Vite", "Express", "Gemini API", "Tailwind CSS", "Playwright"],
    features: [
      "Server-side Gemini calls — the API key never reaches the browser",
      "Rejects a repeat of the quote currently on the canvas",
      "Fifteen curated card styles with three export formats",
      "Per-IP and per-process rate limits with provider-call concurrency caps",
      "Privacy-conscious: the display name is applied client-side only",
    ],
    problem:
      "Generic quote apps generate filler. This one asks for a specific job and a specific hobby and demands a real connection between them, while keeping the provider key and rate limits on the server.",
    contribution:
      "Full application: prompt and structured-output handling, Express API, rate limiting, card renderer and image export.",
    architecture:
      "Vite + React client and an Express server in the same repository, sharing a quote schema. Gemini is called server-side with Zod-style output validation, and the image export happens in-browser via html-to-image.",
    featured: false,
    published: true,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-11-19T15:51:21Z",
    sortOrder: 5,
  },
  {
    slug: "folio-platform",
    name: "Folio",
    tagline: "The platform this portfolio runs on.",
    description:
      "A multi-tenant portfolio builder: secure accounts, a guided builder, four genuinely different templates, GitHub repository synchronisation and published portfolio pages with real SEO metadata. This site is its first tenant.",
    category: "developer-tools",
    status: "in-development",
    progress: 65,
    repoName: "dev-portfolio",
    repoUrl: "https://github.com/israeli-dev/dev-portfolio",
    demoUrl: null,
    imageUrl: null,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "SQLite/PostgreSQL", "Vitest"],
    features: [
      "Session auth with hashed tokens, password reset and rate limits",
      "Ten-step builder from profession preset to published URL",
      "Four layout engines with independent typography and structure",
      "GitHub sync with ETag revalidation and explicit rate-limit handling",
      "Server-enforced ownership on every mutation",
    ],
    problem:
      "Portfolio builders produce identical sites. The design constraint here was that templates must differ structurally, and GitHub data must be curated rather than dumped.",
    contribution:
      "Product design, architecture, schema, authentication, template engines, GitHub integration, tests and documentation.",
    architecture:
      "Next.js App Router with server actions, Prisma data layer, session cookies with SHA-256 token hashes, Zod validation at every boundary and a pure domain layer for template, status and permission logic.",
    featured: false,
    published: true,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    lastPushedAt: new Date().toISOString(),
    sortOrder: 6,
  },
  {
    slug: "llm-product-engineer",
    name: "LLM Engineer Foundations",
    tagline: "The exercises behind the applications.",
    description:
      "A working log of the foundations I am building as I move into LLM product engineering: Python fundamentals, typed functions, error handling and small CLI tools — kept public so progress is visible rather than claimed.",
    category: "experimental",
    status: "in-development",
    progress: null,
    repoName: "llm-product-engineer",
    repoUrl: "https://github.com/israeli-dev/llm-product-engineer",
    demoUrl: null,
    imageUrl: null,
    stack: ["Python"],
    features: [
      "Small, self-contained Python exercises",
      "Error handling and input validation practice",
      "A public record of deliberate practice",
    ],
    problem:
      "Learning in private makes it impossible to judge progress honestly. Publishing the foundations keeps the work accountable.",
    contribution: "Author.",
    architecture: "Plain Python modules, no framework, one folder per exercise.",
    featured: false,
    published: true,
    language: "Python",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-09-08T21:04:45Z",
    sortOrder: 7,
  },
  {
    slug: "phase-1-python-projects",
    name: "Phase 1 Python Projects",
    tagline: "Where the programming started.",
    description:
      "Two beginner Python tools: a dictionary-to-JSON converter with a small interactive CLI, and a logic-driven food suggestion chatbot. Kept as an honest record of the starting point.",
    category: "experimental",
    status: "completed",
    progress: null,
    repoName: "phase1-portfolio",
    repoUrl: "https://github.com/israeli-dev/phase1-portfolio",
    demoUrl: null,
    imageUrl: null,
    stack: ["Python"],
    features: ["Dictionary ↔ JSON conversion", "Interactive CLI prompts", "Rule-based chatbot logic"],
    problem: "First exercises in program structure, file I/O and branching logic.",
    contribution: "Author.",
    architecture: "Two standalone Python scripts with sample data.",
    featured: false,
    published: true,
    language: "Python",
    stars: 0,
    forks: 0,
    lastPushedAt: "2026-08-24T18:19:04Z",
    sortOrder: 8,
  },
];
