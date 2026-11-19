import { ZodError, type ZodSchema } from "zod";

/** Uniform result shape returned by every server action. */
export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Optional payload, e.g. a generated reset URL in development. */
  data?: Record<string, string>;
}

export function actionOk(message?: string, data?: Record<string, string>): ActionResult {
  return { ok: true, message, data };
}

export function actionError(message: string, fieldErrors?: Record<string, string>): ActionResult {
  return { ok: false, message, fieldErrors };
}

/** Convert a Zod error into a name → message map for form rendering. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export type SafeParseResult<T> = { success: true; data: T } | { success: false; result: ActionResult };

export function parseForm<T>(schema: ZodSchema<T>, formData: FormData): SafeParseResult<T> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    raw[key] = value instanceof File ? value : value.toString();
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      result: actionError("Please check the highlighted fields.", zodFieldErrors(parsed.error)),
    };
  }
  return { success: true, data: parsed.data };
}

export const CHECKBOX_ON = new Set(["on", "true", "1"]);

/** Normalise checkboxes: absent fields are false, not undefined. */
export function formBoolean(formData: FormData, name: string): boolean {
  return CHECKBOX_ON.has(String(formData.get(name) ?? ""));
}
