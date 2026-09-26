// Auto-copy MapLibre v6 worker files to public/maplibre/
// Run on predev + prebuild to stay in sync with installed maplibre-gl version.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const maplibrePackageJson = require.resolve('maplibre-gl/package.json', { paths: [appRoot] })
const maplibreDist = path.join(path.dirname(maplibrePackageJson), 'dist')
const publicDir = path.join(appRoot, 'public', 'maplibre')

const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

mkdirSync(publicDir, { recursive: true })

for (const file of files) {
  const source = path.join(maplibreDist, file)
  if (!existsSync(source)) {
    throw new Error(`Missing MapLibre worker asset: ${source}`)
  }
  copyFileSync(source, path.join(publicDir, file))
}

console.log(`Copied MapLibre workers -> ${publicDir}`)