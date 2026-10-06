export function parseId(value: string | undefined | null): number | undefined {
  if (value == null || value.trim() === '') {
    return undefined;
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}
