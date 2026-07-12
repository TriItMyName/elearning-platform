import { apiClient } from '@/api/client'

export interface UploadImageResponse {
  url: string
}

export const uploadsApi = {
  uploadThumbnail(file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<UploadImageResponse>('/uploads/thumbnail', form).then((r) => r.data)
  },
}
