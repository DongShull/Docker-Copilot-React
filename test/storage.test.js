import assert from 'node:assert/strict'
import test from 'node:test'

import { parseStoredRecord } from '../src/utils/storage.js'

test('parses stored object records', () => {
  assert.deepEqual(parseStoredRecord('{"postgres":"/icon.png"}'), { postgres: '/icon.png' })
})

test('returns an empty record for corrupted or unexpected storage', () => {
  assert.deepEqual(parseStoredRecord('{broken'), {})
  assert.deepEqual(parseStoredRecord('["unexpected"]'), {})
  assert.deepEqual(parseStoredRecord('null'), {})
})
