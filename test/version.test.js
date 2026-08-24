import assert from 'node:assert/strict'
import test from 'node:test'

import { parseVersion, shouldUpdate } from '../src/utils/version.js'

test('parses release and channel versions with a leading v', () => {
  assert.deepEqual(parseVersion('v2.1.3'), { major: 2, minor: 1, patch: 3 })
  assert.deepEqual(parseVersion('v2.1.3-UGREEN'), { major: 2, minor: 1, patch: 3 })
})

test('compares semantic version components', () => {
  assert.equal(shouldUpdate('v2.1.3', 'v2.1.4'), true)
  assert.equal(shouldUpdate('v2.2.0-FNOS', 'v2.1.9-FNOS'), false)
  assert.equal(shouldUpdate('unknown', 'v2.1.4'), false)
})
