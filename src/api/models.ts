import { organNames } from './mappers'
import type { OrganModel } from '@/types'
// Schematic navigation catalog. OrganModelViewer loads actual authorized GLB resources.
export const organCatalog: OrganModel[] = Object.entries(organNames).map(([id, label], i) => ({
  id, organ: label, label, color: ['#df8794', '#7c9bc5', '#cc9c62', '#75aaa0'][i % 4],
  description: 'Schematic organ navigation. Select to load records and available models.',
  modelUrl: '', position: [0, 0, 0],
}))
export const modelApi = { async getOrganModels() { return organCatalog } }
