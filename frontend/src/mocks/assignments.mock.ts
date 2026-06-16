import type { Assignment, CreateAssignmentPayload, UpdateAssignmentPayload } from '@/types/assignment'

let nextId = 100
const store = new Map<string, Assignment[]>()

function key(courseId: number, chapterId: number, lessonId: number) {
  return `${courseId}:${chapterId}:${lessonId}`
}

function seed(lessonId: number): Assignment[] {
  return [
    {
      id: 1,
      lessonId,
      title: 'Bài tập thực hành',
      description: 'Hoàn thành các bài tập trong tài liệu và nộp link GitHub.',
      attachmentUrl: null,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      maxScore: 10,
      createdAt: new Date().toISOString(),
    },
  ]
}

export const assignmentsMockStore = {
  list(courseId: number, chapterId: number, lessonId: number): Assignment[] {
    const k = key(courseId, chapterId, lessonId)
    if (!store.has(k)) store.set(k, seed(lessonId))
    return [...(store.get(k) ?? [])]
  },

  create(
    courseId: number,
    chapterId: number,
    lessonId: number,
    payload: CreateAssignmentPayload,
  ): Assignment {
    const k = key(courseId, chapterId, lessonId)
    const list = store.get(k) ?? seed(lessonId)
    const item: Assignment = {
      id: nextId++,
      lessonId,
      title: payload.title,
      description: payload.description ?? null,
      attachmentUrl: payload.attachmentUrl ?? null,
      deadline: payload.deadline ?? null,
      maxScore: payload.maxScore,
      createdAt: new Date().toISOString(),
    }
    store.set(k, [...list, item])
    return item
  },

  update(
    courseId: number,
    chapterId: number,
    lessonId: number,
    assignmentId: number,
    payload: UpdateAssignmentPayload,
  ): Assignment {
    const k = key(courseId, chapterId, lessonId)
    const list = assignmentsMockStore.list(courseId, chapterId, lessonId)
    const idx = list.findIndex((a) => a.id === assignmentId)
    if (idx < 0) throw new Error('Assignment not found')
    const updated: Assignment = {
      ...list[idx],
      title: payload.title,
      description: payload.description ?? null,
      attachmentUrl: payload.attachmentUrl ?? null,
      deadline: payload.deadline ?? null,
      maxScore: payload.maxScore,
    }
    list[idx] = updated
    store.set(k, list)
    return updated
  },

  delete(courseId: number, chapterId: number, lessonId: number, assignmentId: number): void {
    const k = key(courseId, chapterId, lessonId)
    const list = assignmentsMockStore.list(courseId, chapterId, lessonId).filter((a) => a.id !== assignmentId)
    store.set(k, list)
  },
}

export const assignmentsMockApi = {
  listByLesson: assignmentsMockStore.list,
  create: assignmentsMockStore.create,
  update: assignmentsMockStore.update,
  delete: assignmentsMockStore.delete,
}
