import { request } from './client'
import { parseSimulationManifest } from '@/simulation/manifest'
import type { SimulationManifest } from '@/simulation/types'

export type SimulationJobStatus = 'PENDING' | 'SEGMENTING' | 'MESH_PROCESSING' | 'READY' | 'FAILED'

export interface SimulationJob {
  id: string
  imageId: string
  status: SimulationJobStatus
  progress: number
  errorMessage?: string | null
}

export async function loadSimulationManifest(url: string, signal?: AbortSignal): Promise<SimulationManifest> {
  const response = url.startsWith('/api/')
    ? await request(url, { signal })
    : await fetch(url, { signal, credentials: 'same-origin' })
  if (!response.ok) throw new Error(`Simulation manifest failed to load (${response.status})`)
  return parseSimulationManifest(await response.json())
}
