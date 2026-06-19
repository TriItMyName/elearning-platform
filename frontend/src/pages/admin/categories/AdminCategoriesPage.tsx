import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { adminApi } from '@/api/admin.api'
import {
  AdminCard,
  AdminEmptyRow,
  AdminIconButton,
  AdminModal,
  AdminModalFooter,
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableWrap,
  AdminTd,
  AdminTextarea,
  AdminTh,
  AdminTr,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { AdminCategory } from '@/types/admin'

export function AdminCategoriesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
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

  const items = query.data?.content ?? []

  return (
    <div>
      <AdminPageHeader
        title="Danh mục khóa học"
        description="Nhóm khóa học theo chủ đề hiển thị trên trang khám phá."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Tên</AdminTh>
                <AdminTh>Slug</AdminTh>
                <AdminTh>Mô tả</AdminTh>
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {query.isLoading ? (
                <AdminEmptyRow colSpan={4} message="Đang tải..." />
              ) : items.length === 0 ? (
                <AdminEmptyRow colSpan={4} message="Chưa có danh mục nào." />
              ) : (
                items.map((item) => (
                  <AdminTr key={item.id}>
                    <AdminTd className="font-semibold text-[#111827]">{item.name}</AdminTd>
                    <AdminTd className="font-mono text-xs text-[#6b7280]">{item.slug}</AdminTd>
                    <AdminTd className="text-[#6b7280]">{item.description ?? '—'}</AdminTd>
                    <AdminTd align="right">
                      <div className="flex justify-end gap-0.5">
                        <AdminIconButton title="Sửa" onClick={() => setEditItem(item)}>
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton
                          title="Xóa"
                          variant="danger"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Xóa danh mục',
                              description: `Bạn có chắc muốn xóa danh mục "${item.name}"? Hành động này không thể hoàn tác.`,
                              confirmLabel: 'Xóa',
                            })
                            if (ok) deleteMutation.mutate(item.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTableBody>
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
          title="Sửa danh mục"
          description={editItem.name}
          initial={{ name: editItem.name, description: editItem.description ?? '' }}
          onClose={() => setEditItem(null)}
          onSubmit={(data) => adminApi.categories.update(editItem.id, data)}
          successMessage="Cập nhật danh mục thành công"
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function CategoryFormModal({
  open,
  title,
  description,
  initial = { name: '', description: '' },
  onClose,
  onSubmit,
  successMessage,
}: {
  open: boolean
  title: string
  description?: string
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
      description={description}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Mô tả</label>
          <AdminTextarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>
        <p className="text-xs text-[#9ca3af]">Slug được hệ thống tự tạo từ tên danh mục.</p>
      </div>
    </AdminModal>
  )
}
