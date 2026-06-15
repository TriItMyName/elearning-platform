const prefix = 'wl_enrolled'

function key(userId: number) {
  return `${prefix}:${userId}`
}

export function getEnrolledCourseIds(userId: number): number[] {
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as number[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isEnrolled(userId: number, courseId: number): boolean {
  return getEnrolledCourseIds(userId).includes(courseId)
}

export function enrollCourse(userId: number, courseId: number): number[] {
  const ids = new Set(getEnrolledCourseIds(userId))
  ids.add(courseId)
  const list = Array.from(ids)
  localStorage.setItem(key(userId), JSON.stringify(list))
  return list
}
