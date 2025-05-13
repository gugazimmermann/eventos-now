export function formValuesToString(
  obj: Record<string, string | boolean | File | null>
): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, String(value)]));
}
