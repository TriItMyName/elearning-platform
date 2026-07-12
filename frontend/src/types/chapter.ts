export interface Chapter {
  id: number
  courseId: number
  title: string
  orderIndex: number
}

export interface CreateChapterPayload {
  title: string
  orderIndex: number
}

export interface UpdateChapterPayload extends CreateChapterPayload {}

export interface ReorderChaptersPayload {
  chapterIds: number[]
}
