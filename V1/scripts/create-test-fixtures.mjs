import fs from 'node:fs'
import path from 'node:path'
const dir = 'test-fixtures'
fs.mkdirSync(dir, { recursive: true })
function element(group, tag, vr, value) {
  let data
  if (Buffer.isBuffer(value)) data = value
  else if (vr === 'US') { data = Buffer.alloc(2); data.writeUInt16LE(value) }
  else if (vr === 'UL') { data = Buffer.alloc(4); data.writeUInt32LE(value) }
  else { data = Buffer.from(value); if (data.length % 2) data = Buffer.concat([data, Buffer.from(vr === 'UI' ? [0] : [32])]) }
  const long = ['OB', 'OW', 'SQ', 'UN', 'UT'].includes(vr)
  const header = Buffer.alloc(long ? 12 : 8)
  header.writeUInt16LE(group); header.writeUInt16LE(tag, 2); header.write(vr, 4)
  if (long) header.writeUInt32LE(data.length, 8); else header.writeUInt16LE(data.length, 6)
  return Buffer.concat([header, data])
}
for (const [index, modality] of ['CT', 'MR', 'DX'].entries()) {
  const uid = `2.25.90000000000000000${index + 1}`
  const sop = '1.2.840.10008.5.1.4.1.1.2'
  const meta = Buffer.concat([element(2, 1, 'OB', Buffer.from([0, 1])), element(2, 2, 'UI', sop), element(2, 3, 'UI', uid), element(2, 16, 'UI', '1.2.840.10008.1.2.1'), element(2, 18, 'UI', '2.25.99999')])
  const pixels = Buffer.alloc(64 * 64 * 2)
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) pixels.writeUInt16LE((x * 3 + y * 2) % 256, (y * 64 + x) * 2)
  const tags = [
    [8, 22, 'UI', sop], [8, 24, 'UI', uid], [8, 96, 'CS', modality],
    [16, 16, 'PN', 'Test^Fixture'], [16, 32, 'LO', 'TEST-ONLY'],
    [32, 13, 'UI', `${uid}.1`], [32, 14, 'UI', `${uid}.2`], [32, 19, 'IS', '1'],
    [32, 50, 'DS', '0\\0\\0'], [32, 55, 'DS', '1\\0\\0\\0\\1\\0'],
    [40, 2, 'US', 1], [40, 4, 'CS', 'MONOCHROME2'], [40, 16, 'US', 64], [40, 17, 'US', 64],
    [40, 48, 'DS', '1\\1'], [40, 256, 'US', 16], [40, 257, 'US', 16], [40, 258, 'US', 15], [40, 259, 'US', 0],
    [40, 4176, 'DS', '128'], [40, 4177, 'DS', '256'], [0x7fe0, 16, 'OW', pixels],
  ]
  fs.writeFileSync(path.join(dir, `fixture-${modality}.dcm`), Buffer.concat([Buffer.alloc(128), Buffer.from('DICM'), element(2, 0, 'UL', meta.length), meta, ...tags.map((tag) => element(...tag))]), { flag: 'wx' })
}
fs.writeFileSync(path.join(dir, 'fixture.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=', 'base64'), { flag: 'wx' })
console.log('Created three DICOM modality fixtures and one raster fixture.')
