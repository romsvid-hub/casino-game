// Asset weight report: total size of the Lottie files and images the game loads.
// `npm run assets:weight` prints a table; `-- --md` prints a Markdown row block
// for docs/asset-weight.md (record it before and after each art change).
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../public/', import.meta.url))
const IMAGE = new Set(['.png', '.webp', '.jpg', '.jpeg', '.svg', '.avif'])

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
}

const files = walk(ROOT).map((path) => ({ path: path.slice(ROOT.length), ext: extname(path).toLowerCase(), size: statSync(path).size }))
const sum = (list) => list.reduce((n, f) => n + f.size, 0)
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
const groups = {
  lottie: files.filter((f) => f.ext === '.json' && f.path.startsWith('lottie/')),
  images: files.filter((f) => IMAGE.has(f.ext)),
}
const rest = files.filter((f) => !groups.lottie.includes(f) && !groups.images.includes(f))

const rows = [
  ['Lottie JSON', groups.lottie.length, sum(groups.lottie)],
  ['Images', groups.images.length, sum(groups.images)],
  ['Other public files', rest.length, sum(rest)],
  ['Total public/', files.length, sum(files)],
]
const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 5)

if (process.argv.includes('--md')) {
  console.log('| Group | Files | Size |\n| --- | --- | --- |')
  for (const [name, count, size] of rows) console.log(`| ${name} | ${count} | ${mb(size)} |`)
  console.log(`\nLargest: ${largest.map((f) => `\`${f.path}\` ${mb(f.size)}`).join(', ')}`)
} else {
  for (const [name, count, size] of rows) console.log(`${name.padEnd(20)} ${String(count).padStart(4)} files  ${mb(size).padStart(9)}`)
  console.log('\nLargest:')
  for (const f of largest) console.log(`  ${mb(f.size).padStart(9)}  ${f.path}`)
}
