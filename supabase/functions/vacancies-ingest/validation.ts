import { z } from "npm:zod@3.25.76";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const unitId = z.string().regex(/^unit-\d+$/).max(40);
const nullableText = z.string().max(2000).nullable().optional();
const vacancy = z.object({
  unit_id: unitId,
  available_from: date.optional(),
  label: z.string().trim().min(1).max(200).optional(),
  note: nullableText,
  has_detail_page: z.boolean().optional(),
  status: z.enum(["open", "filled", "hold"]).optional(),
  source: nullableText,
  notes_internal: nullableText,
  bedrooms: z.number().int().min(0).max(50).nullable().optional(),
  furnished: z.boolean().nullable().optional(),
  product: nullableText,
}).strict();
const aliases: Record<string, string> = {
  unitId: "unit_id", availableFrom: "available_from",
  hasDetailPage: "has_detail_page", notesInternal: "notes_internal",
};

export function parseItems(body: unknown) {
  const wrapped = z.object({ items: z.array(z.unknown()) }).strict().safeParse(body);
  const items = Array.isArray(body) ? body : wrapped.success ? wrapped.data.items : [body];
  return z.array(z.unknown()).min(1).max(100).parse(items).map((item) => {
    const object = z.record(z.unknown()).parse(item);
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
      const column = aliases[key] ?? key;
      if (column in normalized) throw new Error("Duplicate field alias");
      normalized[column] = value;
    }
    return vacancy.parse(normalized);
  });
}

export function parseDelete(body: unknown, queryId: string | null) {
  if (queryId !== null) return unitId.parse(queryId);
  const object = z.object({ unitId: unitId.optional(), unit_id: unitId.optional() }).strict().parse(body);
  return unitId.parse(object.unit_id ?? object.unitId);
}