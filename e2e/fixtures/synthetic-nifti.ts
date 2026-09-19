import { gzipSync } from 'node:zlib'

export function syntheticNifti() {
  const width = 4
  const height = 4
  const slices = 3
  const voxelOffset = 352
  const buffer = Buffer.alloc(voxelOffset + width * height * slices * 2)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  view.setInt32(0, 348, true)
  view.setInt16(40, 3, true)
  view.setInt16(42, width, true)
  view.setInt16(44, height, true)
  view.setInt16(46, slices, true)
  view.setInt16(48, 1, true)
  view.setInt16(70, 4, true)
  view.setInt16(72, 16, true)
  view.setFloat32(80, 1, true)
  view.setFloat32(84, 1, true)
  view.setFloat32(88, 2, true)
  view.setFloat32(108, voxelOffset, true)
  view.setFloat32(112, 1, true)
  view.setInt16(254, 1, true)
  view.setFloat32(280, 1, true)
  view.setFloat32(300, 1, true)
  view.setFloat32(320, 2, true)
  buffer.write('synthetic CT', 148, 'ascii')
  buffer.write('n+1\0', 344, 'ascii')
  for (let index = 0; index < width * height * slices; index += 1) {
    view.setInt16(voxelOffset + index * 2, index * 20 - 400, true)
  }
  return buffer
}

export function syntheticNiftiGzip() {
  return gzipSync(syntheticNifti())
}
