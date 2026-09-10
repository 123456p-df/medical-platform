// One-time, source-aware mechanical migration of Vue presentation text.
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'vue/compiler-sfc'

const strings = new Set()
const attributes = new Set(['title', 'subtitle', 'label', 'placeholder', 'aria-label', 'description', 'eyebrow'])
function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walkFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)])
}
for (const file of walkFiles('src').filter((file) => file.endsWith('.vue'))) {
  const source = fs.readFileSync(file, 'utf8')
  const template = parse(source).descriptor.template
  if (!template) continue
  const edits = []
  const add = (start, end, value) => edits.push({ start, end, value })
  function walk(node) {
    if (node.type === 2 && /[A-Za-z]/.test(node.content)) {
      const value = node.content.trim().replace(/\s+/g, ' ')
      if (!value) return
      strings.add(value)
      const leading = /^\s/.test(node.loc.source) ? ' ' : ''
      const trailing = /\s$/.test(node.loc.source) ? ' ' : ''
      add(node.loc.start.offset, node.loc.end.offset, `${leading}{{ $t(${JSON.stringify(value)}) }}${trailing}`)
    } else if (node.type === 5 && !node.content.content.includes('$t(') && !node.content.content.includes("locale ===")) {
      add(node.loc.start.offset, node.loc.end.offset, `{{ $t(${node.content.content}) }}`)
    }
    for (const prop of node.props ?? []) {
      if (prop.type === 6 && attributes.has(prop.name) && prop.value) {
        strings.add(prop.value.content)
        add(prop.loc.start.offset, prop.loc.end.offset, `:${prop.name}="$t(${JSON.stringify(prop.value.content).replaceAll('"', '&quot;')})"`)
      } else if (prop.type === 7 && prop.name === 'bind' && attributes.has(prop.arg?.content) && prop.exp && !prop.exp.content.includes('$t(')) {
        add(prop.exp.loc.start.offset, prop.exp.loc.end.offset, `$t(${prop.exp.content})`)
      }
    }
    if (node.tag === 'option' && !node.props.some((prop) => prop.name === 'value' || prop.arg?.content === 'value') && node.children.length === 1 && node.children[0].type === 2) {
      const value = node.children[0].content.trim()
      add(node.loc.start.offset + '<option'.length, node.loc.start.offset + '<option'.length, ` value="${value}"`)
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(template.ast)
  let output = source
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.value + output.slice(edit.end)
  fs.writeFileSync(file, output)
}
console.log(JSON.stringify([...strings].sort(), null, 2))
