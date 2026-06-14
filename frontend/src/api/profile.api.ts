import { apiClient } from '@/api/client'
import type { ProfileResponse } from '@/types/auth'

export interface UpdateProfilePayload {
  fullName: string
  email: string
}

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const { data } = await apiClient.get<ProfileResponse>('/profile')
    return data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    const { data } = await apiClient.put<ProfileResponse>('/profile', payload)
    return data
  },
}
