"use client";

import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/field";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/domain";
export interface EditableProject {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  progress: number | null;
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  stack: string;
  features: string;
  problem: string;
  contribution: string;
  architecture: string;
  featured: boolean;
  published: boolean;
}
import type { ActionResult } from "@/lib/action-result";
import { saveProjectAction } from "@/app/actions/portfolio";
import { useState } from "react";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function ProjectForm({ project, portfolioId }: { project?: EditableProject; portfolioId: string }) {
  const [status, setStatus] = useState(project?.status ?? "in-development");

  return (
    <ActionForm action={saveProjectAction as Action} noValidate>
      <input type="hidden" name="portfolioId" value={portfolioId} />
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Project name" name="name" defaultValue={project?.name ?? ""} required />
        <Input
          label="URL slug"
          name="slug"
          defaultValue={project?.slug ?? ""}
          placeholder="auto-generated from the name"
          hint="Used at /projects/… on your public page."
        />
      </div>

      <Input
        label="One-line description"
        name="tagline"
        defaultValue={project?.tagline ?? ""}
        maxLength={160}
        placeholder="What it does, for whom, in one line."
      />

      <Textarea
        label="Description"
        name="description"
        defaultValue={project?.description ?? ""}
        rows={4}
        maxLength={3000}
        placeholder="What it is, what it does, and the current state of the work."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Select label="Category" name="category" defaultValue={project?.category ?? "web-applications"}>
          {PROJECT_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </Select>
        <Select label="Status" name="status" defaultValue={project?.status ?? "in-development"} onChange={(event) => setStatus(event.target.value)}>
          {PROJECT_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </Select>
        <Input
          label="Progress (%)"
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={project?.progress ?? ""}
          placeholder="optional"
          hint="Only if you can state it."
        />
      </div>

      {["in-development", "experimental", "planned"].includes(status) && (
        <p className="rounded-lg border border-sand/25 bg-sand/[0.06] px-3 py-2 text-[11.5px] leading-relaxed text-sand/90">
          This status is shown publicly as work in progress. Visitors are warned that features may be incomplete.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Repository URL" name="repoUrl" type="url" defaultValue={project?.repoUrl ?? ""} placeholder="https://github.com/…" />
        <Input label="Live demo URL" name="demoUrl" type="url" defaultValue={project?.demoUrl ?? ""} placeholder="https://…" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Image URL"
          name="imageUrl"
          defaultValue={project?.imageUrl ?? ""}
          placeholder="/uploads/… or https://…"
          hint="Leave empty for a generated monogram plate."
        />
        <Input
          label="Technology stack"
          name="stack"
          defaultValue={project ? JSON.parse(project.stack || "[]").join(", ") : ""}
          placeholder="Python, FastAPI, PostgreSQL"
          hint="Comma separated."
        />
      </div>

      <Textarea
        label="Key features"
        name="features"
        defaultValue={project ? JSON.parse(project.features || "[]").join("\n") : ""}
        rows={4}
        placeholder={"One feature per line\nAnother feature"}
      />

      <Textarea label="The problem" name="problem" defaultValue={project?.problem ?? ""} rows={3} placeholder="What problem does this solve, specifically?" />
      <Textarea label="Your contribution" name="contribution" defaultValue={project?.contribution ?? ""} rows={3} placeholder="What did you personally design, build or lead?" />
      <Textarea label="Architecture" name="architecture" defaultValue={project?.architecture ?? ""} rows={3} placeholder="How the pieces fit together." />

      <div className="space-y-3 rounded-lg border border-line bg-white/[0.02] p-4">
        <Checkbox label="Feature on my portfolio" name="featured" defaultChecked={project?.featured ?? false} />
        <Checkbox label="Visible on my public page" name="published" defaultChecked={project?.published ?? true} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <SubmitButton pendingLabel="Saving…">{project ? "Save changes" : "Create project"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
