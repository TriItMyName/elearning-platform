import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type {
  Chapter,
  CreateChapterPayload,
  ReorderChaptersPayload,
  UpdateChapterPayload,
} from '@/types/chapter'
import type {
  Course,
  CreateTeacherCoursePayload,
  UpdateTeacherCoursePayload,
} from '@/types/course'
import type {
  CreateLessonPayload,
  Lesson,
  ReorderLessonsPayload,
  UpdateLessonPayload,
} from '@/types/lesson'
import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  Question,
  Quiz,
  UpdateQuestionPayload,
  UpdateQuizPayload,
} from '@/types/quiz'
import type {
  ImportQuizDocumentPayload,
  TeacherEnrollment,
  TeacherNotification,
  TeacherNotificationPayload,
  TeacherStudentProgress,
  TeacherStudentsQueryParams,
} from '@/types/teacher'

function lessonBasePath(courseId: number, chapterId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/teacher`
}

function quizBasePath(courseId: number, chapterId: number, lessonId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/quizzes/teacher`
}

export const teacherApi = {
  courses: {
    list(params: TeacherStudentsQueryParams = {}) {
      return apiClient
        .get<PageResponse<Course>>('/courses/my-courses', { params })
        .then((r) => r.data)
    },
    create(payload: CreateTeacherCoursePayload) {
      return apiClient.post<Course>('/courses/teacher', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateTeacherCoursePayload) {
      return apiClient.put<Course>(`/courses/teacher/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/courses/teacher/${id}`)
    },
    students(courseId: number) {
      return apiClient
        .get<TeacherEnrollment[]>(`/courses/teacher/${courseId}/students`)
        .then((r) => r.data)
    },
    studentProgress(courseId: number, studentId: number) {
      return apiClient
        .get<TeacherStudentProgress>(`/courses/teacher/${courseId}/students/${studentId}/progress`)
        .then((r) => r.data)
    },
    notifyCourse(courseId: number, payload: TeacherNotificationPayload) {
      return apiClient
        .post<TeacherNotification[]>(`/courses/teacher/${courseId}/notifications`, payload)
        .then((r) => r.data)
    },
    notifyStudent(courseId: number, studentId: number, payload: TeacherNotificationPayload) {
      return apiClient
        .post<TeacherNotification>(
          `/courses/teacher/${courseId}/students/${studentId}/notifications`,
          payload,
        )
        .then((r) => r.data)
    },
  },

  chapters: {
    list(courseId: number, params: TeacherStudentsQueryParams = {}) {
      return apiClient
        .get<PageResponse<Chapter>>(`/courses/${courseId}/chapters`, { params })
        .then((r) => r.data)
    },
    create(courseId: number, payload: CreateChapterPayload) {
      return apiClient
        .post<Chapter>(`/courses/${courseId}/chapters/teacher`, payload)
        .then((r) => r.data)
    },
    update(courseId: number, chapterId: number, payload: UpdateChapterPayload) {
      return apiClient
        .put<Chapter>(`/courses/${courseId}/chapters/teacher/${chapterId}`, payload)
        .then((r) => r.data)
    },
    delete(courseId: number, chapterId: number) {
      return apiClient.delete(`/courses/${courseId}/chapters/teacher/${chapterId}`)
    },
    reorder(courseId: number, payload: ReorderChaptersPayload) {
      return apiClient
        .patch<Chapter[]>(`/courses/${courseId}/chapters/teacher/reorder`, payload)
        .then((r) => r.data)
    },
  },

  lessons: {
    list(courseId: number, chapterId: number, params: TeacherStudentsQueryParams = {}) {
      return apiClient
        .get<PageResponse<Lesson>>(lessonBasePath(courseId, chapterId), { params })
        .then((r) => r.data)
    },
    create(courseId: number, chapterId: number, payload: CreateLessonPayload) {
      return apiClient.post<Lesson>(lessonBasePath(courseId, chapterId), payload).then((r) => r.data)
    },
    update(courseId: number, chapterId: number, lessonId: number, payload: UpdateLessonPayload) {
      return apiClient
        .put<Lesson>(`${lessonBasePath(courseId, chapterId)}/${lessonId}`, payload)
        .then((r) => r.data)
    },
    delete(courseId: number, chapterId: number, lessonId: number) {
      return apiClient.delete(`${lessonBasePath(courseId, chapterId)}/${lessonId}`)
    },
    reorder(courseId: number, chapterId: number, payload: ReorderLessonsPayload) {
      return apiClient
        .patch<Lesson[]>(`${lessonBasePath(courseId, chapterId)}/reorder`, payload)
        .then((r) => r.data)
    },
    uploadVideo(courseId: number, chapterId: number, lessonId: number, file: File, options?: { signal?: AbortSignal }) {
      const form = new FormData()
      form.append('file', file)
      return apiClient
        .post<Lesson>(`${lessonBasePath(courseId, chapterId)}/${lessonId}/upload-video`, form, {
          signal: options?.signal,
        })
        .then((r) => r.data)
    },
    uploadDocument(courseId: number, chapterId: number, lessonId: number, file: File) {
      const form = new FormData()
      form.append('file', file)
      return apiClient
        .post<Lesson>(`${lessonBasePath(courseId, chapterId)}/${lessonId}/upload-document`, form)
        .then((r) => r.data)
    },
  },

  quizzes: {
    list(courseId: number, chapterId: number, lessonId: number) {
      return apiClient.get<Quiz[]>(quizBasePath(courseId, chapterId, lessonId)).then((r) => r.data)
    },
    create(courseId: number, chapterId: number, lessonId: number, payload: CreateQuizPayload) {
      return apiClient
        .post<Quiz>(quizBasePath(courseId, chapterId, lessonId), payload)
        .then((r) => r.data)
    },
    importDocument(
      courseId: number,
      chapterId: number,
      lessonId: number,
      payload: ImportQuizDocumentPayload,
    ) {
      const form = new FormData()
      form.append('file', payload.file)
      if (payload.timeLimit != null) form.append('timeLimit', String(payload.timeLimit))
      form.append('passScore', String(payload.passScore))
      return apiClient
        .post<Quiz>(`${quizBasePath(courseId, chapterId, lessonId)}/import-document`, form)
        .then((r) => r.data)
    },
    update(
      courseId: number,
      chapterId: number,
      lessonId: number,
      quizId: number,
      payload: UpdateQuizPayload,
    ) {
      return apiClient
        .put<Quiz>(`${quizBasePath(courseId, chapterId, lessonId)}/${quizId}`, payload)
        .then((r) => r.data)
    },
    delete(courseId: number, chapterId: number, lessonId: number, quizId: number) {
      return apiClient.delete(`${quizBasePath(courseId, chapterId, lessonId)}/${quizId}`)
    },
    questions(courseId: number, chapterId: number, lessonId: number, quizId: number) {
      return apiClient
        .get<Question[]>(`${quizBasePath(courseId, chapterId, lessonId)}/${quizId}/questions`)
        .then((r) => r.data)
    },
    createQuestion(
      courseId: number,
      chapterId: number,
      lessonId: number,
      quizId: number,
      payload: CreateQuestionPayload,
    ) {
      return apiClient
        .post<Question>(`${quizBasePath(courseId, chapterId, lessonId)}/${quizId}/questions`, payload)
        .then((r) => r.data)
    },
    updateQuestion(
      courseId: number,
      chapterId: number,
      lessonId: number,
      quizId: number,
      questionId: number,
      payload: UpdateQuestionPayload,
    ) {
      return apiClient
        .put<Question>(
          `${quizBasePath(courseId, chapterId, lessonId)}/${quizId}/questions/${questionId}`,
          payload,
        )
        .then((r) => r.data)
    },
    deleteQuestion(
      courseId: number,
      chapterId: number,
      lessonId: number,
      quizId: number,
      questionId: number,
    ) {
      return apiClient.delete(
        `${quizBasePath(courseId, chapterId, lessonId)}/${quizId}/questions/${questionId}`,
      )
    },
  },
}
