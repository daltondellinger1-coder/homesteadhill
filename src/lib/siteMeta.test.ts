/// <reference types="node" />
import { test } from "node:test";
import { strictEqual, ok } from "node:assert/strict";
import { units } from "../data/units";
import { getUnitDisplayName, getUnitMetaTitle, buildSitemapXml, getCanonicalUrl } from "./siteMeta";

const byId = (id: string) => units.find(u => u.id === id)!;

test("unit names follow one pattern", () => {
  strictEqual(getUnitDisplayName(byId("unit-1")), "Unit 1 · 1BR Apartment · Sleeps 2");
  strictEqual(getUnitDisplayName(byId("unit-5")), "Unit 5 · 2BR Apartment · Sleeps 4");
  strictEqual(getUnitDisplayName(byId("unit-14")), "Unit 14 · 1BR Cottage · Sleeps 2");
  strictEqual(getUnitMetaTitle(byId("unit-11")), "Unit 11 · 1BR Cottage · Sleeps 2 | Homestead Hill, Vincennes IN");
});

test("sitemap lists every unit page and excludes /book", () => {
  const xml = buildSitemapXml();
  units.forEach(u => ok(xml.includes(`<loc>https://homestead-hill.com/units/${u.id}</loc>`)));
  ok(!xml.includes("/book<"));
});

test("canonicals drop trailing slash and query except home", () => {
  strictEqual(getCanonicalUrl("/"), "https://homestead-hill.com/");
  strictEqual(getCanonicalUrl("/units/?x=1"), "https://homestead-hill.com/units");
});
