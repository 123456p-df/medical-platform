import { api } from './client'
import type { ReportTemplate, ReportTemplateField } from '@/types'

interface ReportTemplateDTO {
  template_id: string
  name: string
  modality: 'CT' | 'MRI' | 'X-Ray' | null
  organ_id: string | null
  version: number
  is_active: boolean
  fields: ReportTemplateField[]
  created_at: string
  updated_at: string
}

function mapTemplate(item: ReportTemplateDTO): ReportTemplate {
  return {
    id: item.template_id,
    name: item.name,
    modality: item.modality,
    organId: item.organ_id,
    version: item.version,
    isActive: item.is_active,
    fields: item.fields,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export const reportTemplatesApi = {
  async list(query: { modality?: string; organId?: string; activeOnly?: boolean } = {}): Promise<ReportTemplate[]> {
    const params = new URLSearchParams()
    if (query.modality) params.set('modality', query.modality)
    if (query.organId) params.set('organ_id', query.organId)
    if (query.activeOnly !== undefined) params.set('active_only', String(query.activeOnly))
    const suffix = params.size ? `?${params.toString()}` : ''
    return (await api<ReportTemplateDTO[]>('/report-templates' + suffix)).map(mapTemplate)
  },
  async get(id: string): Promise<ReportTemplate> {
    return mapTemplate(await api<ReportTemplateDTO>('/report-templates/' + id))
  },
  async create(input: { name: string; modality: ReportTemplate['modality']; organId: string | null; fields: ReportTemplateField[] }): Promise<ReportTemplate> {
    return mapTemplate(await api<ReportTemplateDTO>('/report-templates', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        modality: input.modality,
        organ_id: input.organId,
        fields: input.fields,
      }),
    }))
  },
  async update(id: string, input: Partial<{ name: string; modality: ReportTemplate['modality']; organId: string | null; fields: ReportTemplateField[]; isActive: boolean }>): Promise<ReportTemplate> {
    return mapTemplate(await api<ReportTemplateDTO>('/report-templates/' + id, {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        modality: input.modality,
        organ_id: input.organId,
        fields: input.fields,
        is_active: input.isActive,
      }),
    }))
  },
}
