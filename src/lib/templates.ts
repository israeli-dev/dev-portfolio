/**
 * Template registry.
 *
 * Four genuinely distinct layout engines are paired with profession presets.
 * A preset changes layout structure, typography and palette together — it is
 * not a recolour of one template. Preview data lives in `previewData`.
 */

export type TemplateId = "signal" | "monograph" | "atlas" | "terminal";
export type Appearance = "dark" | "light";
export type FontStyle = "sans" | "serif" | "mono";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  layout: string;
  bestFor: string[];
  defaultAccent: string;
  defaultAppearance: Appearance;
  defaultFont: FontStyle;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "signal",
    name: "Signal",
    description: "Dark, engineering-first layout with a pinned sidebar and dense, scannable project rows.",
    layout: "Sticky identity rail + content stream",
    bestFor: ["Engineers", "AI builders", "Developer advocates"],
    defaultAccent: "#7DD3C0",
    defaultAppearance: "dark",
    defaultFont: "sans",
  },
  {
    id: "monograph",
    name: "Monograph",
    description: "Editorial, print-inspired page with a serif display, generous margins and a two-column record.",
    layout: "Editorial masthead + magazine columns",
    bestFor: ["Researchers", "Writers", "Academics", "Designers"],
    defaultAccent: "#B4763A",
    defaultAppearance: "light",
    defaultFont: "serif",
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Scientific field-notebook layout: split hero, annotated data blocks and a coordinate rule.",
    layout: "Split field plate + annotated sections",
    bestFor: ["Geoscientists", "Engineers", "Analysts"],
    defaultAccent: "#E0A458",
    defaultAppearance: "dark",
    defaultFont: "sans",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Monospaced, high-contrast index with numbered lines and a compact command-line header.",
    layout: "Numbered index + mono typography",
    bestFor: ["Developers", "DevOps", "Security engineers"],
    defaultAccent: "#9FE870",
    defaultAppearance: "dark",
    defaultFont: "mono",
  },
];

export function templateById(id: string): TemplateDefinition {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];
}

export interface ProfessionPreset {
  id: string;
  label: string;
  group: "Technology" | "Business" | "Academic & Research" | "Creative" | "Engineering & Industry";
  template: TemplateId;
  accent: string;
  appearance: Appearance;
  font: FontStyle;
  headline: string;
  bio: string;
  skills: string[];
  /** Optional second sample role, keeps previews feeling populated. */
  sampleProject: { name: string; tagline: string };
}

const preset = (
  id: string,
  label: string,
  group: ProfessionPreset["group"],
  template: TemplateId,
  accent: string,
  appearance: Appearance,
  font: FontStyle,
  headline: string,
  bio: string,
  skills: string[],
  sampleProject: { name: string; tagline: string },
): ProfessionPreset => ({ id, label, group, template, accent, appearance, font, headline, bio, skills, sampleProject });

