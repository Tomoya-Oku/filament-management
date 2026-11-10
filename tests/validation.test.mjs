import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateEntry } from '../src/validation.mjs'

const base = { kind:'add', room:'62C1', destination:'', material:'PLA Basic', color:'BLACK', quantity:1 }
test('whole spool quantities only, bounded at 999', () => {
  for (const quantity of [0,-1,1.5,NaN,Infinity,1000]) assert.equal(validateEntry({ ...base,quantity }), 'invalidQuantity')
  for (const quantity of [1,999]) assert.equal(validateEntry({ ...base,quantity }), null)
})
test('color is required and transfer must have different rooms', () => {
  assert.equal(validateEntry({ ...base,color:'' }), 'selectColor')
  for (const destination of ['', '62C1']) assert.equal(validateEntry({ ...base,kind:'transfer',destination }), 'sameRoom')
  assert.equal(validateEntry({ ...base,kind:'transfer',destination:'0066' }), null)
})
