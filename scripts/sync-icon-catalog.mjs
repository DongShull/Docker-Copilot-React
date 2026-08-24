import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const revision = '1ecf1ef97fc6a3f4eb5787a90aa2ff89ec7bb679'
const metadataURL = `https://raw.githubusercontent.com/homarr-labs/dashboard-icons/${revision}/metadata.json`

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const response = await fetch(metadataURL)
if (!response.ok) {
  throw new Error(`Unable to fetch icon metadata: ${response.status} ${response.statusText}`)
}
const metadata = await response.json()
const aliases = {}
const icons = Object.keys(metadata).sort((left, right) => left.localeCompare(right))

for (const icon of icons) {
  const normalizedIcon = normalize(icon)
  for (const candidate of [icon, normalizedIcon, ...(metadata[icon]?.aliases || [])]) {
    const alias = normalize(candidate)
    if (alias && !aliases[alias]) aliases[alias] = icon
  }
}

const output = {
  revision,
  license: 'Apache-2.0',
  source: 'https://github.com/homarr-labs/dashboard-icons',
  icons,
  aliases: Object.fromEntries(Object.entries(aliases).sort(([left], [right]) => left.localeCompare(right))),
}

const destination = path.resolve('src/config/iconCatalog.generated.json')
await mkdir(path.dirname(destination), { recursive: true })
await writeFile(destination, `${JSON.stringify(output)}\n`, 'utf8')
process.stdout.write(`Wrote ${icons.length} icons and ${Object.keys(aliases).length} aliases to ${destination}\n`)
