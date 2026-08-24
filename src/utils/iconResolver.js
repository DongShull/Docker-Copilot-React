export function normalizeImageRepository(imageName = '') {
  let value = String(imageName || '').trim().toLowerCase()
  if (!value) return ''
  const digestIndex = value.indexOf('@')
  if (digestIndex >= 0) value = value.slice(0, digestIndex)
  const lastSlash = value.lastIndexOf('/')
  const lastColon = value.lastIndexOf(':')
  if (lastColon > lastSlash) value = value.slice(0, lastColon)
  value = value.replace(/^index\.docker\.io\//, 'docker.io/')

  const segments = value.split('/').filter(Boolean)
  if (segments.length === 1) return `docker.io/library/${segments[0]}`
  const first = segments[0]
  const hasRegistry = first === 'localhost' || first.includes('.') || first.includes(':')
  if (!hasRegistry) return `docker.io/${segments.join('/')}`
  return segments.join('/')
}

export function normalizeIconAlias(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generatedIconDescriptor(imageName = '') {
  const repository = normalizeImageRepository(imageName)
  const simpleName = repository.split('/').pop() || 'container'
  const words = simpleName.split(/[-_.]+/).filter(Boolean)
  const label = (words.length > 1
    ? words.slice(0, 2).map(word => word[0]).join('')
    : simpleName.slice(0, 2)).toUpperCase() || 'CT'
  let hash = 2166136261
  for (const character of repository || simpleName) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  const hue = Math.abs(hash) % 360
  return {
    url: null,
    source: 'generated',
    confidence: 1,
    repository,
    label,
    color: `hsl(${hue} 58% 43%)`,
  }
}

function exactMapping(mapping, rawImageName, repository) {
  if (!mapping || typeof mapping !== 'object') return null
  if (Object.prototype.hasOwnProperty.call(mapping, rawImageName) && mapping[rawImageName]) return mapping[rawImageName]
  if (Object.prototype.hasOwnProperty.call(mapping, repository) && mapping[repository]) return mapping[repository]
  for (const [key, value] of Object.entries(mapping)) {
    if (normalizeImageRepository(key) === repository) return value
  }
  return null
}

function catalogSlugFor(imageName, hints, aliases) {
  const repository = normalizeImageRepository(imageName)
  const simpleName = repository.split('/').pop() || ''
  const candidates = [simpleName, ...hints]
  for (const candidate of candidates) {
    let hint = String(candidate || '').trim()
    try {
      if (/^https?:\/\//i.test(hint)) {
        const parsed = new URL(hint)
        hint = parsed.pathname.split('/').filter(Boolean).pop() || ''
      }
    } catch {
      // Invalid label URLs are only hints and are ignored.
    }
    const alias = normalizeIconAlias(hint)
    if (alias && Object.prototype.hasOwnProperty.call(aliases, alias) && aliases[alias]) return aliases[alias]
  }
  return null
}

export function resolveImageIcon({
  imageName = '',
  customLogos = {},
  builtInLogos = {},
  catalogAliases = {},
  catalogRevision = '',
  hints = [],
} = {}) {
  const repository = normalizeImageRepository(imageName)
  const userURL = exactMapping(customLogos, imageName, repository)
  if (userURL) {
    return { url: userURL, source: 'user', confidence: 1, repository }
  }

  const builtInURL = exactMapping(builtInLogos, imageName, repository)
  if (builtInURL) {
    return { url: builtInURL, source: 'builtin', confidence: 1, repository }
  }

  const slug = catalogSlugFor(imageName, Array.isArray(hints) ? hints : [], catalogAliases)
  if (slug && catalogRevision) {
    return {
      url: `https://raw.githubusercontent.com/homarr-labs/dashboard-icons/${catalogRevision}/png/${encodeURIComponent(slug)}.png`,
      source: 'catalog',
      confidence: hints.length > 0 ? 0.85 : 0.95,
      repository,
      slug,
    }
  }

  return generatedIconDescriptor(imageName)
}
