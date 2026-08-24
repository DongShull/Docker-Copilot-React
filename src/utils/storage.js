export function parseStoredRecord(rawValue) {
  if (!rawValue) return {}
  try {
    const parsed = JSON.parse(rawValue)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch {
    // Corrupted browser storage must not prevent the management UI from loading.
  }
  return {}
}
