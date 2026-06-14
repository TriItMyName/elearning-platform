import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { adminApi } from '@/api/admin.api'
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
import type { AdminCategory } from '@/types/admin'

export function AdminCategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminCategory | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.categories.list(),
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.categories.delete(id),
    onSuccess: () => {
      notify.success('Xóa danh mục thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const items = query.data ?? []

  return (
    <div>
      <AdminPageHeader
        title="Quản lý danh mục"
        description="CRUD danh mục khóa học qua /api/admin/categories"
        action={
          <Button className="!bg-[#f05123]" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase tracking-wide text-[#999]">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {query.isLoading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[#999]">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[#999]">Chưa có danh mục</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#666]">{item.slug}</td>
                    <td className="px-4 py-3 text-[#666]">{item.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(item)} className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa danh mục "${item.name}"?`)) deleteMutation.mutate(item.id)
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

      <CategoryFormModal
        open={createOpen}
        title="Thêm danh mục"
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => adminApi.categories.create(data)}
        successMessage="Tạo danh mục thành công"
      />
      {editItem ? (
        <CategoryFormModal
          open
          title={`Sửa: ${editItem.name}`}
          initial={{ name: editItem.name, description: editItem.description ?? '' }}
          onClose={() => setEditItem(null)}
          onSubmit={(data) => adminApi.categories.update(editItem.id, data)}
          successMessage="Cập nhật danh mục thành công"
        />
      ) : null}
    </div>
  )
}

function CategoryFormModal({
  open,
  title,
  initial = { name: '', description: '' },
  onClose,
  onSubmit,
  successMessage,
}: {
  open: boolean
  title: string
  initial?: { name: string; description: string }
  onClose: () => void
  onSubmit: (data: { name: string; description?: string }) => Promise<unknown>
  successMessage: string
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initial)

  const mutation = useMutation({
    mutationFn: () => onSubmit({ name: form.name, description: form.description || undefined }),
    onSuccess: () => {
      notify.success(successMessage)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
          />
        </div>
        <p className="text-xs text-[#999]">Slug được hệ thống tự tạo từ tên danh mục.</p>
      </div>
    </AdminModal>
  )
}
