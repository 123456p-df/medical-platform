import * as THREE from 'three'
import type { Finding } from '@/types'
import { rasToGltf, voxelToRas } from '@/utils/sliceAxes'

export interface FindingBoxInfo {
  centerGltf: [number, number, number]
  sizeGltf: [number, number, number]
  colorHex: number
  colorCss: string
}

export const FINDING_STATUS_COLORS: Record<string, { hex: number; css: string }> = {
  confirmed: { hex: 0xef4444, css: '#ef4444' }, // Red (High alert)
  pending: { hex: 0xf59e0b, css: '#f59e0b' },   // Amber / Orange
  modified: { hex: 0x06b6d4, css: '#06b6d4' },  // Cyan
  dismissed: { hex: 0x64748b, css: '#64748b' }, // Muted slate gray
}

export function getFindingColor(finding: Finding): { hex: number; css: string } {
  const status = finding.status || 'pending'
  return FINDING_STATUS_COLORS[status] || FINDING_STATUS_COLORS.pending
}

export function calculateFindingBounds(
  finding: Finding,
  affine?: number[][] | null,
): { centerGltf: [number, number, number]; sizeGltf: [number, number, number] } {
  let cx = 0
  let cy = 0
  let cz = 0
  let w = 10
  let h = 10
  let d = 10

  if (finding.boxWorldMm && finding.boxWorldMm.length >= 6) {
    cx = finding.boxWorldMm[0]
    cy = finding.boxWorldMm[1]
    cz = finding.boxWorldMm[2]
    w = Math.max(finding.boxWorldMm[3], 4)
    h = Math.max(finding.boxWorldMm[4], 4)
    d = Math.max(finding.boxWorldMm[5], 4)
  } else if (finding.centerWorldMm && finding.centerWorldMm.length >= 3) {
    cx = finding.centerWorldMm[0]
    cy = finding.centerWorldMm[1]
    cz = finding.centerWorldMm[2]
    const diam = finding.diameterMm && finding.diameterMm > 0 ? finding.diameterMm : 10
    w = h = d = diam
  } else if (finding.centerVoxel && finding.centerVoxel.length >= 3 && affine) {
    const ras = voxelToRas(finding.centerVoxel[0], finding.centerVoxel[1], finding.centerVoxel[2], affine)
    cx = ras[0]
    cy = ras[1]
    cz = ras[2]
    const diam = finding.diameterMm && finding.diameterMm > 0 ? finding.diameterMm : 10
    w = h = d = diam
  }

  // Convert RAS mm to glTF coordinates (meters, Y-up)
  // rasToGltf maps [x, y, z] to [x*0.001, z*0.001, -y*0.001]
  const centerGltf = rasToGltf([cx, cy, cz])
  const sizeGltf: [number, number, number] = [
    Math.max(w * 0.001, 0.004),
    Math.max(d * 0.001, 0.004), // glTF Y is RAS Z
    Math.max(h * 0.001, 0.004), // glTF Z is RAS Y
  ]

  return { centerGltf, sizeGltf }
}

/**
 * Creates corner bracket line geometry for 3D box.
 * Each of 8 corners gets 3 short segments pointing along the 3 axes.
 */
