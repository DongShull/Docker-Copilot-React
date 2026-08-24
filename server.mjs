import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = await realpath(resolve(process.env.STATIC_ROOT || '/app/dist'))
const indexFile = await realpath(resolve(root, 'index.html'))
const indexInfo = await stat(indexFile)
if (!indexInfo.isFile() || (indexFile !== root && !indexFile.startsWith(root + sep))) {
  throw new Error('STATIC_ROOT must contain a regular index.html')
}
const parsedPort = Number.parseInt(process.env.PORT || '12713', 10)
if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const apiURL = new URL(process.env.VITE_API_BASE_URL || 'http://localhost')
if (!['http:', 'https:'].includes(apiURL.protocol)) {
  throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS')
}

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
])

function setSecurityHeaders(response) {
  response.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' ${apiURL.origin} https://api.github.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; worker-src 'self'`)
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
}

async function resolveFile(request) {
  const requestURL = new URL(request.url, 'http://localhost')
  const pathname = decodeURIComponent(requestURL.pathname)
  if (pathname.includes('\0')) throw new Error('invalid path')

  let candidate = resolve(root, `.${pathname}`)
  if (candidate !== root && !candidate.startsWith(root + sep)) throw new Error('path outside root')

  try {
    const info = await stat(candidate)
    if (info.isDirectory()) candidate = resolve(candidate, 'index.html')
    else if (!info.isFile()) throw new Error('not a regular file')
    const resolvedCandidate = await realpath(candidate)
    if (resolvedCandidate !== root && !resolvedCandidate.startsWith(root + sep)) {
      throw new Error('path outside root')
    }
    const resolvedInfo = await stat(resolvedCandidate)
    if (!resolvedInfo.isFile()) throw new Error('not a regular file')
    return resolvedCandidate
  } catch (error) {
    if (
      (error.code === 'ENOENT' || error.code === 'ENOTDIR') &&
      request.headers.accept?.includes('text/html')
    ) return indexFile
    throw error
  }
}

const server = createServer(async (request, response) => {
  setSecurityHeaders(response)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' })
    response.end()
    return
  }

  try {
    const filename = await resolveFile(request)
    const extension = extname(filename).toLowerCase()
    response.setHeader('Content-Type', contentTypes.get(extension) || 'application/octet-stream')
    if (filename.includes(`${sep}assets${sep}`)) {
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      response.setHeader('Cache-Control', 'no-cache')
    }
    response.writeHead(200)
    if (request.method === 'HEAD') {
      response.end()
      return
    }
    createReadStream(filename).on('error', () => response.destroy()).pipe(response)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
})

server.listen(parsedPort, '0.0.0.0', () => {
  console.log(`Docker Copilot frontend listening on port ${parsedPort}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
