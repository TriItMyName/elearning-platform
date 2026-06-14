import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { coursesApi } from '@/api/courses.api'
import { categoriesApi } from '@/api/categories.api'
import {
  AdminCard,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTableWrap,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/auth/auth.context'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { Course } from '@/types/course'
import { COURSE_STATUS_OPTIONS } from '@/types/course'

export function AdminCoursesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Course | null>(null)

  const query = useQuery({
    queryKey: ['courses', 'admin-list'],
    queryFn: () => coursesApi.list({ page: 0, size: 100 }),
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.deleteByTeacher(id),
    onSuccess: () => {
      notify.success('Xóa khóa học thành công')
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const items = query.data?.content ?? []

  return (
    <div>
      <AdminPageHeader
        title="Quản lý khóa học"
        description="CRUD khóa học qua /api/courses và /api/courses/teacher"
        action={
          <Button className="!bg-[#f05123]" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm khóa học
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase tracking-wide text-[#999]">
              <tr>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {query.isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#999]">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#999]">Chưa có khóa học</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-semibold">{item.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#666]">{item.slug}</td>
                    <td className="px-4 py-3 text-[#666]">#{item.categoryId}</td>
                    <td className="px-4 py-3 text-[#666]">{item.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(item)} className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa khóa học "${item.title}"?`)) deleteMutation.mutate(item.id)
                          }}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableWrap>
      </AdminCard>

      <CourseFormModal open={createOpen} title="Thêm khóa học" onClose={() => setCreateOpen(false)} mode="create" />
      {editItem ? (
        <CourseFormModal
          open
          title={`Sửa: ${editItem.title}`}
          onClose={() => setEditItem(null)}
          mode="edit"
          initial={editItem}
        />
      ) : null}
    </div>
  )
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function CourseFormModal({
  open,
  title,
  onClose,
  mode,
  initial,
}: {
  open: boolean
  title: string
  onClose: () => void
  mode: 'create' | 'edit'
  initial?: Course
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list({ page: 0, size: 100 }),
  })

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    categoryId: initial?.categoryId ?? 0,
    status: initial?.status ?? 1,
  })
  const [slugManual, setSlugManual] = useState(mode === 'edit')

  useEffect(() => {
    if (!open) return
    setForm({
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? 0,
      status: initial?.status ?? 1,
    })
    setSlugManual(mode === 'edit')
  }, [open, mode, initial])

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugify(title),
    }))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManual(true)
    setForm((prev) => ({ ...prev, slug }))
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || slugify(form.title)
      if (mode === 'create') {
        return coursesApi.createByTeacher({
          title: form.title,
          slug,
          description: form.description || undefined,
          categoryId: form.categoryId,
          status: form.status,
        })
      }
      return coursesApi.updateByTeacher(initial!.id, {
        title: form.title,
        slug,
        description: form.description || undefined,
        categoryId: form.categoryId,
        status: form.status,
      })
    },
    onSuccess: () => {
      notify.success(mode === 'create' ? 'Tạo khóa học thành công' : 'Cập nhật khóa học thành công')
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const categories = categoriesQuery.data?.content ?? []

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button
            className="!bg-[#f05123]"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
            disabled={!form.title || !form.categoryId}
          >
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
        <div>
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder={slugify(form.title) || 'tu-dong-tu-tieu-de'}
          />
          {!slugManual && form.title ? (
            <p className="mt-1 text-xs text-[#999]">
              Tự động tạo từ tiêu đề — bạn vẫn có thể sửa slug trực tiếp.
            </p>
          ) : slugManual ? (
            <button
              type="button"
              className="mt-1 text-xs font-medium text-[#f05123] hover:underline"
              onClick={() => {
                setSlugManual(false)
                setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
              }}
            >
              Đồng bộ lại từ tiêu đề
            </button>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục</label>
          <select
            value={form.categoryId || ''}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
          >
            {COURSE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
          />
        </div>
        {user ? (
          <p className="text-xs text-[#999]">Giảng viên: {user.fullName ?? user.username}</p>
        ) : null}
      </div>
    </AdminModal>
  )
}
