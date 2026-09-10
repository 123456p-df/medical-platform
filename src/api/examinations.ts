import { api, collection } from './client'
import { mapImage, type ImageDTO } from './mappers'
export const examinationApi = {
  async getExaminationsByPatient(id: string) { return (await collection<ImageDTO>('/patients/' + id + '/medical-images')).map(mapImage) },
  async getExaminationById(id: string) { return mapImage(await api<ImageDTO>('/medical-images/' + id)) },
  async uploadStudy(patientId: string, file: File, organId: string, imageType: 'CT' | 'MRI', studyDate: string) {
    const form = new FormData()
    form.append('file', file)
    form.append('organ_id', organId)
    form.append('image_type', imageType)
    if (studyDate) form.append('study_date', studyDate)
    return mapImage(await api<ImageDTO>('/patients/' + patientId + '/medical-images', {
      method: 'POST',
      body: form,
    }))
  },
}