export function createCornerBoxGeometry(
  sx: number,
  sy: number,
  sz: number,
  cornerRatio = 0.3,
): THREE.BufferGeometry {
  const hx = sx / 2
  const hy = sy / 2
  const hz = sz / 2

  const lx = Math.min(hx * cornerRatio * 2, hx * 0.8)
  const ly = Math.min(hy * cornerRatio * 2, hy * 0.8)
  const lz = Math.min(hz * cornerRatio * 2, hz * 0.8)

  const positions: number[] = []

  // Helper to add a line segment
  const addLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
    positions.push(x1, y1, z1, x2, y2, z2)
  }

  // 8 corners: signX, signY, signZ in {-1, 1}
  const signs = [-1, 1]
  for (const sxSign of signs) {
    for (const sySign of signs) {
      for (const szSign of signs) {
        const cx = sxSign * hx
        const cy = sySign * hy
        const cz = szSign * hz

        // Segment along X toward center
        addLine(cx, cy, cz, cx - sxSign * lx, cy, cz)
        // Segment along Y toward center
        addLine(cx, cy, cz, cx, cy - sySign * ly, cz)
        // Segment along Z toward center
        addLine(cx, cy, cz, cx, cy, cz - szSign * lz)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

/**
 * Creates faint full 12-edge box frame geometry
 */
export function createFullBoxGeometry(sx: number, sy: number, sz: number): THREE.BufferGeometry {
  const hx = sx / 2
  const hy = sy / 2
  const hz = sz / 2

  const positions: number[] = [
    // Bottom 4 edges
    -hx, -hy, -hz,  hx, -hy, -hz,
     hx, -hy, -hz,  hx, -hy,  hz,
     hx, -hy,  hz, -hx, -hy,  hz,
    -hx, -hy,  hz, -hx, -hy, -hz,

    // Top 4 edges
    -hx,  hy, -hz,  hx,  hy, -hz,
     hx,  hy, -hz,  hx,  hy,  hz,
     hx,  hy,  hz, -hx,  hy,  hz,
    -hx,  hy,  hz, -hx,  hy, -hz,

    // 4 vertical edges
    -hx, -hy, -hz, -hx,  hy, -hz,
     hx, -hy, -hz,  hx,  hy, -hz,
     hx, -hy,  hz,  hx,  hy,  hz,
    -hx, -hy,  hz, -hx,  hy,  hz,
  ]

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

export interface Finding3DObject extends THREE.Group {
  userData: {
    findingId: string
    finding: Finding
    hitMesh: THREE.Mesh
    isFindingRoot: true
    updateActive: (isActive: boolean) => void
  }
}

/**
 * Builds a complete 3D Finding Group with Dual-Pass depth handling,
 * corners, wireframe, hit testing cube, and center indicator.
 */
export function createFinding3DObject(
  finding: Finding,
  affine?: number[][] | null,
  isActive = false,
): Finding3DObject {
  const group = new THREE.Group() as Finding3DObject
  const { centerGltf, sizeGltf } = calculateFindingBounds(finding, affine)
  const color = getFindingColor(finding)

  const [sx, sy, sz] = sizeGltf
  group.position.set(...centerGltf)

  // 1. Dual-Pass Materials
  // Pass 1: Occluded inside organs (depthFunc: GreaterDepth, faint transparent glow)
  const occludedCornerMat = new THREE.LineBasicMaterial({
    color: color.hex,
    transparent: true,
    opacity: 0.35,
    depthFunc: THREE.GreaterDepth,
    depthWrite: false,
  })

  // Pass 2: Visible in front (depthFunc: LessEqualDepth, bright solid)
  const visibleCornerMat = new THREE.LineBasicMaterial({
    color: color.hex,
    transparent: true,
    opacity: 0.95,
    depthFunc: THREE.LessEqualDepth,
    depthWrite: false,
  })

  // Full faint frame
  const frameMat = new THREE.LineBasicMaterial({
    color: color.hex,
    transparent: true,
    opacity: 0.20,
    depthWrite: false,
  })

  // Geometries
  const cornerGeo = createCornerBoxGeometry(sx, sy, sz, 0.3)
  const fullFrameGeo = createFullBoxGeometry(sx, sy, sz)

  const occludedCorners = new THREE.LineSegments(cornerGeo, occludedCornerMat)
  const visibleCorners = new THREE.LineSegments(cornerGeo, visibleCornerMat)
  const fullFrame = new THREE.LineSegments(fullFrameGeo, frameMat)

  group.add(fullFrame)
  group.add(occludedCorners)
  group.add(visibleCorners)

  // 2. Center cross marker
  const centerRadius = Math.max(Math.min(sx, sy, sz) * 0.08, 0.001)
  const centerDotGeo = new THREE.SphereGeometry(centerRadius, 8, 8)
  const centerDotMat = new THREE.MeshBasicMaterial({
    color: color.hex,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  })
  const centerDot = new THREE.Mesh(centerDotGeo, centerDotMat)
  group.add(centerDot)

  // 3. Invisible Hit-Testing Mesh for Raycasting (Box)
  const hitGeo = new THREE.BoxGeometry(sx, sy, sz)
  const hitMat = new THREE.MeshBasicMaterial({
    visible: false,
  })
  const hitMesh = new THREE.Mesh(hitGeo, hitMat)
  hitMesh.userData = { findingId: finding.id, finding }
  group.add(hitMesh)

  // 4. Pulsing active highlight ring
  const ringRadius = Math.max(sx, sz) * 0.65
  const ringGeo = new THREE.RingGeometry(ringRadius * 0.92, ringRadius, 24)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  // Active state updater
  const updateActive = (active: boolean) => {
    if (active) {
      visibleCornerMat.color.setHex(0xffffff)
      visibleCornerMat.opacity = 1.0
      ringMat.opacity = 0.85
      centerDotMat.color.setHex(0xffffff)
    } else {
      visibleCornerMat.color.setHex(color.hex)
      visibleCornerMat.opacity = 0.95
      ringMat.opacity = 0
      centerDotMat.color.setHex(color.hex)
    }
  }

  updateActive(isActive)

  group.userData = {
    findingId: finding.id,
    finding,
    hitMesh,
    isFindingRoot: true,
    updateActive,
  }

  return group
}
