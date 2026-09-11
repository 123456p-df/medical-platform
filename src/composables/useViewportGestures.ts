import { ref, computed } from 'vue'

export type MedicalTool = 'pointer' | 'crosshairs' | 'ww_wl' | 'pan' | 'ruler' | 'probe'

// Shared active tool across all medical viewports
export const activeMedicalTool = ref<MedicalTool>('crosshairs')

let isSpaceDown = false
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      isSpaceDown = true
    }
  })
  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpaceDown = false
    }
  })
}

export function useViewportGestures(options?: {
  initialZoom?: number
  onWindowChange?: (center: number, width: number) => void
  onSliceScroll?: (delta: number) => void
  onCrosshairMove?: (canvasX: number, canvasY: number) => void
  onProbeMove?: (canvasX: number, canvasY: number) => void
  onRulerStart?: (canvasX: number, canvasY: number) => void
  onRulerMove?: (canvasX: number, canvasY: number) => void
  onRulerEnd?: (canvasX: number, canvasY: number) => void
  onDoubleTap?: () => void
}) {
  const zoom = ref(options?.initialZoom ?? 1)
  const pan = ref({ x: 0, y: 0 })

  // Current window level and width
  const windowCenter = ref<number | null>(null)
  const windowWidth = ref<number | null>(null)

  // Dragging state
  const isDragging = ref(false)
  const dragMode = ref<'none' | 'ww_wl' | 'pan' | 'crosshairs' | 'ruler'>('none')
  const dragStart = ref({ x: 0, y: 0 })
  const startWindow = ref({ center: 0, width: 0 })
  const startPan = ref({ x: 0, y: 0 })

  let lastClickTime = 0

  function resetPanZoom() {
    pan.value = { x: 0, y: 0 }
    zoom.value = 1
  }

  function setWindow(center: number, width: number) {
    windowCenter.value = center
    windowWidth.value = width
    options?.onWindowChange?.(center, width)
  }

  function handlePointerDown(event: PointerEvent, canvasRect: DOMRect) {
    // Detect double click (within 280ms)
    const now = Date.now()
    if (event.button === 0 && now - lastClickTime < 280) {
      options?.onDoubleTap?.()
      lastClickTime = 0
      return
    }
    lastClickTime = now

    const clientX = event.clientX
    const clientY = event.clientY
    const canvasX = clientX - canvasRect.left
    const canvasY = clientY - canvasRect.top

    isDragging.value = true
    dragStart.value = { x: clientX, y: clientY }
    startPan.value = { ...pan.value }
    startWindow.value = {
      center: windowCenter.value ?? 40,
      width: windowWidth.value ?? 400,
    }

    // Determine drag action based on mouse button or active tool
    if (event.button === 2 || activeMedicalTool.value === 'ww_wl') {
      dragMode.value = 'ww_wl'
    } else if (event.button === 1 || activeMedicalTool.value === 'pan' || (event.button === 0 && isSpaceDown)) {
      dragMode.value = 'pan'
    } else if (event.button === 0) {
      if (activeMedicalTool.value === 'crosshairs') {
        dragMode.value = 'crosshairs'
        options?.onCrosshairMove?.(canvasX, canvasY)
      } else if (activeMedicalTool.value === 'ruler') {
        dragMode.value = 'ruler'
        options?.onRulerStart?.(canvasX, canvasY)
      } else if (activeMedicalTool.value === 'probe') {
        options?.onProbeMove?.(canvasX, canvasY)
      }
    }
  }

  function handlePointerMove(event: PointerEvent, canvasRect: DOMRect) {
    const clientX = event.clientX
    const clientY = event.clientY
    const canvasX = clientX - canvasRect.left
    const canvasY = clientY - canvasRect.top

    // Always update probe if inside rect
    if (canvasX >= 0 && canvasX <= canvasRect.width && canvasY >= 0 && canvasY <= canvasRect.height) {
      options?.onProbeMove?.(canvasX, canvasY)
    }

    if (!isDragging.value) return

    const dx = clientX - dragStart.value.x
    const dy = clientY - dragStart.value.y

    if (dragMode.value === 'ww_wl') {
      const sensitivity = 2.5
      const newWidth = Math.max(1, Math.round(startWindow.value.width + dx * sensitivity))
      const newCenter = Math.round(startWindow.value.center - dy * sensitivity)
      windowCenter.value = newCenter
      windowWidth.value = newWidth
      options?.onWindowChange?.(newCenter, newWidth)
    } else if (dragMode.value === 'pan') {
      pan.value = {
        x: startPan.value.x + dx,
        y: startPan.value.y + dy,
      }
    } else if (dragMode.value === 'crosshairs') {
      options?.onCrosshairMove?.(canvasX, canvasY)
    } else if (dragMode.value === 'ruler') {
      options?.onRulerMove?.(canvasX, canvasY)
    }
  }

  function handlePointerUp(event: PointerEvent, canvasRect: DOMRect) {
    if (!isDragging.value) return
    const canvasX = event.clientX - canvasRect.left
    const canvasY = event.clientY - canvasRect.top

    if (dragMode.value === 'ruler') {
      options?.onRulerEnd?.(canvasX, canvasY)
    }

    isDragging.value = false
    dragMode.value = 'none'
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    if (event.ctrlKey || event.metaKey) {
      const factor = event.deltaY < 0 ? 1.1 : 0.9
      zoom.value = Math.max(0.5, Math.min(6, zoom.value * factor))
    } else {
      const delta = Math.sign(event.deltaY)
      if (delta !== 0) {
        options?.onSliceScroll?.(delta)
      }
    }
  }

  const cursorClass = computed(() => {
    if (isDragging.value) {
      if (dragMode.value === 'pan') return 'cursor-grabbing'
      if (dragMode.value === 'ww_wl') return 'cursor-crosshair'
    }
    switch (activeMedicalTool.value) {
      case 'crosshairs': return 'cursor-crosshair'
      case 'ruler': return 'cursor-crosshair'
      case 'probe': return 'cursor-help'
      case 'pan': return 'cursor-grab'
      case 'ww_wl': return 'cursor-move'
      default: return 'cursor-default'
    }
  })

  return {
    activeTool: activeMedicalTool,
    zoom,
    pan,
    windowCenter,
    windowWidth,
    isDragging,
    dragMode,
    cursorClass,
    setWindow,
    resetPanZoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  }
}
