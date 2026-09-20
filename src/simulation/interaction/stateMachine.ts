import type { InteractionMode, SurfacePoint } from '../types'

export class IncisionStateMachine {
  mode: InteractionMode = 'SELECT_FIRST_POINT'
  pointA: SurfacePoint | null = null
  pointB: SurfacePoint | null = null

  select(point: SurfacePoint): InteractionMode {
    if (this.mode === 'SELECT_FIRST_POINT' || this.mode === 'DRAG') {
      this.pointA = point
      this.pointB = null
      this.mode = 'SELECT_SECOND_POINT'
      return this.mode
    }
    if (this.mode === 'SELECT_SECOND_POINT') {
      if (this.pointA?.meshId !== point.meshId) throw new Error('Both incision points must be on the same surface')
      if (this.pointA.vertexId === point.vertexId) throw new Error('Choose two distinct surface points')
      this.pointB = point
      this.mode = 'PREVIEW_CUT'
      return this.mode
    }
    return this.mode
  }

  beginCut() {
    if (this.mode !== 'PREVIEW_CUT' || !this.pointA || !this.pointB) {
      throw new Error('Two valid surface points are required before cutting')
    }
    this.mode = 'CUT_PENDING'
  }

  completePrediction() {
    if (this.mode !== 'CUT_PENDING') throw new Error('No cut prediction is in progress')
    this.mode = 'DRAG'
  }

  failPrediction() {
    if (this.mode === 'CUT_PENDING') this.mode = 'PREVIEW_CUT'
  }

  commitAuthoritativeCut() {
    if (!['CUT_PENDING', 'DRAG'].includes(this.mode)) throw new Error('No authoritative cut is pending')
    this.mode = 'CUT_COMMITTED'
  }

  reset() {
    this.mode = 'SELECT_FIRST_POINT'
    this.pointA = null
    this.pointB = null
  }
}
