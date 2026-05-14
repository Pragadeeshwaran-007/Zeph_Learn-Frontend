// Deterministic helpers derived from problem id so values are stable per problem.
export function hashStr(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function acceptanceFor(id: string): number {
  return 25 + (hashStr(id) % 65); // 25%..89%
}

export function tagsFor(category: string): string[] {
  const base = category.split(/[,/]\s*/).map((s) => s.trim()).filter(Boolean);
  return base.length ? base : [category];
}
