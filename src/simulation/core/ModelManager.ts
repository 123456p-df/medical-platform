import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { SimulationManifest, SimulationStructure } from '../types'
import { disposeBoundsTreeFor, installBVHAcceleration, rebuildBoundsTree } from './bvh'

export interface LoadedStructure {
  definition: SimulationStructure
  group: THREE.Group
  meshes: THREE.Mesh[]
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material]
  for (const item of materials) {
    for (const value of Object.values(item)) if (value instanceof THREE.Texture) value.dispose()
    item.dispose()
  }
}

export class ModelManager {
  readonly root = new THREE.Group()
  readonly structures = new Map<string, LoadedStructure>()
  private readonly loader = new GLTFLoader()
  private readonly assets = new Map<string, Promise<GLTF>>()

  constructor(private readonly scene: THREE.Scene) {
    installBVHAcceleration()
    this.root.name = 'simulation-models'
    this.scene.add(this.root)
  }

  async load(manifest: SimulationManifest, onProgress?: (completed: number, total: number) => void) {
    this.clear()
    const total = manifest.structures.length
    let completed = 0
    for (const definition of manifest.structures) {
      const loaded = await this.loadStructure(definition)
      this.structures.set(definition.id, loaded)
      this.root.add(loaded.group)
      completed++
      onProgress?.(completed, total)
    }
    return new THREE.Box3().setFromObject(this.root)
  }

  private async asset(url: string) {
    let promise = this.assets.get(url)
    if (!promise) {
      promise = this.loader.loadAsync(url)
      this.assets.set(url, promise)
    }
    return promise
  }

  private async loadStructure(definition: SimulationStructure): Promise<LoadedStructure> {
    const gltf = await this.asset(definition.visualMesh)
    gltf.scene.updateMatrixWorld(true)
    const requested = new Set(definition.nodeNames ?? [])
    const matches: THREE.Mesh[] = []
    gltf.scene.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return
      if (requested.size && !requested.has(child.name)) return
      matches.push(child)
    })
    if (!matches.length) throw new Error(`No mesh nodes found for structure ${definition.id}`)

    const group = new THREE.Group()
    group.name = definition.id
    group.visible = definition.visible
    const transform = definition.transform
    if (transform?.position) group.position.fromArray(transform.position)
    if (transform?.rotation) group.rotation.fromArray([...transform.rotation, 'XYZ'])
    if (transform?.scale) group.scale.fromArray(transform.scale)

    const meshes = matches.map(source => {
      const mesh = source.clone(false)
      mesh.name = `${definition.id}:${source.name}`
      mesh.geometry = source.geometry.clone()
      mesh.geometry.computeVertexNormals()
      rebuildBoundsTree(mesh.geometry)
      mesh.matrix.copy(source.matrixWorld)
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale)
      mesh.matrixAutoUpdate = true
      mesh.userData.structureId = definition.id
      mesh.userData.structureType = definition.type
      mesh.userData.deformable = definition.deformable
      const thicknessMm = Number(definition.metadata.cuttableThicknessMm)
      mesh.userData.cuttableThicknessMeters = Number.isFinite(thicknessMm) && thicknessMm > 0
        ? thicknessMm / 1000
        : undefined
      const opacity = definition.material.opacity ?? 1
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: definition.material.color,
        opacity,
        transparent: opacity < 1,
        depthWrite: opacity >= 0.95,
        roughness: definition.material.roughness ?? 0.45,
        metalness: definition.material.metalness ?? 0,
        clearcoat: definition.type === 'bone' ? 0.1 : 0.35,
        side: definition.material.doubleSided === false ? THREE.FrontSide : THREE.DoubleSide,
      })
      group.add(mesh)
      return mesh
    })
    return { definition, group, meshes }
  }

  getPickableMeshes(type?: string) {
    const meshes: THREE.Mesh[] = []
    for (const structure of this.structures.values()) {
      if (!structure.group.visible || (type && structure.definition.type !== type)) continue
      meshes.push(...structure.meshes.filter(mesh => mesh.visible))
    }
    return meshes
  }

  getStructure(id: string) {
    return this.structures.get(id)
  }

  setVisible(id: string, visible: boolean) {
    const structure = this.structures.get(id)
    if (structure) structure.group.visible = visible
  }

  isolate(id: string | null) {
    for (const [structureId, structure] of this.structures) {
      structure.group.visible = id === null ? structure.definition.visible : structureId === id
    }
  }

  setBodyOpacity(opacity: number) {
    for (const structure of this.structures.values()) {
      if (structure.definition.type !== 'body') continue
      for (const mesh of structure.meshes) {
        const material = mesh.material as THREE.MeshPhysicalMaterial
        material.opacity = opacity
        material.transparent = opacity < 1
        material.depthWrite = opacity >= 0.95
      }
    }
  }

  setSelected(id: string | null) {
    for (const [structureId, structure] of this.structures) {
      for (const mesh of structure.meshes) {
        const material = mesh.material as THREE.MeshPhysicalMaterial
        material.emissive.set(structureId === id ? 0x174956 : 0x000000)
        material.emissiveIntensity = structureId === id ? 0.65 : 0
      }
    }
  }

  clear() {
    for (const structure of this.structures.values()) {
      this.root.remove(structure.group)
      for (const mesh of structure.meshes) {
        disposeBoundsTreeFor(mesh.geometry)
        mesh.geometry.dispose()
        disposeMaterial(mesh.material)
      }
    }
    this.structures.clear()
  }

  dispose() {
    this.clear()
    this.assets.clear()
    this.scene.remove(this.root)
  }
}
