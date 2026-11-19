import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { getPublishedPortfolio } from "@/lib/queries";
import { toPortfolioView, type PortfolioView } from "@/lib/portfolio-view";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { TemplateSignal } from "@/components/portfolio/template-signal";
import { TemplateMonograph } from "@/components/portfolio/template-monograph";
import { TemplateAtlas } from "@/components/portfolio/template-atlas";
import { TemplateTerminal } from "@/components/portfolio/template-terminal";
import { DEFAULT_SECTIONS } from "@/lib/domain";
import { createAccount, db, resetDatabase, resetRequest } from "./support/fixtures";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

/** Build a realistic published portfolio backed by the database. */
async function publishedView(overrides: Record<string, string> = {}): Promise<PortfolioView> {
  const { portfolio } = await createAccount({
    email: "maker@example.com",
    name: "Israel Kolawole",
    published: true,
    sections: DEFAULT_SECTIONS,
  });

  await db.portfolio.update({
    where: { id: portfolio.id },
    data: {
      title: "Israel Kolawole — AI Engineer",
      headline: "Applied AI for geoscience and operations teams",
      bio: "I build retrieval and document-intelligence systems for subsurface data.",
      location: "Ibadan, Nigeria",
      email: "hello@example.com",
      ...overrides,
    },
  });

  await db.project.create({
    data: {
      portfolioId: portfolio.id,
      slug: "petrolens",
      name: "PetroLens",
      tagline: "Subsurface document intelligence",
      description: "Reads well reports and answers questions with citations.",
      category: "geoscience",
      status: "live",
      progress: 80,
      stack: JSON.stringify(["FastAPI", "Gemini"]),
      features: JSON.stringify(["Citation-linked answers"]),
      published: true,
      featured: true,
      sortOrder: 0,
    },
  });

  await db.project.create({
    data: {
      portfolioId: portfolio.id,
      slug: "bado",
      name: "BADO",
      tagline: "Offline-first asset documentation",
      category: "geoscience",
      status: "in-development",
      progress: 35,
      published: true,
      sortOrder: 1,
    },
  });

  return toPortfolioView((await getPublishedPortfolio(portfolio.slug))!);
}

function render(view: PortfolioView): string {
  return renderToStaticMarkup(createElement(PortfolioRenderer, { view }));
}

describe("public portfolio rendering", () => {
  it("renders every shipped template without throwing", async () => {
    const view = await publishedView();
    for (const template of ["signal", "monograph", "atlas", "terminal"]) {
      const html = render({ ...view, template });
      expect(html.length).toBeGreaterThan(2000);
      expect(html).toContain("Israel Kolawole");
    }
  });

  it("shows real project content and its honest status", async () => {
    const view = await publishedView();
    const html = render({ ...view, template: "atlas" });

    expect(html).toContain("PetroLens");
    expect(html).toContain("Subsurface document intelligence");
    expect(html).toContain("BADO");
    expect(html.toUpperCase()).toContain("IN DEVELOPMENT");
    expect(html).toContain("35");
    expect(html).not.toContain("Testimonial");
  });

  it("omits sections the owner hid, without relying on CSS", async () => {
    const hidden = DEFAULT_SECTIONS.map((section) =>
      section.id === "contact" || section.id === "about" ? { ...section, visible: false } : section,
    );
    const { portfolio } = await createAccount({
      email: "hidden@example.com",
      name: "Hidden Person",
      published: true,
      sections: hidden,
    });
    await db.portfolio.update({
      where: { id: portfolio.id },
      data: { title: "Hidden Person", bio: "A bio that should not be rendered anywhere." },
    });

    const view = toPortfolioView((await getPublishedPortfolio(portfolio.slug))!);
    const html = render({ ...view, template: "signal" });

    expect(view.sections.find((section) => section.id === "contact")?.visible).toBe(false);
    expect(view.email).toBe("");
    expect(html).not.toContain("A bio that should not be rendered anywhere.");
  });

  it("wires the template choice through the renderer", async () => {
    const view = await publishedView();
    const components = [TemplateSignal, TemplateMonograph, TemplateAtlas, TemplateTerminal];
    for (const Template of components) {
      const direct = renderToStaticMarkup(createElement(Template, { view }));
      const html = render({ ...view, template: view.template });
      expect(direct.length).toBeGreaterThan(2000);
      expect(html).toContain("PetroLens");
    }
  });

  it("renders an unpublished portfolio's data only for the dashboard preview", async () => {
    const view = await publishedView();
    const publicHtml = render(view);
    expect(publicHtml).toContain("PetroLens");

    // Unpublished drafts must not resolve through the public query at all.
    const draft = await db.portfolio.findFirst({ where: { slug: view.slug } });
    await db.portfolio.update({ where: { id: draft!.id }, data: { published: false } });
    expect(await getPublishedPortfolio(view.slug)).toBeNull();
  });

  it("escapes user text instead of injecting markup", async () => {
    const view = await publishedView({ headline: '<script>alert("xss")</script>' });
    const html = render({ ...view, template: "signal" });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });
});