export const PROFESSION_PRESETS: ProfessionPreset[] = [
  preset("software-developer", "Software Developer", "Technology", "terminal", "#9FE870", "dark", "mono",
    "Software developer building reliable, well-tested web products.",
    "I design and ship full-stack applications with an emphasis on clear architecture, typed boundaries and maintainable code. I care about the unglamorous parts: error states, accessibility and tests.",
    ["TypeScript", "React", "Node.js", "PostgreSQL", "Testing", "CI/CD"],
    { name: "Release Radar", tagline: "Deployment dashboard for small engineering teams." }),
  preset("ai-engineer", "AI Engineer", "Technology", "signal", "#7DD3C0", "dark", "sans",
    "AI engineer building LLM applications that hold up in production.",
    "I build retrieval-augmented applications, evaluation harnesses and API-driven agents. My focus is on grounding, guardrails and measurable behaviour rather than demos that only work once.",
    ["Python", "LLM applications", "RAG", "FastAPI", "Prompt engineering", "Evaluation"],
    { name: "Grounded Docs", tagline: "Retrieval-augmented assistant with citations for technical PDFs." }),
  preset("data-scientist", "Data Scientist", "Technology", "signal", "#8CB4FF", "dark", "sans",
    "Data scientist turning messy datasets into defensible decisions.",
    "I work end-to-end: framing the question, cleaning the data, validating the model honestly and communicating what the numbers can and cannot support.",
    ["Python", "pandas", "scikit-learn", "SQL", "Statistics", "Visualisation"],
    { name: "Churn Signals", tagline: "Explainable churn model with cohort-level drivers." }),
  preset("data-analyst", "Data Analyst", "Technology", "monograph", "#3F6E5A", "light", "serif",
    "Data analyst who makes reporting legible to the people using it.",
    "I build dashboards and analyses that answer specific operational questions, with definitions documented so the numbers stay trustworthy over time.",
    ["SQL", "Excel", "Power BI", "Data modelling", "Storytelling", "Python"],
    { name: "Operations Digest", tagline: "Weekly operating review with tracked definitions." }),
  preset("ux-designer", "UX/UI Designer", "Technology", "monograph", "#9B4D8E", "light", "sans",
    "Product designer focused on interfaces people can actually use.",
    "I research, prototype and test. My work balances visual craft with the constraints of real engineering teams and real users.",
    ["Figma", "User research", "Prototyping", "Design systems", "Accessibility", "Usability testing"],
    { name: "Transit Wayfinding", tagline: "A clearer journey-planning flow for first-time riders." }),
  preset("product-designer", "Product Designer", "Technology", "monograph", "#C05A3C", "light", "sans",
    "Product designer connecting business goals to usable interfaces.",
    "I take products from ambiguous problem to shipped flow, working closely with engineers and stakeholders to keep the design honest.",
    ["Product strategy", "Figma", "Design systems", "Prototyping", "User testing", "Analytics"],
    { name: "Onboarding Rebuild", tagline: "Cut activation drop-off by redesigning the first-run flow." }),
  preset("cybersecurity", "Cybersecurity Professional", "Technology", "terminal", "#FF7A6B", "dark", "mono",
    "Security engineer specialising in defensive engineering and threat detection.",
    "I harden systems, review code for real risk, and build detection that produces signal instead of noise. I document findings so teams can act on them.",
    ["Threat modelling", "Linux", "Network security", "Python", "SIEM", "Incident response"],
    { name: "Detection Lab", tagline: "Reproducible attack-and-detect scenarios for blue teams." }),
  preset("devops", "DevOps Engineer", "Technology", "terminal", "#6FC7E8", "dark", "mono",
    "DevOps engineer making delivery boring, repeatable and observable.",
    "I build pipelines, infrastructure as code and monitoring that give teams confidence to deploy on a Friday afternoon.",
    ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "Observability", "Linux"],
    { name: "Golden Path", tagline: "One-command service scaffolding with built-in instrumentation." }),
  preset("business-analyst", "Business Analyst", "Business", "monograph", "#3D5A80", "light", "serif",
    "Business analyst translating operations into requirements teams can build.",
    "I map processes, quantify the cost of friction and write requirements precise enough to test and flexible enough to survive contact with reality.",
    ["Requirements", "Process mapping", "SQL", "Stakeholder management", "Documentation", "Power BI"],
    { name: "Order Flow Review", tagline: "Process analysis of a fulfilment bottleneck." }),
  preset("consultant", "Consultant", "Business", "monograph", "#7A5C3E", "light", "serif",
    "Consultant helping teams make difficult decisions with clearer evidence.",
    "I structure ambiguous problems, interview the people closest to the work, and deliver recommendations with the assumptions made explicit.",
    ["Problem structuring", "Research", "Financial analysis", "Communication", "Excel", "Presentation"],
    { name: "Market Entry Brief", tagline: "Evidence-led assessment of an adjacent segment." }),
  preset("entrepreneur", "Entrepreneur", "Business", "signal", "#E0A458", "dark", "sans",
    "Founder building small products for specific, underserved problems.",
    "I ship early, talk to users constantly, and keep costs low enough to keep learning. Everything I present here is work I have actually done.",
    ["Product", "Go-to-market", "Customer research", "Operations", "Analytics", "Fundraising"],
    { name: "Local Ledger", tagline: "Bookkeeping for solo service businesses." }),
  preset("marketing", "Marketing Professional", "Business", "monograph", "#B1443C", "light", "sans",
    "Marketing lead focused on clear positioning and measurable demand.",
    "I build messaging from customer language, run experiments with honest measurement, and report results including the ones that did not work.",
    ["Positioning", "SEO", "Content", "Email", "Analytics", "Paid acquisition"],
    { name: "Lifecycle Programme", tagline: "Email sequences mapped to real activation moments." }),
  preset("project-manager", "Project Manager", "Business", "atlas", "#5F8A6E", "light", "sans",
    "Project manager who keeps complex delivery visible and calm.",
    "I plan around dependencies and risk, communicate status without spin, and create the conditions for teams to do focused work.",
    ["Planning", "Risk management", "Agile", "Stakeholder comms", "Budgeting", "Jira"],
    { name: "Cross-Team Rollout", tagline: "Coordinated release across three dependent teams." }),
  preset("researcher", "Researcher", "Academic & Research", "monograph", "#2F4A6D", "light", "serif",
    "Researcher working at the intersection of data, method and interpretation.",
    "My research interests sit where quantitative evidence meets real-world systems. I publish methods, limitations and data alongside findings.",
    ["Research design", "Python", "Statistics", "Academic writing", "Literature review", "Peer review"],
    { name: "Reservoir Study", tagline: "Comparative analysis of subsurface data quality." }),
  preset("lecturer", "Lecturer", "Academic & Research", "monograph", "#6B4A2F", "light", "serif",
    "Lecturer teaching applied science with an emphasis on practice.",
    "I teach the reasoning behind the method, not just the steps, and build course material that students can use after the term ends.",
    ["Curriculum design", "Geology", "Field methods", "Assessment", "Mentoring", "Public speaking"],
    { name: "Field Methods Course", tagline: "Practical groundwater and mapping coursework." }),
  preset("graduate-student", "Graduate Student", "Academic & Research", "atlas", "#4B7C8C", "light", "serif",
    "Graduate researcher studying earth systems with computational methods.",
    "I combine field observation with data analysis, and I am deliberate about distinguishing measured results from interpretation.",
    ["GIS", "Python", "Remote sensing", "Fieldwork", "Data analysis", "Scientific writing"],
    { name: "Basin Mapping", tagline: "Spatial analysis of lineament density." }),
  preset("scientist", "Scientist", "Academic & Research", "atlas", "#3E7C6A", "light", "sans",
    "Scientist turning observations into reproducible, useful evidence.",
    "I design experiments carefully, document methods openly and report uncertainty rather than hiding it.",
    ["Experimental design", "Data analysis", "R", "Python", "Lab methods", "Scientific writing"],
    { name: "Water Quality Atlas", tagline: "Open dataset of sampled groundwater parameters." }),
  preset("photographer", "Photographer", "Creative", "monograph", "#8A6A4F", "dark", "serif",
    "Photographer documenting landscape, industry and the people in between.",
    "I work on long-form documentary projects, editing for narrative before spectacle. Selected series and print enquiries are listed below.",
    ["Documentary", "Editing", "Lightroom", "Studio lighting", "Colour grading", "Direction"],
    { name: "Dry Season", tagline: "A long-form series on water access in the savannah." }),
  preset("graphic-designer", "Graphic Designer", "Creative", "monograph", "#C2472F", "light", "sans",
    "Graphic designer building identities that survive contact with reality.",
    "I create visual systems — type, colour, grid and voice — that stay coherent across print, packaging and screens.",
    ["Identity design", "Typography", "Illustrator", "Figma", "Art direction", "Print production"],
    { name: "Studio Identity", tagline: "A flexible mark system for an architecture practice." }),
  preset("writer", "Writer", "Creative", "monograph", "#3C3C3C", "light", "serif",
    "Writer on technology, place and the people building both.",
    "I write reported essays and technical narrative, with drafts and published work catalogued here.",
    ["Essay writing", "Reporting", "Editing", "Interviews", "Technical writing", "Research"],
    { name: "Field Notes", tagline: "Essays from a year of fieldwork and software." }),
  preset("video-creator", "Video Creator", "Creative", "signal", "#D96B4C", "dark", "sans",
    "Video creator making documentary and technical explainers.",
    "I handle the full pipeline: story, shot list, sound and edit. No stock footage passing as original work.",
    ["Storyboarding", "Cinematography", "Premiere Pro", "Sound design", "Colour", "Directing"],
    { name: "Built in Public", tagline: "Short documentary on independent builders." }),
  preset("geologist", "Geologist", "Engineering & Industry", "atlas", "#C08A4A", "dark", "sans",
    "Geologist working across field exploration, groundwater and subsurface interpretation.",
    "I combine field observation, geophysical interpretation and data analysis to characterise groundwater and subsurface systems — and increasingly build software that makes that analysis faster.",
    ["Geology", "Groundwater", "Geophysics", "GIS", "Field mapping", "Python"],
    { name: "Aquifer Assessment", tagline: "Groundwater potential mapping from field and geophysical data." }),
  preset("civil-engineer", "Civil Engineer", "Engineering & Industry", "atlas", "#5B7285", "light", "sans",
    "Civil engineer delivering infrastructure that behaves as designed.",
    "I work on site assessment, design coordination and construction verification, with documentation that holds up to review.",
    ["Structural analysis", "AutoCAD", "Site inspection", "Surveying", "Concrete design", "Project delivery"],
    { name: "Drainage Scheme", tagline: "Flood mitigation design for a campus catchment." }),
  preset("petroleum-engineer", "Petroleum Engineer", "Engineering & Industry", "atlas", "#8D5B2E", "dark", "sans",
    "Petroleum engineer focused on reservoir performance and commercial viability.",
    "I interpret well data, evaluate recovery scenarios and communicate risk in terms decision-makers can use.",
    ["Reservoir engineering", "Well testing", "Petrophysics", "Economics", "Python", "Technical reporting"],
    { name: "Prospect Evaluation", tagline: "Integrated subsurface assessment with risked volumes." }),
  preset("mechanical-engineer", "Mechanical Engineer", "Engineering & Industry", "atlas", "#4F6B78", "light", "sans",
    "Mechanical engineer designing systems that are serviceable, not just drawable.",
    "I work from requirements through CAD, tolerancing and testing, with maintainability treated as a design constraint.",
    ["SolidWorks", "Thermodynamics", "Manufacturing", "GD&T", "Testing", "Maintenance planning"],
    { name: "Pump Retrofit", tagline: "Efficiency retrofit for an ageing process pump." }),
  preset("electrical-engineer", "Electrical Engineer", "Engineering & Industry", "terminal", "#E2B33C", "dark", "mono",
    "Electrical engineer working on power distribution and control.",
    "I design, commission and troubleshoot electrical systems with safety margins and documentation that field teams can follow.",
    ["Power systems", "PLC", "AutoCAD Electrical", "Commissioning", "Safety standards", "Testing"],
    { name: "Distribution Upgrade", tagline: "Load study and protection coordination for a site expansion." }),
  preset("environmental-scientist", "Environmental Scientist", "Engineering & Industry", "atlas", "#4E7C59", "light", "sans",
    "Environmental scientist assessing impact with defensible field data.",
    "I design sampling programmes, analyse environmental data and write findings that separate measured effect from noise.",
    ["Environmental monitoring", "GIS", "Water quality", "Sampling design", "Impact assessment", "R"],
    { name: "Water Quality Atlas", tagline: "Baseline groundwater chemistry across a monitoring network." }),
];

export function presetByProfession(id: string): ProfessionPreset | undefined {
  return PROFESSION_PRESETS.find((item) => item.id === id);
}

export const ACCENT_SWATCHES = [
  "#7DD3C0",
  "#9FE870",
  "#E0A458",
  "#E27A6A",
  "#8CB4FF",
  "#C9A7EB",
  "#F0D060",
  "#5FBF8F",
  "#C08A4A",
  "#8A8F98",
];

/** Deterministic gradient used for projects without a screenshot. */
export function monogramGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const a = hash;
  const b = (hash + 48) % 360;
  return `linear-gradient(135deg, hsl(${a} 32% 16%), hsl(${b} 38% 26%))`;
}
