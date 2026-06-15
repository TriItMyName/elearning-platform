/** Backend trả role dạng STUDENT, TEACHER, ADMIN — so sánh không phân biệt hoa thường. */
export function canAccessAdminPanel(roles?: string[]): boolean {
  if (!roles?.length) return false
  return roles.some((role) => role.toLowerCase() !== 'student')
}

export function hasAnyRole(userRoles: string[] | undefined, allowed: string[]): boolean {
  if (!userRoles?.length) return false
  const normalized = userRoles.map((r) => r.toLowerCase())
  return allowed.some((role) => normalized.includes(role.toLowerCase()))
}
