"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Image field with optional binary upload. The URL input remains usable so
 * hosted images (CDN, GitHub raw) work without our storage layer.
 */
export function ImageUploadField({
  label,
  name,
  defaultValue = "",
  hint,
  aspect = "square",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  aspect?: "square" | "cover";
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "Upload failed");
      setUrl(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${name}-url`} className="text-[12.5px] font-medium text-text-2">{label}</label>
        <span className="font-mono text-[9.5px] text-muted">2 MB · PNG/JPG/WebP</span>
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg border border-line bg-ink ${
            aspect === "square" ? "size-16" : "h-16 w-28"
          }`}
        >
          {url ? (
            <Image src={url} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted">
              <ImagePlus className="size-4" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              id={`${name}-url`}
              name={name}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://… or upload a file"
              className="field"
            />
            {url && (
              <button type="button" onClick={() => setUrl("")} className={buttonClasses("ghost", "md", "shrink-0 px-2")} aria-label="Clear image">
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={buttonClasses("secondary", "sm")}
            >
              {uploading ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <ImagePlus className="size-3" aria-hidden />}
              {uploading ? "Uploading…" : "Upload image"}
            </button>
          </div>

          {error && <p className="text-[11px] text-danger">{error}</p>}
          {hint && !error && <p className="text-[11px] text-muted">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
