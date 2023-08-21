# Minizone
Minimal [zone.js](https://github.com/angular/zone.js) implementation using node.js `async_hooks`
Used internally for [searchlibs.com](http://searchlibs.com)

## Usage

```
import 'minizone'

const z = Zone.current.fork({
  properties: { tx: ... }
})

await z.run(async () => {
  // do something async
  // access tx from anywhere with `Zone.current.get('tx')`
})
```
