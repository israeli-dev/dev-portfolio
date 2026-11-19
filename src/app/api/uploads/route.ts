import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { saveImageUpload, UploadError } from "@/lib/storage";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Authenticated image upload endpoint.
 *
 * - Requires a session (401 otherwise).
 * - Same-origin enforcement on top of the session cookie.
 * - 2 MB limit, magic-byte validation, generated filenames.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Cross-origin uploads are not allowed." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  const limited = rateLimit(clientKey(request.headers, `upload:${user.id}`), 10, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${limited.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  try {
    const saved = await saveImageUpload(file, user.id);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Upload failed", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
