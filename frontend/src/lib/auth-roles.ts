/** Backend trả role dạng STUDENT, TEACHER, ADMIN - so sánh không phân biệt hoa thường. */
function normalizeRoles(roles?: string[]) {
  return roles?.map((role) => role.toLowerCase()) ?? []
}

export function isAdminRole(roles?: string[]): boolean {
  if (!roles?.length) return false
  return normalizeRoles(roles).includes('admin')
}

export function isTeacherRole(roles?: string[]): boolean {
  if (!roles?.length) return false
  return normalizeRoles(roles).includes('teacher')
}

export function canAccessAdminPanel(roles?: string[]): boolean {
  return isAdminRole(roles)
}

export function canAccessTeacherPanel(roles?: string[]): boolean {
  return isAdminRole(roles) || isTeacherRole(roles)
}

export function isTeacherOnly(roles?: string[]): boolean {
  return isTeacherRole(roles) && !isAdminRole(roles)
}

export function getManagementPath(roles?: string[]): string | null {
  if (isAdminRole(roles)) return '/admin'
  if (isTeacherRole(roles)) return '/teacher'
  return null
}

export function hasAnyRole(userRoles: string[] | undefined, allowed: string[]): boolean {
  if (!userRoles?.length) return false
  const normalized = normalizeRoles(userRoles)
  return allowed.some((role) => normalized.includes(role.toLowerCase()))
}
