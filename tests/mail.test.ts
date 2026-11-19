import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mailConfigured, sendEmail } from "@/lib/mail";

const originalKey = process.env.RESEND_API_KEY;

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  vi.unstubAllGlobals();
});

describe("optional email delivery", () => {
  it("reports no provider instead of throwing when unconfigured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(mailConfigured()).toBe(false);
    const result = await sendEmail({ to: "someone@example.com", subject: "Hi", text: "Body" });
    expect(result).toEqual({ sent: false, reason: "no-provider" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the provider with the API key in a header, never in the body", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendEmail({
      to: "israel@example.com",
      subject: "Reset your Folio password",
      text: "Use the link in this email.",
      replyTo: "enquiry@example.com",
    });

    expect(result.sent).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(String(init.body));
    expect(body.to).toEqual(["israel@example.com"]);
    expect(body.reply_to).toBe("enquiry@example.com");
    expect(JSON.stringify(body)).not.toContain("re_test_key");
  });

  it("reports a rejection without leaking the provider response", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, text: async () => "invalid from" }));

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sendEmail({ to: "israel@example.com", subject: "Hi", text: "Body" });
    expect(result).toEqual({ sent: false, reason: "rejected" });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("survives a network failure", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hang up")));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendEmail({ to: "israel@example.com", subject: "Hi", text: "Body" });
    expect(result).toEqual({ sent: false, reason: "network" });
    error.mockRestore();
  });

  it("rejects an invalid recipient before calling the provider", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await sendEmail({ to: "not-an-email", subject: "Hi", text: "Body" });
    expect(result).toEqual({ sent: false, reason: "rejected" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
