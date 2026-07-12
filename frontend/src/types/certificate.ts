export interface Certificate {
  id: number
  courseId: number
  courseTitle: string
  courseSlug: string | null
  studentId: number
  studentName: string
  instructorId: number | null
  instructorName: string | null
  certificateCode: string
  progress: number | null
  issuedAt: string
}

export interface EligibleCertificateCourse {
  courseId: number
  courseTitle: string
  courseSlug: string
  progress: number
}
