export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED'

export interface AdminUser {
  id: number
  username: string
  fullName: string
  email: string
  isActive: boolean | null
  status: UserStatus
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  username: string
  fullName: string
  email: string
  password: string
  role?: string
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
}

export interface UpdateUserStatusPayload {
  status: UserStatus
}

export interface AdminRole {
  id: number
  name: string
  permissions: string[]
}

export interface CreateRolePayload {
  name: string
}

export interface UpdateRolePayload {
  name: string
}

export interface AssignRolesPayload {
  roleIds: number[]
}

export interface AdminPermission {
  id: number
  name: string
  description: string | null
}

export interface AssignPermissionsPayload {
  permissionIds: number[]
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface CreateCategoryPayload {
  name: string
  description?: string
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
}

export interface UsersQueryParams {
  keyword?: string
  userStatus?: UserStatus
  role?: string
  page?: number
  size?: number
}
