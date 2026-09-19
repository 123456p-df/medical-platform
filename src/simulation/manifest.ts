import type {
  PhysicsMode,
  SimulationManifest,
  SimulationMaterial,
  SimulationStructure,
  SimulationTransform,
  Vec3Tuple,
} from './types'

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`)
  return value
}

function optionalVec3(value: unknown, label: string): Vec3Tuple | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length !== 3 || value.some(item => typeof item !== 'number' || !Number.isFinite(item))) {
    throw new Error(`${label} must contain three finite numbers`)
  }
  return [value[0], value[1], value[2]]
}

function safeAssetPath(value: unknown, label: string, optional = false): string | null {
  if (optional && (value === null || value === undefined || value === '')) return null
  const path = text(value, label)
  if (/^(data|javascript|file):/i.test(path) || path.includes('\\')) {
    throw new Error(`${label} uses an unsupported asset URL`)
  }
  return path
}

function parseMaterial(value: unknown, label: string): SimulationMaterial {
  const source = object(value, label)
  const color = text(source.color, `${label}.color`)
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`${label}.color must be a six-digit hex color`)
  const number = (key: 'opacity' | 'roughness' | 'metalness') => {
    const item = source[key]
    if (item === undefined) return undefined
    if (typeof item !== 'number' || !Number.isFinite(item) || item < 0 || item > 1) {
      throw new Error(`${label}.${key} must be between 0 and 1`)
    }
    return item
  }
  return {
    color,
    opacity: number('opacity'),
    roughness: number('roughness'),
    metalness: number('metalness'),
    doubleSided: source.doubleSided === undefined ? undefined : Boolean(source.doubleSided),
  }
}

function parseTransform(value: unknown, label: string): SimulationTransform | undefined {
  if (value === undefined) return undefined
  const source = object(value, label)
  return {
    position: optionalVec3(source.position, `${label}.position`),
    rotation: optionalVec3(source.rotation, `${label}.rotation`),
    scale: optionalVec3(source.scale, `${label}.scale`),
  }
}

function parseStructure(value: unknown, index: number): SimulationStructure {
  const label = `structures[${index}]`
  const source = object(value, label)
  const physicsMode = text(source.physicsMode, `${label}.physicsMode`) as PhysicsMode
  if (!['SOFT_BODY', 'KINEMATIC', 'RIGID', 'STATIC'].includes(physicsMode)) {
    throw new Error(`${label}.physicsMode is unsupported`)
  }
  if (!Array.isArray(source.nodeNames) && source.nodeNames !== undefined) {
    throw new Error(`${label}.nodeNames must be an array`)
  }
  const nodeNames = (source.nodeNames as unknown[] | undefined)?.map((item, nodeIndex) =>
    text(item, `${label}.nodeNames[${nodeIndex}]`),
  )
  const labelId = source.labelId === null || source.labelId === undefined ? null : Number(source.labelId)
  if (labelId !== null && (!Number.isInteger(labelId) || labelId < 0)) {
    throw new Error(`${label}.labelId must be a non-negative integer`)
  }
  return {
    id: text(source.id, `${label}.id`),
    name: text(source.name, `${label}.name`),
    type: text(source.type, `${label}.type`),
    labelId,
    visualMesh: safeAssetPath(source.visualMesh, `${label}.visualMesh`) as string,
    physicsMesh: safeAssetPath(source.physicsMesh, `${label}.physicsMesh`, true),
    binding: safeAssetPath(source.binding, `${label}.binding`, true),
    nodeNames,
    deformable: Boolean(source.deformable),
    visible: source.visible !== false,
    physicsMode,
    materialProfile: source.materialProfile === null || source.materialProfile === undefined
      ? null
      : text(source.materialProfile, `${label}.materialProfile`),
    material: parseMaterial(source.material, `${label}.material`),
    transform: parseTransform(source.transform, `${label}.transform`),
    metadata: source.metadata === undefined ? {} : object(source.metadata, `${label}.metadata`),
  }
}

export function parseSimulationManifest(value: unknown): SimulationManifest {
  const source = object(value, 'manifest')
  if (source.schemaVersion !== '1.0') throw new Error('Unsupported simulation manifest version')
  if (source.coordinateSystem !== 'GLTF_Y_UP' || source.units !== 'meter') {
    throw new Error('Simulation assets must use glTF Y-up coordinates in meters')
  }
  if (!Array.isArray(source.structures) || source.structures.length === 0) {
    throw new Error('manifest.structures must contain at least one structure')
  }
  const structures = source.structures.map(parseStructure)
  const ids = new Set<string>()
  for (const structure of structures) {
    if (ids.has(structure.id)) throw new Error(`Duplicate structure id: ${structure.id}`)
    ids.add(structure.id)
  }
  return {
    schemaVersion: '1.0',
    id: text(source.id, 'manifest.id'),
    caseId: text(source.caseId ?? source.id, 'manifest.caseId'),
    name: text(source.name, 'manifest.name'),
    coordinateSystem: 'GLTF_Y_UP',
    units: 'meter',
    structures,
    metadata: source.metadata === undefined ? {} : object(source.metadata, 'manifest.metadata'),
    sourceToSimulation: source.sourceToSimulation === undefined
      ? undefined
      : (() => {
          if (!Array.isArray(source.sourceToSimulation) || source.sourceToSimulation.length !== 16
            || source.sourceToSimulation.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
            throw new Error('manifest.sourceToSimulation must contain 16 finite numbers')
          }
          return [...source.sourceToSimulation] as number[]
        })(),
  }
}
