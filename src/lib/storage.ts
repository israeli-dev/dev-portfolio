import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Local disk storage for uploaded images.
 *
 * Validates type by magic bytes, not by the client-supplied MIME type, and
 * generates the filename itself so path traversal is impossible.
 *
 * NOTE: serverless filesystems are ephemeral. `docs/DEPLOYMENT.md` documents
 * swapping this module for S3/Supabase Storage — the route's contract stays the
 * same (return a public URL).
 */

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const SIGNATURES: { ext: string; mime: string; test: (bytes: Uint8Array) => boolean }[] = [
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45,
  },
];

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

export interface SavedUpload {
  url: string;
  bytes: number;
  mime: string;
}

export async function saveImageUpload(file: File, userId: string): Promise<SavedUpload> {
  if (!/^[a-zA-Z0-9_-]{5,40}$/.test(userId)) throw new UploadError("Invalid account", 400);
  if (file.size === 0) throw new UploadError("The file is empty");
  if (file.size > MAX_BYTES) throw new UploadError("Images must be 2 MB or smaller", 413);

  const buffer = new Uint8Array(await file.arrayBuffer());
  const signature = SIGNATURES.find((candidate) => candidate.test(buffer));
  if (!signature) throw new UploadError("Only PNG, JPEG or WebP images are accepted", 415);

  // SVG is deliberately excluded: it can carry scripts.
  const directory = path.join(UPLOAD_ROOT, userId);

  try {
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${signature.ext}`;
    await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
    return { url: `/uploads/${userId}/${filename}`, bytes: file.size, mime: signature.mime };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    // Serverless platforms (Vercel, Netlify) mount the app read-only. Say so
    // plainly instead of returning an opaque 500 — the alternative, embedding
    // an image URL, always works.
    if (code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOSPC") {
      throw new UploadError(
        "This deployment cannot store uploads (read-only filesystem). Paste an image URL instead — see docs/DEPLOYMENT.md.",
        501,
      );
    }
    throw error;
  }
}
