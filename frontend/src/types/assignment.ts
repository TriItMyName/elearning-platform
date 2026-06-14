export interface Assignment {
  id: number
  lessonId: number
  title: string
  description: string | null
  attachmentUrl: string | null
  deadline: string | null
  maxScore: number
  createdAt: string
}

export interface CreateAssignmentPayload {
  title: string
  description?: string
  attachmentUrl?: string
  deadline?: string
  maxScore: number
}

export interface UpdateAssignmentPayload extends CreateAssignmentPayload {}
