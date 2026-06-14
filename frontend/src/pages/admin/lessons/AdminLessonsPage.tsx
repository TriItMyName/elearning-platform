import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { chaptersApi } from '@/api/chapters.api'
import { coursesApi } from '@/api/courses.api'
import { lessonsApi } from '@/api/lessons.api'
import {
  AdminCard,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTableWrap,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { Chapter } from '@/types/chapter'
import type { Lesson } from '@/types/lesson'
import { LESSON_TYPE_OPTIONS } from '@/types/lesson'

export function AdminLessonsPage() {
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

  return (
    <div>
      <AdminPageHeader
        title="Quản lý bài học"
        description="Chọn khóa học → chương → quản lý bài học qua API teacher"
      />

      <AdminCard className="mb-4 p-4">
        <label className="mb-1 block text-sm font-medium text-[#666]">Khóa học</label>
        <select
          value={courseId ?? ''}
          onChange={(e) => {
            const id = Number(e.target.value) || null
            setCourseId(id)
            setChapterId(null)
          }}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
        >
          <option value="">Chọn khóa học</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </AdminCard>

      {courseId ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminCard>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
              <h2 className="font-bold text-[#242424]">Chương</h2>
              <Button className="!bg-[#f05123] !px-3 !py-1.5 !text-xs" onClick={() => setChapterModalOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
              </Button>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {chapters.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[#999]">Chưa có chương</p>
              ) : (
                chapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChapterId(ch.id)}
                    className={[
                      'flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-[#fafafa]',
                      chapterId === ch.id ? 'bg-[#fff4f0] font-semibold text-[#f05123]' : 'text-[#333]',
                    ].join(' ')}
                  >
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{ch.title}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditChapter(ch) }}
                      className="rounded p-1.5 hover:bg-[#f0f0f0]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Xóa chương "${ch.title}"?`)) deleteChapterMutation.mutate(ch.id)
                      }}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
              <h2 className="font-bold text-[#242424]">Bài học</h2>
              <Button
                className="!bg-[#f05123] !px-3 !py-1.5 !text-xs"
                disabled={!chapterId}
                onClick={() => setLessonModalOpen(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
              </Button>
            </div>
            {!chapterId ? (
              <p className="px-4 py-8 text-center text-sm text-[#999]">Chọn một chương</p>
            ) : (
              <AdminTableWrap>
                <AdminTable>
                  <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase text-[#999]">
                    <tr>
                      <th className="px-4 py-2">Tiêu đề</th>
                      <th className="px-4 py-2">Loại</th>
                      <th className="px-4 py-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {lessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td className="px-4 py-2 text-sm font-medium">{lesson.title}</td>
                        <td className="px-4 py-2 text-sm text-[#666]">{lesson.lessonType}</td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => setEditLesson(lesson)} className="rounded p-1.5 hover:bg-[#f0f0f0]">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Xóa bài "${lesson.title}"?`)) deleteLessonMutation.mutate(lesson.id)
                              }}
                              className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            )}
          </AdminCard>
        </div>
      ) : null}

      {courseId ? (
        <ChapterFormModal
          open={chapterModalOpen}
          courseId={courseId}
          nextOrder={chapters.length}
          onClose={() => setChapterModalOpen(false)}
        />
      ) : null}
      {courseId && editChapter ? (
        <ChapterFormModal
          open
          courseId={courseId}
          initial={editChapter}
          onClose={() => setEditChapter(null)}
        />
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
  const [title, setTitle] = useState(initial?.title ?? '')
  const [orderIndex, setOrderIndex] = useState(initial?.orderIndex ?? nextOrder)

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
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!title}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề chương" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Thứ tự" type="number" value={String(orderIndex)} onChange={(e) => setOrderIndex(Number(e.target.value))} />
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
    title: initial?.title ?? '',
    lessonType: initial?.lessonType ?? 0,
    content: initial?.content ?? '',
    videoUrl: initial?.videoUrl ?? '',
    orderIndex: initial?.orderIndex ?? nextOrder,
  })

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
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!form.title}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Loại bài học</label>
          <select
            value={form.lessonType}
            onChange={(e) => setForm({ ...form, lessonType: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {LESSON_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <Input label="Video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <Input label="Thứ tự" type="number" value={String(form.orderIndex)} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} />
      </div>
    </AdminModal>
  )
}
