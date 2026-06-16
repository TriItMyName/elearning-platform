const prefix = 'wl_learn_progress'

function key(userId: number, courseId: number) {
  return `${prefix}:${userId}:${courseId}`
}

export function getCompletedLessonIds(userId: number, courseId: number): number[] {
  try {
    const raw = localStorage.getItem(key(userId, courseId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as number[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function markLessonComplete(userId: number, courseId: number, lessonId: number): number[] {
  const current = new Set(getCompletedLessonIds(userId, courseId))
  current.add(lessonId)
  const ids = Array.from(current)
  localStorage.setItem(key(userId, courseId), JSON.stringify(ids))
  return ids
}

export function getLastLessonId(userId: number, courseId: number): number | null {
  const raw = localStorage.getItem(`${key(userId, courseId)}:last`)
  return raw ? Number(raw) : null
}

export function setLastLessonId(userId: number, courseId: number, lessonId: number) {
  localStorage.setItem(`${key(userId, courseId)}:last`, String(lessonId))
}
