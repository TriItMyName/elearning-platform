import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ChevronRight, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'

import { adminApi } from '@/api/admin.api'
import { LessonMediaInput } from '@/components/admin/LessonMediaInput'
import {
  AdminBadge,
  AdminCard,
  AdminIconButton,
  AdminListItem,
  AdminModal,
  AdminModalFooter,
  AdminNativeSelect,
  AdminPageHeader,
  AdminPanel,
  AdminPickerRow,
  AdminPickerSection,
  AdminStepper,
  AdminTextarea,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useVideoUploadExitGuard } from '@/hooks/useVideoUploadExitGuard'
import { useAdminCourseRoute } from '@/hooks/useAdminCourseRoute'
import { getErrorMessage } from '@/lib/errors'
import { DOCUMENT_ACCEPT, validateDocumentFile, validateVideoFile, VIDEO_ACCEPT } from '@/lib/file-upload'
import {
  DOCUMENT_URL_HINT,
  validateDocumentLessonUrl,
} from '@/lib/media-url'
import { notify } from '@/lib/notify'
import type { AdminChapter as Chapter, AdminLesson as Lesson } from '@/types/admin-course'
import { LESSON_TYPE_LABEL, LESSON_TYPE_OPTIONS } from '@/types/lesson'

const STEPS = [
  { id: 'course', label: 'Khóa học' },
  { id: 'workspace', label: 'Chương & bài học' },
]

