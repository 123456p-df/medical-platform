import { api, collection } from './client'
import { mapImage, type ImageDTO } from './mappers'
export const examinationApi = {
  async getExaminationsByPatient(id: string) { return (await collection<ImageDTO>('/patients/' + id + '/medical-images')).map(mapImage) },
  async getExaminationById(id: string) { return mapImage(await api<ImageDTO>('/medical-images/' + id)) },
}
