import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface SceneFrameStats {
  fps: number
}

export class SceneManager {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(38, 1, 0.001, 100)
  readonly renderer: THREE.WebGLRenderer
  readonly controls: OrbitControls
  private readonly resizeObserver: ResizeObserver
  private readonly pmrem: THREE.PMREMGenerator
  private frame = 0
  private disposed = false
  private framesSinceSample = 0
  private lastSample = performance.now()
  private statsListener?: (stats: SceneFrameStats) => void

  constructor(private readonly host: HTMLElement) {
    this.scene.background = new THREE.Color('#071418')
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = false
    this.host.appendChild(this.renderer.domElement)

    this.camera.position.set(1.7, 0.55, 2.8)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 0.2
    this.controls.maxDistance = 8
    this.controls.target.set(0, 0.35, 0)

    this.scene.add(new THREE.HemisphereLight(0xeafcff, 0x172126, 1.6))
    const key = new THREE.DirectionalLight(0xfff1e4, 3.2)
    key.position.set(2.5, 4, 3)
    this.scene.add(key)
    const rim = new THREE.DirectionalLight(0x8fe5ff, 2.0)
    rim.position.set(-3, 1.5, -2)
    this.scene.add(rim)
    this.scene.add(new THREE.GridHelper(5, 20, 0x24424a, 0x183039))

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.host)
    this.resize()
    this.animate()
  }

  setStatsListener(listener: (stats: SceneFrameStats) => void) {
    this.statsListener = listener
  }

  setInteractionLocked(locked: boolean) {
    this.controls.enabled = !locked
  }

  fitTo(box: THREE.Box3) {
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const radius = Math.max(size.length() * 0.55, 0.25)
    this.controls.target.copy(center)
    this.camera.position.copy(center).add(new THREE.Vector3(radius * 1.15, radius * 0.3, radius * 1.9))
    this.camera.near = Math.max(radius / 1000, 0.001)
    this.camera.far = Math.max(radius * 20, 20)
    this.camera.updateProjectionMatrix()
    this.controls.saveState()
    this.controls.update()
  }

  resetCamera() {
    this.controls.reset()
  }

  render() {
    if (!this.disposed) this.renderer.render(this.scene, this.camera)
  }

  private resize() {
    const width = Math.max(this.host.clientWidth, 1)
    const height = Math.max(this.host.clientHeight, 1)
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  private animate = () => {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.framesSinceSample++
    const now = performance.now()
    if (now - this.lastSample >= 500) {
      this.statsListener?.({ fps: this.framesSinceSample * 1000 / (now - this.lastSample) })
      this.framesSinceSample = 0
      this.lastSample = now
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.controls.dispose()
    this.pmrem.dispose()
    if (this.scene.environment instanceof THREE.Texture) this.scene.environment.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
