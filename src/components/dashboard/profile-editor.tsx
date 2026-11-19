"use client";

import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input, Textarea } from "@/components/ui/field";
import { ImageUploadField } from "@/components/ui/image-upload";
import { updateProfileAction } from "@/app/actions/portfolio";
import type { ActionResult } from "@/lib/action-result";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function ProfileEditor({
  portfolio,
}: {
  portfolio: {
    id: string;
    title: string;
    headline: string;
    bio: string;
    location: string;
    email: string;
    phone: string;
    availability: string;
    avatarUrl: string | null;
    coverUrl: string | null;
  };
}) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.015] p-5">
      <ActionForm action={updateProfileAction as Action} noValidate>
        <input type="hidden" name="portfolioId" value={portfolio.id} />
        <Input label="Portfolio title" name="title" defaultValue={portfolio.title} required hint="Usually your name, or name + role." />
        <Input label="Headline" name="headline" defaultValue={portfolio.headline} maxLength={160} />
        <Textarea label="About" name="bio" defaultValue={portfolio.bio} rows={8} maxLength={1200} hint="Two or three paragraphs. Plain language." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Location" name="location" defaultValue={portfolio.location} placeholder="City, Country" />
          <Input label="Availability" name="availability" defaultValue={portfolio.availability} placeholder="Open to new roles" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Contact email" name="email" type="email" defaultValue={portfolio.email} placeholder="you@example.com" />
          <Input label="Phone" name="phone" defaultValue={portfolio.phone} placeholder="Optional" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField
            label="Profile image"
            name="avatarUrl"
            defaultValue={portfolio.avatarUrl ?? ""}
            hint="Square images work best in every template."
          />
          <ImageUploadField
            label="Cover image"
            name="coverUrl"
            defaultValue={portfolio.coverUrl ?? ""}
            aspect="cover"
            hint="Used on templates that support a cover."
          />
        </div>
        <div className="flex justify-end border-t border-line pt-4">
          <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
