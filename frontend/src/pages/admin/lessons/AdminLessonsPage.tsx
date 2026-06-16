import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { chaptersApi } from '@/api/chapters.api'
import { coursesApi } from '@/api/courses.api'
import { lessonsApi } from '@/api/lessons.api'
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
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { Chapter } from '@/types/chapter'
import type { Lesson } from '@/types/lesson'
import { LESSON_TYPE_LABEL, LESSON_TYPE_OPTIONS } from '@/types/lesson'

const STEPS = [
  { id: 'course', label: 'Khóa học' },
  { id: 'workspace', label: 'Chương & bài học' },
]

export function AdminLessonsPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [courseId, setCourseId] = useState<number | null>(null)
  const [chapterId, setChapterId] = useState<number | null>(null)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editChapter, setEditChapter] = useState<Chapter | null>(null)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['courses', 'admin-lessons'],
    queryFn: () => coursesApi.list({ page: 0, size: 100 }),
  })

  const chaptersQuery = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => chaptersApi.listByCourse(courseId!, { page: 0, size: 100, sortBy: 'orderIndex' }),
    enabled: courseId != null,
  })

  const lessonsQuery = useQuery({
    queryKey: ['lessons', courseId, chapterId],
    queryFn: () => lessonsApi.listByChapter(courseId!, chapterId!, { page: 0, size: 100, sortBy: 'orderIndex' }),
    enabled: courseId != null && chapterId != null,
  })

  const queryClient = useQueryClient()

  const deleteChapterMutation = useMutation({
    mutationFn: (id: number) => chaptersApi.deleteByTeacher(courseId!, id),
    onSuccess: () => {
      notify.success('Xóa chương thành công')
      void queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
      setChapterId(null)
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => lessonsApi.delete(courseId!, chapterId!, id),
    onSuccess: () => {
      notify.success('Xóa bài học thành công')
      void queryClient.invalidateQueries({ queryKey: ['lessons', courseId, chapterId] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const courses = coursesQuery.data?.content ?? []
  const chapters = chaptersQuery.data?.content ?? []
  const lessons = lessonsQuery.data?.content ?? []

  const selectedCourse = courses.find((c) => c.id === courseId)
  const selectedChapter = chapters.find((c) => c.id === chapterId)

  const currentStep = courseId ? 'workspace' : 'course'
  const stepIndex = currentStep === 'course' ? 0 : 1

  useEffect(() => {
    if (!courseId || chapters.length === 0) return
    if (chapterId == null || !chapters.some((c) => c.id === chapterId)) {
      setChapterId(chapters[0].id)
    }
  }, [courseId, chapters, chapterId])

  return (
    <div>
      <AdminPageHeader
        title="Bài học & chương"
        description="Chọn khóa học, quản lý chương và bài học bên trong. Luồng: khóa học → chương & bài học."
      />

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

      {currentStep === 'course' ? (
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
            title="Danh sách chương"
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

          <div className="space-y-4">
            {selectedChapter ? (
              <AdminCard padding>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#f05123] uppercase">Chương đang chọn</p>
                    <h2 className="mt-1 text-lg font-bold text-[#111827]">{selectedChapter.title}</h2>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      {lessons.length} bài học · Thứ tự {selectedChapter.orderIndex}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setLessonModalOpen(true)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Thêm bài học
                  </Button>
                </div>
              </AdminCard>
            ) : null}

            <AdminPanel title={`Bài học (${lessons.length})`}>
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
        </div>
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
        ? chaptersApi.updateByTeacher(courseId, initial.id, { title, orderIndex })
        : chaptersApi.createByTeacher(courseId, { title, orderIndex }),
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
  const [form, setForm] = useState({
    title: '',
    lessonType: 0,
    content: '',
    videoUrl: '',
    orderIndex: 0,
  })

  useEffect(() => {
    if (!open) return
    setForm({
      title: initial?.title ?? '',
      lessonType: initial?.lessonType ?? 0,
      content: initial?.content ?? '',
      videoUrl: initial?.videoUrl ?? '',
      orderIndex: initial?.orderIndex ?? nextOrder,
    })
  }, [open, initial, nextOrder])

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        lessonType: form.lessonType,
        content: form.content || undefined,
        videoUrl: form.videoUrl || undefined,
        orderIndex: form.orderIndex,
      }
      return initial
        ? lessonsApi.update(courseId, chapterId, initial.id, payload)
        : lessonsApi.create(courseId, chapterId, payload)
    },
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật bài học thành công' : 'Tạo bài học thành công')
      void queryClient.invalidateQueries({ queryKey: ['lessons', courseId, chapterId] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa bài học' : 'Thêm bài học'}
      description="Thiết lập loại bài, nội dung và thứ tự trong chương."
      onClose={onClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!form.title.trim()}
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
            onChange={(e) => setForm({ ...form, lessonType: Number(e.target.value) })}
          >
            {LESSON_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
        {form.lessonType === 0 ? (
          <Input
            label="Video URL"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://..."
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
  )
}
