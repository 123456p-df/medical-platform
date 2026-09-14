import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir) {
  let entries = []
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const name of entries) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      walk(path)
      continue
    }
    if (!name.endsWith('.glb') || name.endsWith('.gz')) continue
    writeFileSync(path + '.gz', gzipSync(readFileSync(path), { level: 6 }))
  }
}

walk('dist/models')
console.log('gzip-static: wrote .glb.gz sidecars')
