export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface CreateCategoryPayload {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {}
