import assert from 'assert'

process.nextTick(async t => {
  const z = Zone.current.fork({ properties: { data: 'test' } })

  const result = await z.run(async () => {
    return Zone.current.get('data')
  })

  assert.strictEqual(result, 'test')
})
