import assert from 'node:assert/strict'
import test from 'node:test'

import {
  generatedIconDescriptor,
  normalizeImageRepository,
  resolveImageIcon,
} from '../src/utils/iconResolver.js'

test('normalizes Docker Hub, registry ports, tags and digests', () => {
  assert.equal(normalizeImageRepository('postgres:17-alpine'), 'docker.io/library/postgres')
  assert.equal(normalizeImageRepository('registry.example:5000/team/app:v1'), 'registry.example:5000/team/app')
  assert.equal(normalizeImageRepository('team/app@sha256:abc'), 'docker.io/team/app')
})

test('user overrides take precedence over built-in and catalog icons', () => {
  const result = resolveImageIcon({
    imageName: 'postgres:17-alpine',
    customLogos: { 'docker.io/library/postgres': '/custom.png' },
    builtInLogos: { postgres: '/builtin.png' },
    catalogAliases: { postgres: 'postgres' },
    catalogRevision: 'revision',
  })
  assert.equal(result.source, 'user')
  assert.equal(result.url, '/custom.png')
})

test('matching is exact and does not use unsafe substrings', () => {
  const result = resolveImageIcon({
    imageName: 'example/not-postgres-exporter:latest',
    builtInLogos: { postgres: '/postgres.png' },
    catalogAliases: {},
  })
  assert.equal(result.source, 'generated')
})

test('resolver ignores inherited object properties', () => {
  const result = resolveImageIcon({
    imageName: 'constructor:latest',
    customLogos: {},
    builtInLogos: {},
    catalogAliases: {},
    catalogRevision: 'revision',
  })
  assert.equal(result.source, 'generated')
})

test('generated fallbacks are deterministic and distinguish repositories', () => {
  const first = generatedIconDescriptor('registry.example/team/private-app:v1')
  const again = generatedIconDescriptor('registry.example/team/private-app:v2')
  const other = generatedIconDescriptor('registry.example/team/other:v1')
  assert.deepEqual(first, again)
  assert.notEqual(first.color, other.color)
})
