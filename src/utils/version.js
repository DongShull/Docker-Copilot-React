export function parseVersion(version) {
  if (!version || typeof version !== 'string') return null

  const match = version.trim().match(/^[vV]?(\d+)\.(\d+)\.(\d+)(?:[-+].+)?$/)
  if (!match) return null

  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
  }
}

export function shouldUpdate(currentVersion, latestVersion) {
  const current = parseVersion(currentVersion)
  const latest = parseVersion(latestVersion)
  if (!current || !latest) return false

  if (latest.major !== current.major) return latest.major > current.major
  if (latest.minor !== current.minor) return latest.minor > current.minor
  return latest.patch > current.patch
}
