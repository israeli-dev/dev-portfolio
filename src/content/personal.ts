/**
 * Verified personal content.
 *
 * Every claim here is sourced from either (a) the owner's own brief, or
 * (b) the public GitHub repositories under github.com/israeli-dev.
 * Nothing is invented: no fictional employers, awards, clients or metrics.
 * Items the owner still needs to confirm (`needsOwnerInput`) are surfaced in
 * the admin checklist rather than rendered as fact on the public site.
 */

export const OWNER = {
  name: "Israel Kolawole",
  title: "AI Engineer · AI Application Developer · Geoscience",
  shortTitle: "AI Engineer & Geoscience",
  location: "Nigeria",
  email: "hello@israelkolawole.dev", // owner-editable; replace in /admin/profile
  github: "https://github.com/israeli-dev",
  githubUsername: "israeli-dev",
  linkedin: "", // not provided — the UI hides empty links rather than linking nowhere
  tagline:
    "I build AI applications that turn messy scientific data into decisions people can act on.",
  intro:
    "A geoscientist turned AI engineer. I pair field experience in groundwater and subsurface work with Python, LLM integration and modern web engineering to build software that solves a specific, real problem.",
  story: [
    "I started in geology — fieldwork, groundwater exploration, geophysical interpretation. That work teaches a particular kind of discipline: the data is incomplete, the conditions are not ideal, and the answer still has to be defensible. You learn to separate what a measurement shows from what you hope it shows.",
    "I am now building AI applications with that same standard. My work sits where LLMs meet scientific and commercial documents: extracting structure from a geoscience report, scoring a prospect, or turning a repository of public data into something a person can actually navigate. The models are a means — the deliverable is a decision someone can trust.",
    "I am early in this engineering journey and direct about it. What I can show is a body of working, deployed software: a petroleum-report copilot, a PostGIS asset platform for universities, a fitness coaching product, an interactive NASA data experience. Each one involved real API integration, real data modelling and real edge cases. I am looking for the next set of problems worth building for.",
  ],
  availability: "Open to AI engineering roles and applied research collaborations",
};

export interface TimelineSeed {
  year: string;
  title: string;
  detail: string;
  kind: "foundation" | "milestone" | "building";
  sortOrder: number;
}

export const TIMELINE: TimelineSeed[] = [
  {
    year: "Foundation",
    title: "Geology, and the field",
    detail:
      "Training and practice in groundwater exploration, geophysical interpretation and field operations — working with incomplete data where the conclusion still has to hold up.",
    kind: "foundation",
    sortOrder: 0,
  },
  {
    year: "Transition",
    title: "Into AI engineering",
    detail:
      "Python, API design and LLM integration, learned by building rather than by collecting certificates. From scripts to shipped applications.",
    kind: "milestone",
    sortOrder: 1,
  },
  {
    year: "Building",
    title: "Applications in production",
    detail:
      "PetroLens for geoscience report evaluation, BADO for campus infrastructure mapping, Kings Body Empire for coaching, and an interactive NASA exploration atlas — four deployed applications.",
    kind: "building",
    sortOrder: 2,
  },
  {
    year: "Now",
    title: "Building the platform itself",
    detail:
      "Designing and shipping Folio: a multi-tenant portfolio platform with real authentication, GitHub synchronisation and four distinct template engines.",
    kind: "building",
    sortOrder: 3,
  },
];

export const SKILL_GROUPS = [
  {
    name: "AI & LLM",
    skills: [
      { name: "LLM application development", learning: false },
      { name: "Prompt engineering", learning: false },
      { name: "AI API integration", learning: false },
      { name: "Retrieval-augmented generation", learning: true },
      { name: "Evaluation & grounding", learning: true },
    ],
  },
  {
    name: "Programming",
    skills: [
      { name: "Python", learning: false },
      { name: "TypeScript", learning: false },
      { name: "JavaScript", learning: false },
      { name: "SQL", learning: false },
    ],
  },
  {
    name: "Backend & data",
    skills: [
      { name: "FastAPI", learning: false },
      { name: "REST API design", learning: false },
      { name: "Node.js / Express", learning: false },
      { name: "Prisma ORM", learning: false },
      { name: "PostgreSQL / PostGIS", learning: false },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", learning: false },
      { name: "Next.js", learning: false },
      { name: "Streamlit", learning: false },
      { name: "Tailwind CSS", learning: false },
    ],
  },
  {
    name: "Tooling",
    skills: [
      { name: "Git & GitHub", learning: false },
      { name: "Docker", learning: false },
      { name: "Vite", learning: false },
      { name: "CI with GitHub Actions", learning: false },
    ],
  },
  {
    name: "Geoscience",
    skills: [
      { name: "Geology", learning: false },
      { name: "Groundwater exploration", learning: false },
      { name: "Geophysical interpretation", learning: false },
      { name: "Spatial data & GIS", learning: false },
    ],
  },
];

export const CURRENTLY_LEARNING = [
  { title: "Retrieval-augmented generation", detail: "Chunking strategy, hybrid retrieval and citation-grounded answers.", kind: "topic" },
  { title: "LLM evaluation", detail: "Building test sets that catch regressions instead of trusting demo runs.", kind: "topic" },
  { title: "Agentic workflows", detail: "Tool use and planning patterns with explicit failure handling.", kind: "topic" },
];

/**
 * One honest experience entry based on the owner's own statement of practical
 * geoscience experience. No employer, client or title is implied.
 */
export const EXPERIENCE = [
  {
    role: "Groundwater exploration & field geoscience",
    organization: "Independent field practice",
    startDate: "Ongoing",
    endDate: "",
    current: true,
    location: "Nigeria",
    summary:
      "Practical field experience in groundwater exploration, geophysical interpretation and field operations, applied alongside software work in geoscience data.",
    highlights: [
      "Groundwater exploration and site assessment",
      "Geophysical data interpretation",
      "Field operations and data collection",
    ],
    tech: ["Hydrogeology", "Geophysics", "Field mapping"],
  },
];

export const ACHIEVEMENTS = [
  {
    title: "Built 'Abandoned but Not Forgotten' for the NASA Space Apps Challenge",
    detail:
      "An interactive atlas of 99 documented exploration sites across four planetary bodies, with every coordinate traced to a published source.",
    year: "",
    kind: "hackathon",
  },
];

/** Items the admin checklist asks the owner to confirm. Never auto-published. */
export const NEEDS_OWNER_INPUT = [
  "Confirm your contact email (currently a placeholder in src/content/personal.ts)",
  "Add your degree, institution and graduation year in Education",
  "Add your LinkedIn URL",
  "Add dates to your geoscience experience entry",
  "Add any certifications, scholarships or publications you want shown",
];
