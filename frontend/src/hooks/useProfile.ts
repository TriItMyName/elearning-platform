import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { profileApi, type UpdateProfilePayload } from '@/api/profile.api'
import { tokenService } from '@/auth/token.service'
import type { AuthUser } from '@/types/auth'

export const profileQueryKey = ['profile'] as const

function toAuthUser(profile: Awaited<ReturnType<typeof profileApi.getProfile>>): AuthUser {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName,
    active: profile.active,
  }
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: () => profileApi.getProfile(),
    enabled,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile)
      tokenService.setUser(toAuthUser(profile))
    },
  })
}
