"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { actionError, actionOk, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { clientKey, pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mail";
import type { UserRow } from "@/lib/rows";

/**
 * Contact form handler.
 *
 * - Validates with Zod and enforces a honeypot.
 * - Persists every genuine message so nothing is lost when no email provider
 *   is configured (local dev, self-hosting).
 * - Rate limits per IP.
 */
export async function submitContactAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  pruneRateLimits();
  const hdrs = await headers();
  const limited = rateLimit(clientKey(hdrs, "contact"), 5, 10 * 60 * 1000);
  if (!limited.ok) {
    return actionError(`Too many messages from this connection. Try again in ${limited.retryAfterSeconds}s.`);
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return actionError("Please check the form and try again.", zodFieldErrors(parsed.error));
  }

  // Honeypot tripped: pretend success so bots do not learn the rule.
  if (parsed.data.website) {
    return actionOk("Thanks — your message has been received.");
  }

  const owner = (await db.user.findFirst({
    where: { role: "OWNER" },
    orderBy: { createdAt: "asc" },
    include: { portfolios: { select: { id: true }, orderBy: { createdAt: "asc" }, take: 1 } },
  })) as (UserRow & { portfolios: { id: string }[] }) | null;

  if (!owner) {
    return actionError("This portfolio is not accepting messages right now. Please email directly.");
  }

  await db.contactMessage.create({
    data: {
      userId: owner.id,
      portfolioId: owner.portfolios[0]?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? "",
      message: parsed.data.message,
    },
  });

  // Best-effort notification. The message is already stored in the inbox, so a
  // provider outage must not turn a delivered enquiry into an error state.
  await sendEmail({
    to: process.env.CONTACT_TO_EMAIL || owner.email,
    subject: `Portfolio enquiry from ${parsed.data.name}`,
    replyTo: parsed.data.email,
    text: [
      `From: ${parsed.data.name} <${parsed.data.email}>`,
      parsed.data.subject ? `Subject: ${parsed.data.subject}` : null,
      "",
      parsed.data.message,
      "",
      "Reply to this email to answer directly, or open /dashboard/inbox.",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  });

  return actionOk("Message received. I reply to every genuine enquiry — usually within a few days.");
}
