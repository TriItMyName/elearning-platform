import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ChevronRight, ClipboardList, Layers, Pencil, Plus, Trash2, Video } from 'lucide-react'
import { useEffect, useState } from 'react'

import { assignmentsApi } from '@/api/assignments.api'
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
import type { Assignment } from '@/types/assignment'
import { LESSON_TYPE_LABEL } from '@/types/lesson'

type PickerStep = 'course' | 'chapter' | 'lesson'

const STEPS: Array<{ id: PickerStep | 'workspace'; label: string }> = [
  { id: 'course', label: 'Khóa học' },
  { id: 'chapter', label: 'Chương' },
  { id: 'lesson', label: 'Bài học' },
  { id: 'workspace', label: 'Bài tập' },
]

export function AdminAssignmentsPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [courseId, setCourseId] = useState<number | null>(null)
  const [chapterId, setChapterId] = useState<number | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Assignment | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['courses', 'admin-assignments'],
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

  const assignmentsQuery = useQuery({
    queryKey: ['assignments', courseId, chapterId, lessonId],
    queryFn: () => assignmentsApi.listByLesson(courseId!, chapterId!, lessonId!),
    enabled: courseId != null && chapterId != null && lessonId != null,
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => assignmentsApi.delete(courseId!, chapterId!, lessonId!, id),
    onSuccess: () => {
      notify.success('Xóa bài tập thành công')
      void queryClient.invalidateQueries({ queryKey: ['assignments', courseId, chapterId, lessonId] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const courses = coursesQuery.data?.content ?? []
  const chapters = chaptersQuery.data?.content ?? []
  const lessons = lessonsQuery.data?.content ?? []
  const assignments = assignmentsQuery.data ?? []

  const selectedCourse = courses.find((c) => c.id === courseId)
  const selectedChapter = chapters.find((c) => c.id === chapterId)
  const selectedLesson = lessons.find((l) => l.id === lessonId)

  const currentStep: PickerStep | 'workspace' = !courseId
    ? 'course'
    : !chapterId
      ? 'chapter'
      : !lessonId
        ? 'lesson'
        : 'workspace'

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const ready = courseId != null && chapterId != null && lessonId != null

  const resetFrom = (step: PickerStep) => {
    if (step === 'course') {
      setCourseId(null)
      setChapterId(null)
      setLessonId(null)
      return
    }
    if (step === 'chapter') {
      setChapterId(null)
      setLessonId(null)
      return
    }
    setLessonId(null)
  }

  return (
    <div>
      <AdminPageHeader
        title="Bài tập"
        description="Gắn bài tập vào bài học. API mock mặc định — tắt bằng VITE_MOCK_ASSIGNMENTS=false khi BE sẵn sàng."
      />

      <AdminCard className="mb-6" padding>
        <AdminStepper steps={STEPS} currentIndex={stepIndex} />
        {currentStep === 'workspace' && selectedCourse && selectedChapter && selectedLesson ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ececec] pt-4 text-sm">
            <span className="text-[#6b7280]">Đang soạn:</span>
            <button type="button" onClick={() => resetFrom('course')} className="font-medium text-[#f05123] hover:underline">
              {selectedCourse.title}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[#d1d5db]" />
            <button type="button" onClick={() => resetFrom('chapter')} className="font-medium text-[#f05123] hover:underline">
              {selectedChapter.title}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[#d1d5db]" />
            <button type="button" onClick={() => resetFrom('lesson')} className="font-medium text-[#f05123] hover:underline">
              {selectedLesson.title}
            </button>
          </div>
        ) : null}
      </AdminCard>

      {currentStep === 'course' ? (
        <AdminPickerSection title="Bước 1 — Chọn khóa học" description="Bài tập gắn vào bài học cụ thể." loading={coursesQuery.isLoading} isEmpty={courses.length === 0} empty="Chưa có khóa học.">
          {courses.map((c) => (
            <AdminPickerRow key={c.id} icon={BookOpen} title={c.title} meta={c.slug} onClick={() => setCourseId(c.id)} />
          ))}
        </AdminPickerSection>
      ) : null}

      {currentStep === 'chapter' && selectedCourse ? (
        <AdminPickerSection title="Bước 2 — Chọn chương" description={selectedCourse.title} loading={chaptersQuery.isLoading} isEmpty={chapters.length === 0} empty="Chưa có chương." onBack={() => resetFrom('course')}>
          {chapters.map((ch) => (
            <AdminPickerRow key={ch.id} icon={Layers} title={ch.title} meta={`Thứ tự ${ch.orderIndex}`} onClick={() => setChapterId(ch.id)} />
          ))}
        </AdminPickerSection>
      ) : null}

      {currentStep === 'lesson' && selectedChapter ? (
        <AdminPickerSection title="Bước 3 — Chọn bài học" description={selectedChapter.title} loading={lessonsQuery.isLoading} isEmpty={lessons.length === 0} empty="Chưa có bài học." onBack={() => resetFrom('chapter')}>
          {lessons.map((l) => (
            <AdminPickerRow key={l.id} icon={Video} title={l.title} meta={LESSON_TYPE_LABEL[l.lessonType]} onClick={() => setLessonId(l.id)} />
          ))}
        </AdminPickerSection>
      ) : null}

      {currentStep === 'workspace' && ready ? (
        <AdminPanel
          title={`Bài tập (${assignments.length})`}
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm bài tập
            </Button>
          }
        >
          {assignmentsQuery.isLoading ? (
            <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải...</p>
          ) : assignments.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-[#d1d5db]" />
              <p className="mt-3 text-sm text-[#6b7280]">Chưa có bài tập cho bài học này.</p>
              <Button size="sm" className="mt-3" onClick={() => setModalOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Tạo bài tập đầu tiên
              </Button>
            </div>
          ) : (
            assignments.map((item) => (
              <AdminListItem
                key={item.id}
                actions={
                  <>
                    <AdminIconButton title="Sửa" onClick={() => setEditItem(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </AdminIconButton>
                    <AdminIconButton
                      title="Xóa"
                      variant="danger"
                      onClick={async () => {
                        const ok = await confirm({ title: 'Xóa bài tập', description: `Xóa "${item.title}"?`, confirmLabel: 'Xóa' })
                        if (ok) deleteMutation.mutate(item.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AdminIconButton>
                  </>
                }
              >
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{item.title}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <AdminBadge tone="accent">Tối đa {item.maxScore} điểm</AdminBadge>
                    {item.deadline ? (
                      <AdminBadge>Hạn {new Date(item.deadline).toLocaleDateString('vi-VN')}</AdminBadge>
                    ) : null}
                  </span>
                </span>
              </AdminListItem>
            ))
          )}
        </AdminPanel>
      ) : null}

      {ready && modalOpen ? (
        <AssignmentFormModal open courseId={courseId} chapterId={chapterId} lessonId={lessonId} onClose={() => setModalOpen(false)} />
      ) : null}
      {ready && editItem ? (
        <AssignmentFormModal open courseId={courseId} chapterId={chapterId} lessonId={lessonId} initial={editItem} onClose={() => setEditItem(null)} />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function AssignmentFormModal({
  open,
  courseId,
  chapterId,
  lessonId,
  initial,
  onClose,
}: {
  open: boolean
  courseId: number
  chapterId: number
  lessonId: number
  initial?: Assignment
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [deadline, setDeadline] = useState('')
  const [maxScore, setMaxScore] = useState('10')

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setDescription(initial?.description ?? '')
    setAttachmentUrl(initial?.attachmentUrl ?? '')
    setDeadline(initial?.deadline ? initial.deadline.slice(0, 16) : '')
    setMaxScore(String(initial?.maxScore ?? 10))
  }, [open, initial])

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title,
        description: description || undefined,
        attachmentUrl: attachmentUrl || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        maxScore: Number(maxScore) || 10,
      }
      return initial
        ? assignmentsApi.update(courseId, chapterId, lessonId, initial.id, payload)
        : assignmentsApi.create(courseId, chapterId, lessonId, payload)
    },
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật bài tập thành công' : 'Tạo bài tập thành công')
      void queryClient.invalidateQueries({ queryKey: ['assignments', courseId, chapterId, lessonId] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa bài tập' : 'Thêm bài tập'}
      onClose={onClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!title.trim()}
          submitLabel={initial ? 'Lưu' : 'Tạo'}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Mô tả</label>
          <AdminTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <Input label="Link đính kèm" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Hạn nộp" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input label="Điểm tối đa" type="number" min={1} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </div>
      </div>
    </AdminModal>
  )
}
