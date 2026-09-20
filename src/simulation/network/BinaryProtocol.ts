const MAGIC = 0x50534d56
const VERSION = 1
const HEADER_BYTES = 32
const SECTION_BYTES = 20

export const enum BinaryMessageType {
  STATE_DELTA = 1,
  FULL_SNAPSHOT = 2,
  CUT_COMMIT = 3,
}

const enum SectionKind {
  CHANGED_INDICES = 1,
  POSITIONS = 2,
}

export interface StateDeltaPacket {
  type: BinaryMessageType.STATE_DELTA
  objectId: string
  sequenceNumber: number
  simulationTick: number
  topologyVersion: number
  changedIndices: Uint32Array
  positions: Float32Array
}

function aligned4(value: number) {
  return (value + 3) & ~3
}

export function encodeStateDelta(packet: Omit<StateDeltaPacket, 'type'>) {
  if (packet.positions.length !== packet.changedIndices.length * 3) throw new Error('State delta length mismatch')
  const id = new TextEncoder().encode(packet.objectId)
  if (!id.length || id.length > 65535) throw new Error('Invalid binary packet object id')
  const idBytes = aligned4(id.length)
  const tableOffset = HEADER_BYTES + idBytes
  const dataOffset = tableOffset + SECTION_BYTES * 2
  const indexBytes = packet.changedIndices.byteLength
  const positionOffset = aligned4(dataOffset + indexBytes)
  const total = positionOffset + packet.positions.byteLength
  const buffer = new ArrayBuffer(total)
  const view = new DataView(buffer)
  view.setUint32(0, MAGIC, true)
  view.setUint16(4, VERSION, true)
  view.setUint16(6, BinaryMessageType.STATE_DELTA, true)
  view.setUint32(8, 0, true)
  view.setUint32(12, packet.sequenceNumber, true)
  view.setUint32(16, packet.simulationTick, true)
  view.setUint32(20, packet.topologyVersion, true)
  view.setUint16(24, id.length, true)
  view.setUint16(26, 2, true)
  view.setUint32(28, total - HEADER_BYTES, true)
  new Uint8Array(buffer, HEADER_BYTES, id.length).set(id)
  writeSection(view, tableOffset, SectionKind.CHANGED_INDICES, 4, 1, packet.changedIndices.length, dataOffset, indexBytes)
  writeSection(view, tableOffset + SECTION_BYTES, SectionKind.POSITIONS, 4, 3, packet.changedIndices.length, positionOffset, packet.positions.byteLength)
  new Uint32Array(buffer, dataOffset, packet.changedIndices.length).set(packet.changedIndices)
  new Float32Array(buffer, positionOffset, packet.positions.length).set(packet.positions)
  return buffer
}

function writeSection(
  view: DataView,
  offset: number,
  kind: number,
  componentBytes: number,
  components: number,
  count: number,
  byteOffset: number,
  byteLength: number,
) {
  view.setUint16(offset, kind, true)
  view.setUint16(offset + 2, componentBytes, true)
  view.setUint16(offset + 4, components, true)
  view.setUint16(offset + 6, 0, true)
  view.setUint32(offset + 8, count, true)
  view.setUint32(offset + 12, byteOffset, true)
  view.setUint32(offset + 16, byteLength, true)
}

export function decodeStateDelta(buffer: ArrayBuffer): StateDeltaPacket {
  if (buffer.byteLength < HEADER_BYTES) throw new Error('Binary packet is truncated')
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== MAGIC || view.getUint16(4, true) !== VERSION) throw new Error('Unsupported binary packet')
  if (view.getUint16(6, true) !== BinaryMessageType.STATE_DELTA) throw new Error('Unexpected binary message type')
  const idLength = view.getUint16(24, true)
  const sectionCount = view.getUint16(26, true)
  const idBytes = aligned4(idLength)
  const tableOffset = HEADER_BYTES + idBytes
  if (!idLength || sectionCount !== 2 || tableOffset + SECTION_BYTES * sectionCount > buffer.byteLength) {
    throw new Error('Invalid binary packet table')
  }
  const objectId = new TextDecoder().decode(new Uint8Array(buffer, HEADER_BYTES, idLength))
  let changedIndices: Uint32Array | undefined
  let positions: Float32Array | undefined
  for (let index = 0; index < sectionCount; index++) {
    const offset = tableOffset + index * SECTION_BYTES
    const kind = view.getUint16(offset, true)
    const components = view.getUint16(offset + 4, true)
    const count = view.getUint32(offset + 8, true)
    const byteOffset = view.getUint32(offset + 12, true)
    const byteLength = view.getUint32(offset + 16, true)
    if (byteOffset + byteLength > buffer.byteLength || byteOffset % 4) throw new Error('Binary packet section is out of range')
    if (kind === SectionKind.CHANGED_INDICES && components === 1 && byteLength === count * 4) {
      changedIndices = new Uint32Array(buffer.slice(byteOffset, byteOffset + byteLength))
    } else if (kind === SectionKind.POSITIONS && components === 3 && byteLength === count * 12) {
      positions = new Float32Array(buffer.slice(byteOffset, byteOffset + byteLength))
    }
  }
  if (!changedIndices || !positions || positions.length !== changedIndices.length * 3) throw new Error('Binary state delta is incomplete')
  return {
    type: BinaryMessageType.STATE_DELTA,
    objectId,
    sequenceNumber: view.getUint32(12, true),
    simulationTick: view.getUint32(16, true),
    topologyVersion: view.getUint32(20, true),
    changedIndices,
    positions,
  }
}
