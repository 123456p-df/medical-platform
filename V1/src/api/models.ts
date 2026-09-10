import { mockOrganModels } from '@/data/mockData'
import { delay } from './client'
import type { OrganModel } from '@/types'

export const modelApi = {
  async getOrganModels(): Promise<OrganModel[]> {
    return delay(mockOrganModels)
  },
}
