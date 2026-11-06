import { assertEquals, assertThrows } from "jsr:@std/assert";
import { parseDelete, parseItems } from "./validation.ts";

Deno.test("camelCase and snake_case upserts normalize all allowed fields", () => {
  assertEquals(parseItems({ unitId: "unit-15", availableFrom: "2026-12-01", label: "4BR/1BA unfurnished long-term", hasDetailPage: false, notesInternal: "private", status: "hold", bedrooms: 4, furnished: false, product: "long-term", source: "bot", note: null }), [{ unit_id: "unit-15", available_from: "2026-12-01", label: "4BR/1BA unfurnished long-term", has_detail_page: false, notes_internal: "private", status: "hold", bedrooms: 4, furnished: false, product: "long-term", source: "bot", note: null }]);
  assertEquals(parseItems({ items: [{ unit_id: "unit-3", status: "filled" }] }), [{ unit_id: "unit-3", status: "filled" }]);
  assertEquals(parseItems([{ unit_id: "unit-7", status: "open" }]), [{ unit_id: "unit-7", status: "open" }]);
});
Deno.test("invalid status, dates, fields and missing IDs are rejected", () => {
  for (const item of [{ unitId: "unit-3", status: "closed" }, { label: "1BR" }, { unitId: "unit-3", availableFrom: "2026-02-30" }, { unitId: "unit-3", updated_at: "override" }]) assertThrows(() => parseItems(item));
});
Deno.test("DELETE accepts either body alias or query ID", () => {
  assertEquals(parseDelete({ unitId: "unit-3" }, null), "unit-3");
  assertEquals(parseDelete({ unit_id: "unit-7" }, null), "unit-7");
  assertEquals(parseDelete(undefined, "unit-15"), "unit-15");
  assertThrows(() => parseDelete({}, null));
});