import assert from 'node:assert/strict'
import test from 'node:test'

import { getImageRepository } from '../src/utils/imageReference.js'

test('removes tags without treating registry ports as tags', () => {
  assert.equal(getImageRepository('postgres:17-alpine'), 'postgres')
  assert.equal(getImageRepository('registry.example:5000/team/postgres:17-alpine'), 'registry.example:5000/team/postgres')
  assert.equal(getImageRepository('registry.example:5000/team/postgres'), 'registry.example:5000/team/postgres')
})

test('removes digests from image references', () => {
  assert.equal(getImageRepository('registry.example:5000/team/app@sha256:abc'), 'registry.example:5000/team/app')
})
