import * as _ from 'lodash'
import ah from 'async_hooks'

const zones = new Map()

global.Zone = {
  get current() {
    return zones.get(ah.executionAsyncId())
  }
}

class TheZone {
  constructor(data) {
    this.data = data
  }

  fork(spec) {
    const z = new TheZone(_.defaults(spec.properties, this.data))
    zones.set(ah.executionAsyncId(), z)

    return z
  }

  run(cb) {
    return cb()
  }

  get(key) {
    return this.data[key]
  }
}

ah.createHook({
  init: (id, type, parentId) => zones.set(id, zones.get(parentId)),
  destroy: (id) => zones.delete(id)
}).enable()

zones.set(ah.executionAsyncId(), new TheZone({}))
