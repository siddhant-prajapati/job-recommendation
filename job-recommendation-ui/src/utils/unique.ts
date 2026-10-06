export function uniqueNamed<T extends { id: number; name: string }>(items: T[]): T[] {
  const byId = new Map<number, T>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