export function AdminLessonsPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const { courseId: routeCourseId, isCourseScoped } = useAdminCourseRoute()
  const [courseId, setCourseId] = useState<number | null>(routeCourseId)
  const [chapterId, setChapterId] = useState<number | null>(null)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editChapter, setEditChapter] = useState<Chapter | null>(null)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['courses', 'admin-lessons'],
    queryFn: () => adminApi.courses.list({ page: 0, size: 100 }),
    enabled: !isCourseScoped,
  })

  const chaptersQuery = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => adminApi.chapters.list({ courseId: courseId!, page: 0, size: 100 }),
    enabled: courseId != null,
  })

  const lessonsQuery = useQuery({
    queryKey: ['lessons', courseId, chapterId],
    queryFn: () => adminApi.lessons.list({ chapterId: chapterId!, page: 0, size: 100 }),
    enabled: courseId != null && chapterId != null,
  })

  const queryClient = useQueryClient()

  const deleteChapterMutation = useMutation({
    mutationFn: (id: number) => adminApi.chapters.delete(id),
    onSuccess: () => {
      notify.success('Xóa chương thành công')
      void queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
      setChapterId(null)
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => adminApi.lessons.delete(id),
    onSuccess: () => {
      notify.success('Xóa bài học thành công')
      void queryClient.invalidateQueries({ queryKey: ['lessons', courseId, chapterId] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const deletedChaptersQuery = useQuery({
    queryKey: ['admin', 'chapters', 'deleted'],
    queryFn: () => adminApi.chapters.listDeleted({ page: 0, size: 200 }),
    enabled: courseId != null,
  })

  const deletedLessonsQuery = useQuery({
    queryKey: ['admin', 'lessons', 'deleted'],
    queryFn: () => adminApi.lessons.listDeleted({ page: 0, size: 200 }),
    enabled: courseId != null,
  })

  const restoreChapterMutation = useMutation({
    mutationFn: (id: number) => adminApi.chapters.restore(id),
    onSuccess: () => {
      notify.success('Khôi phục chương thành công')
      void queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'chapters', 'deleted'] })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const restoreLessonMutation = useMutation({
    mutationFn: (id: number) => adminApi.lessons.restore(id),
    onSuccess: () => {
      notify.success('Khôi phục bài học thành công')
      void queryClient.invalidateQueries({ queryKey: ['lessons', courseId, chapterId] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', 'deleted'] })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const courses = coursesQuery.data?.content ?? []
  const chapters = chaptersQuery.data?.content ?? []
  const lessons = lessonsQuery.data?.content ?? []
  const deletedChapters = (deletedChaptersQuery.data?.content ?? []).filter(
    (chapter) => chapter.courseId === courseId,
  )
  const courseChapterIds = new Set([
    ...chapters.map((chapter) => chapter.id),
    ...deletedChapters.map((chapter) => chapter.id),
  ])
  const deletedLessons = (deletedLessonsQuery.data?.content ?? []).filter((lesson) =>
    courseChapterIds.has(lesson.chapterId),
  )

  const selectedCourse = courses.find((c) => c.id === courseId)
  const selectedChapter = chapters.find((c) => c.id === chapterId)

  const currentStep = courseId ? 'workspace' : 'course'
  const stepIndex = currentStep === 'course' ? 0 : 1

  useEffect(() => {
    if (routeCourseId != null) setCourseId(routeCourseId)
  }, [routeCourseId])

  useEffect(() => {
    if (!courseId || chapters.length === 0) return
    if (chapterId == null || !chapters.some((c) => c.id === chapterId)) {
      setChapterId(chapters[0].id)
    }
  }, [courseId, chapters, chapterId])

  return (
    <div>
      {!isCourseScoped ? (
        <AdminPageHeader
          title="Bài học & chương"
          description="Chọn khóa học, quản lý chương và bài học bên trong. Luồng: khóa học → chương & bài học."
        />
      ) : null}

      {!isCourseScoped ? (
        <AdminCard className="mb-6" padding>
          <AdminStepper steps={STEPS} currentIndex={stepIndex} />

          {currentStep === 'workspace' && selectedCourse ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ececec] pt-4 text-sm">
              <span className="text-[#6b7280]">Đang quản lý:</span>
              <button
                type="button"
                onClick={() => {
                  setCourseId(null)
                  setChapterId(null)
                }}
                className="font-medium text-[#f05123] hover:underline"
              >
                {selectedCourse.title}
              </button>
              {selectedChapter ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-[#d1d5db]" />
                  <span className="font-medium text-[#111827]">{selectedChapter.title}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      {!isCourseScoped && currentStep === 'course' ? (
        <AdminPickerSection
          title="Bước 1 — Chọn khóa học"
          description="Chương và bài học được tổ chức theo từng khóa."
          loading={coursesQuery.isLoading}
          isEmpty={courses.length === 0}
          empty="Chưa có khóa học nào."
        >
          {courses.map((course) => (
            <AdminPickerRow
              key={course.id}
              icon={BookOpen}
              title={course.title}
              meta={course.slug}
              onClick={() => setCourseId(course.id)}
            />
          ))}
        </AdminPickerSection>
      ) : null}

      {currentStep === 'workspace' && courseId ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,320px)_1fr]">
          <AdminPanel
            title="Chương học"
            action={
              <Button size="sm" onClick={() => setChapterModalOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
              </Button>
            }
          >
            {chaptersQuery.isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải chương...</p>
            ) : chapters.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-[#6b7280]">Khóa này chưa có chương.</p>
                <Button size="sm" className="mt-3" onClick={() => setChapterModalOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tạo chương đầu tiên
                </Button>
              </div>
            ) : (
              chapters.map((ch) => (
                <AdminListItem
                  key={ch.id}
                  active={chapterId === ch.id}
                  onClick={() => setChapterId(ch.id)}
                  actions={
                    <>
                      <AdminIconButton title="Sửa chương" onClick={() => setEditChapter(ch)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </AdminIconButton>
                      <AdminIconButton
                        title="Xóa chương"
                        variant="danger"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Xóa chương',
                            description: `Bạn có chắc muốn xóa chương "${ch.title}"? Toàn bộ bài học bên trong cũng sẽ bị xóa.`,
                            confirmLabel: 'Xóa',
                          })
                          if (ok) deleteChapterMutation.mutate(ch.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </AdminIconButton>
                    </>
                  }
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{ch.title}</span>
                    <span className="text-xs text-[#9ca3af]">Thứ tự {ch.orderIndex}</span>
                  </span>
                </AdminListItem>
              ))
            )}
          </AdminPanel>

          <AdminPanel
            title={`Bài học (${lessons.length})`}
            action={
              <Button size="sm" disabled={!chapterId} onClick={() => setLessonModalOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm bài học
              </Button>
            }
          >
              {!chapterId ? (
                <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Chọn một chương bên trái.</p>
              ) : lessonsQuery.isLoading ? (
                <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải bài học...</p>
              ) : lessons.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-[#6b7280]">Chương này chưa có bài học.</p>
                  <Button size="sm" className="mt-3" onClick={() => setLessonModalOpen(true)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Thêm bài học đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#f3f4f6]">
                  {lessons.map((lesson, index) => (
                    <LessonCard
                      key={lesson.id}
                      index={index}
                      lesson={lesson}
                      onEdit={() => setEditLesson(lesson)}
                      onDelete={async () => {
                        const ok = await confirm({
                          title: 'Xóa bài học',
                          description: `Bạn có chắc muốn xóa bài "${lesson.title}"?`,
                          confirmLabel: 'Xóa',
                        })
                        if (ok) deleteLessonMutation.mutate(lesson.id)
                      }}
                    />
                  ))}
                </div>
              )}
            </AdminPanel>
        </div>
      ) : null}

      {courseId && (deletedChapters.length > 0 || deletedLessons.length > 0) ? (
        <AdminCard className="mt-6" padding>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-[#374151]">
              Thùng rác nội dung ({deletedChapters.length + deletedLessons.length})
            </summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Chương</p>
                <div className="space-y-2">
                  {deletedChapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2">
                      <span className="text-sm text-[#374151]">{chapter.title}</span>
                      <AdminIconButton title="Khôi phục chương" onClick={() => restoreChapterMutation.mutate(chapter.id)}>
                        <RotateCcw className="h-4 w-4" />
                      </AdminIconButton>
                    </div>
                  ))}
                  {deletedChapters.length === 0 ? <p className="text-xs text-[#9ca3af]">Không có chương đã xóa.</p> : null}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Bài học</p>
                <div className="space-y-2">
                  {deletedLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2">
                      <span className="text-sm text-[#374151]">{lesson.title}</span>
                      <AdminIconButton title="Khôi phục bài học" onClick={() => restoreLessonMutation.mutate(lesson.id)}>
                        <RotateCcw className="h-4 w-4" />
                      </AdminIconButton>
                    </div>
                  ))}
                  {deletedLessons.length === 0 ? <p className="text-xs text-[#9ca3af]">Không có bài học đã xóa.</p> : null}
                </div>
              </div>
            </div>
          </details>
        </AdminCard>
      ) : null}

      {courseId && chapterModalOpen ? (
        <ChapterFormModal
          open
          courseId={courseId}
          nextOrder={chapters.length}
          onClose={() => setChapterModalOpen(false)}
        />
      ) : null}
      {courseId && editChapter ? (
        <ChapterFormModal open courseId={courseId} initial={editChapter} onClose={() => setEditChapter(null)} />
      ) : null}
      {courseId && chapterId && lessonModalOpen ? (
        <LessonFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          nextOrder={lessons.length}
          onClose={() => setLessonModalOpen(false)}
        />
      ) : null}
      {courseId && chapterId && editLesson ? (
        <LessonFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          initial={editLesson}
          onClose={() => setEditLesson(null)}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function LessonCard({
  index,
  lesson,
  onEdit,
  onDelete,
}: {
  index: number
  lesson: Lesson
  onEdit: () => void
  onDelete: () => void
}) {
  const typeLabel = LESSON_TYPE_LABEL[lesson.lessonType] ?? 'Bài học'

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-[#9ca3af]">Bài {index + 1}</p>
            <AdminBadge>{typeLabel}</AdminBadge>
            <AdminBadge>Thứ tự {lesson.orderIndex}</AdminBadge>
          </div>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#111827]">{lesson.title}</p>
          {lesson.videoUrl ? (
            <p className="mt-1 truncate text-xs text-[#6b7280]">Video: {lesson.videoUrl}</p>
          ) : null}
          {lesson.content ? (
            <p className="mt-1 line-clamp-2 text-xs text-[#9ca3af]">{lesson.content}</p>
          ) : null}
          {lesson.documentUrl ? (
            <a
              href={lesson.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-medium text-[#f05123] hover:underline"
            >
              Mở tài liệu
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <AdminIconButton title="Sửa bài học" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </AdminIconButton>
          <AdminIconButton title="Xóa bài học" variant="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </AdminIconButton>
        </div>
      </div>
    </div>
  )
}

function ChapterFormModal({
  open,
  courseId,
  initial,
  nextOrder = 0,
  onClose,
}: {
  open: boolean
  courseId: number
  initial?: Chapter
  nextOrder?: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setOrderIndex(initial?.orderIndex ?? nextOrder)
  }, [open, initial, nextOrder])

  const mutation = useMutation({
    mutationFn: () =>
      initial
        ? adminApi.chapters.update(initial.id, { courseId, title, orderIndex })
        : adminApi.chapters.create({ courseId, title, orderIndex }),
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật chương thành công' : 'Tạo chương thành công')
      void queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa chương' : 'Thêm chương'}
      description="Đặt tên và thứ tự hiển thị của chương trong khóa học."
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!title.trim()}
          submitLabel={initial ? 'Lưu' : 'Thêm chương'}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề chương" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          label="Thứ tự"
          type="number"
          min={0}
          value={String(orderIndex)}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
        />
      </div>
    </AdminModal>
  )
}

function LessonFormModal({
  open,
  courseId,
  chapterId,
  initial,
  nextOrder = 0,
  onClose,
}: {
  open: boolean
  courseId: number
  chapterId: number
  initial?: Lesson
  nextOrder?: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const guardVideoUploadExit = useVideoUploadExitGuard(confirm)
  const [form, setForm] = useState({
    title: '',
    lessonType: 0,
    content: '',
    videoUrl: '',
    documentUrl: '',
    orderIndex: 0,
  })
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      title: initial?.title ?? '',
      lessonType: initial?.lessonType ?? 0,
      content: initial?.content ?? '',
      videoUrl: initial?.videoUrl ?? '',
      documentUrl: initial?.documentUrl ?? '',
      orderIndex: initial?.orderIndex ?? nextOrder,
    })
    setPendingFile(null)
  }, [open, initial, nextOrder])

  const invalidateLessons = () => {
    void queryClient.invalidateQueries({ queryKey: ['lessons', courseId, chapterId] })
  }

  const uploadVideoMutation = useMutation({
    mutationFn: (file: File) => adminApi.lessons.uploadVideo(initial!.id, file),
    onSuccess: (lesson) => {
      notify.success('Tải video lên thành công')
      if (open) {
        setForm((current) => ({ ...current, videoUrl: lesson.videoUrl ?? '' }))
      }
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: (file: File) => adminApi.lessons.uploadDocument(initial!.id, file),
    onSuccess: (lesson) => {
      notify.success('Tải tài liệu lên thành công')
      setForm((current) => ({ ...current, documentUrl: lesson.documentUrl ?? '' }))
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const handleFileSelect = (file: File) => {
    if (form.lessonType === 0) {
      const error = validateVideoFile(file)
      if (error) {
        notify.error(error)
        return
      }
      if (initial) {
        uploadVideoMutation.mutate(file)
        return
      }
      setPendingFile(file)
      return
    }

    if (form.lessonType === 1) {
      const error = validateDocumentFile(file)
      if (error) {
        notify.error(error)
        return
      }
      if (initial) {
        uploadDocumentMutation.mutate(file)
        return
      }
      setPendingFile(file)
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        lessonType: form.lessonType,
        content: form.content || undefined,
        videoUrl: form.lessonType === 0 && initial ? form.videoUrl || undefined : undefined,
        documentUrl: form.lessonType === 1 ? form.documentUrl || undefined : undefined,
        orderIndex: form.orderIndex,
      }

      if (initial) {
        return adminApi.lessons.update(initial.id, { ...payload, chapterId })
      }

      const created = await adminApi.lessons.create({ ...payload, chapterId })
      if (!pendingFile) return created

      if (form.lessonType === 0) {
        return adminApi.lessons.uploadVideo(created.id, pendingFile)
      }
      if (form.lessonType === 1) {
        return adminApi.lessons.uploadDocument(created.id, pendingFile)
      }
      return created
    },
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật bài học thành công' : 'Tạo bài học thành công')
      invalidateLessons()
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const saveMetadataMutation = useMutation({
    mutationFn: () => {
      if (!initial) return Promise.resolve(null)
      return adminApi.lessons.update(initial.id, {
        chapterId,
        title: form.title,
        lessonType: form.lessonType,
        content: form.content || undefined,
        videoUrl: form.lessonType === 0 ? initial.videoUrl || undefined : undefined,
        documentUrl: form.lessonType === 1 ? form.documentUrl || undefined : undefined,
        orderIndex: form.orderIndex,
      })
    },
    onSuccess: () => {
      notify.success('Đã lưu thông tin bài học')
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const hasMetadataChanges = useMemo(() => {
    if (!initial) return false
    return (
      form.title !== initial.title ||
      form.lessonType !== initial.lessonType ||
      form.content !== (initial.content ?? '') ||
      form.orderIndex !== initial.orderIndex ||
      (form.lessonType === 1 && form.documentUrl !== (initial.documentUrl ?? ''))
    )
  }, [form, initial])

  const exitWhileVideoUploading = useCallback(async () => {
    if (initial && hasMetadataChanges) {
      await saveMetadataMutation.mutateAsync()
    }
    onClose()
  }, [initial, hasMetadataChanges, saveMetadataMutation, onClose])

  const isUploading = uploadVideoMutation.isPending || uploadDocumentMutation.isPending
  const isVideoUploading =
    form.lessonType === 0 &&
    (uploadVideoMutation.isPending || (mutation.isPending && !!pendingFile))
  const documentUrlError = useMemo(
    () => (form.lessonType === 1 ? validateDocumentLessonUrl(form.documentUrl) : null),
    [form.lessonType, form.documentUrl],
  )
  const hasUrlError = Boolean(documentUrlError)

  const handleSubmit = () => {
    if (hasUrlError) {
      notify.error(documentUrlError ?? 'Link không hợp lệ')
      return
    }
    if (isVideoUploading) {
      void guardVideoUploadExit(true, exitWhileVideoUploading)
      return
    }
    mutation.mutate()
  }

  const requestClose = () => {
    void guardVideoUploadExit(isVideoUploading, () => {
      if (isVideoUploading) {
        void exitWhileVideoUploading()
      } else {
        onClose()
      }
    })
  }

  return (
    <>
    <AdminModal
      open={open}
      title={initial ? 'Sửa bài học' : 'Thêm bài học'}
      description="Thiết lập loại bài, nội dung và thứ tự trong chương."
      onClose={requestClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={requestClose}
          onSubmit={handleSubmit}
          isLoading={mutation.isPending}
          submitDisabled={!form.title.trim() || hasUrlError}
          submitLabel={initial ? 'Lưu' : 'Thêm bài học'}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Loại bài học</label>
          <AdminNativeSelect
            value={form.lessonType}
            onChange={(e) => {
              const lessonType = Number(e.target.value)
              setForm({
                ...form,
                lessonType,
                videoUrl: lessonType === 0 ? form.videoUrl : '',
                documentUrl: lessonType === 1 ? form.documentUrl : '',
              })
              setPendingFile(null)
            }}
          >
            {LESSON_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
        {form.lessonType === 0 ? (
          <LessonMediaInput
            label="Video"
            url={form.videoUrl}
            onUrlChange={() => {}}
            accept={VIDEO_ACCEPT}
            uploadTitle="Tải video (.mp4, .webm, .mov)"
            uploadOnly
            isUploading={isUploading}
            pendingFileName={!initial ? pendingFile?.name : null}
            disabledHint={!initial ? 'Chọn file — sẽ tải lên sau khi tạo bài học' : undefined}
            onFileSelect={handleFileSelect}
          />
        ) : null}
        {form.lessonType === 1 ? (
          <LessonMediaInput
            label="Tài liệu URL"
            url={form.documentUrl}
            onUrlChange={(documentUrl) => setForm({ ...form, documentUrl })}
            accept={DOCUMENT_ACCEPT}
            uploadTitle="Tải tài liệu (.pdf, .doc, .docx, .ppt, .pptx)"
            uploadIcon="document"
            isUploading={isUploading}
            pendingFileName={!initial ? pendingFile?.name : null}
            disabledHint={!initial ? 'Hoặc chọn file — sẽ tải lên sau khi tạo bài học' : undefined}
            urlError={documentUrlError}
            hint={DOCUMENT_URL_HINT}
            onFileSelect={handleFileSelect}
          />
        ) : null}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Nội dung</label>
          <AdminTextarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            placeholder="Mô tả hoặc nội dung bài học..."
          />
        </div>
        <Input
          label="Thứ tự"
          type="number"
          min={0}
          value={String(form.orderIndex)}
          onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
        />
      </div>
    </AdminModal>
    <ConfirmDialogHost />
    </>
  )
}
