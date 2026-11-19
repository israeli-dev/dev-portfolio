/** Safe helpers for the JSON-string columns used for portable list fields. */

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return [];
  }
}

export function stringifyList(values: string[] | undefined | null): string {
  return JSON.stringify((values ?? []).map((v) => v.trim()).filter(Boolean));
}

export function listFromText(value: FormDataEntryValue | null | undefined): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export function parseSections(value: string | null | undefined): SectionConfig[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((section) => section && typeof section.id === "string")
      .map((section, index) => ({
        id: String(section.id),
        label: typeof section.label === "string" ? section.label : String(section.id),
        visible: section.visible !== false,
        order: typeof section.order === "number" ? section.order : index,
      }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}
