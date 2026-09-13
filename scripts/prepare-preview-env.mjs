import { randomBytes } from 'node:crypto'
import { chmod, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

function randomToken(bytes = 36) {
  return randomBytes(bytes).toString('base64url')
}

function fernetKey() {
  return randomBytes(32).toString('base64').replaceAll('+', '-').replaceAll('/', '_')
}

function fillBlankValue(content, key, value) {
  const blank = new RegExp(`^${key}=[\\t ]*(?:["']{2})?[\\t ]*$`, 'm')
  if (blank.test(content)) return content.replace(blank, `${key}=${value}`)
  if (new RegExp(`^${key}=`, 'm').test(content)) return content
  return `${content.replace(/\s*$/, '')}\n${key}=${value}\n`
}

async function prepareFile(relativeTarget, relativeTemplate, values) {
  const target = new URL(relativeTarget, new URL('../', import.meta.url))
  let content
  let created = false
  try {
    content = await readFile(target, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    content = await readFile(new URL(relativeTemplate, new URL('../', import.meta.url)), 'utf8')
    created = true
  }

  let prepared = content
  for (const [key, value] of Object.entries(values)) {
    prepared = fillBlankValue(prepared, key, value)
  }
  if (created || prepared !== content) {
    await writeFile(target, prepared, { encoding: 'utf8', mode: 0o600 })
    await chmod(target, 0o600)
    console.log(`${created ? 'Created' : 'Completed'} ${relativeTarget} with local preview secrets.`)
  }
}

await prepareFile('.env', '.env.example', {
  POSTGRES_PASSWORD: randomToken(),
})
await prepareFile('backend/.env', 'backend/.env.example', {
  JWT_SECRET: randomToken(48),
  ID_ENCRYPTION_KEY: fernetKey(),
  ID_HASH_KEY: randomToken(48),
})

console.log(`Preview configuration is ready in ${projectRoot}`)
