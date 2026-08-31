export type SearchParamValue = string | number | boolean | null | undefined;
export type SearchParamUpdates = Readonly<Record<string, SearchParamValue | readonly SearchParamValue[]>>;

export function updateSearchParams(
  current: URLSearchParams | string,
  updates: SearchParamUpdates,
): URLSearchParams {
  const result = new URLSearchParams(current);
  for (const [key, raw] of Object.entries(updates)) {
    result.delete(key);
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) if (value !== null && value !== undefined) result.append(key, String(value));
  }
  result.sort();
  return result;
}

export function withSearchParams(pathname: string, current: URLSearchParams | string, updates: SearchParamUpdates): string {
  const query = updateSearchParams(current, updates).toString();
  return query ? `${pathname}?${query}` : pathname;
}
