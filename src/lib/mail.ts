/**
 * Outbound email.
 *
 * Optional by design: everything the product does (accounts, publishing,
 * contact messages) works without an email provider. When `RESEND_API_KEY` is
 * set, password-reset links and contact notifications are delivered through
 * Resend's REST API.
 *
 * The key is read on the server only and never returned to a caller. Failures
 * are logged and reported to the caller as `{ sent: false }` — they must never
 * make a database write look unsuccessful.
 */

export interface MailResult {
  sent: boolean;
  reason?: "no-provider" | "rejected" | "network";
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(message: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "no-provider" };

  // Resend requires a verified sender; the env override lets a deployment use
  // its own domain instead of the shared onboarding address.
  const from = process.env.EMAIL_FROM ?? "Folio <onboarding@resend.dev>";
  const recipient = message.to.trim();
  if (!recipient.includes("@")) return { sent: false, reason: "rejected" };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: message.subject.slice(0, 180),
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("Email rejected", response.status, (await response.text()).slice(0, 300));
      return { sent: false, reason: "rejected" };
    }

    return { sent: true };
  } catch (error) {
    console.error("Email delivery failed", error);
    return { sent: false, reason: "network" };
  }
}
