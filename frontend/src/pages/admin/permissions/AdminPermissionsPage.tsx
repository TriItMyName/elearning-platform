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
import type { AdminPermission } from '@/types/admin'

export function AdminPermissionsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminPermission | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminApi.permissions.list(),
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.permissions.delete(id),
    onSuccess: () => {
      notify.success('Xóa quyền thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const items = query.data ?? []

  return (
    <div>
      <AdminPageHeader
        title="Quản lý quyền hạn"
        description="CRUD quyền qua /api/admin/permissions"
        action={
          <Button className="!bg-[#f05123]" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm quyền
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase tracking-wide text-[#999]">
              <tr>
                <th className="px-4 py-3">Tên quyền</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {query.isLoading ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-[#999]">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-[#999]">Chưa có quyền</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-mono text-sm font-semibold">{item.name}</td>
                    <td className="px-4 py-3 text-[#666]">{item.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditItem(item)} className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa quyền "${item.name}"?`)) deleteMutation.mutate(item.id)
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

      <PermissionFormModal
        open={createOpen}
        title="Thêm quyền"
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => adminApi.permissions.create(data)}
      />
      {editItem ? (
        <PermissionFormModal
          open
          title={`Sửa: ${editItem.name}`}
          initial={{ name: editItem.name, description: editItem.description ?? '' }}
          onClose={() => setEditItem(null)}
          onSubmit={(data) => adminApi.permissions.update(editItem.id, data)}
        />
      ) : null}
    </div>
  )
}

function PermissionFormModal({
  open,
  title,
  initial = { name: '', description: '' },
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initial?: { name: string; description: string }
  onClose: () => void
  onSubmit: (data: { name: string; description?: string }) => Promise<unknown>
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initial)

  const mutation = useMutation({
    mutationFn: () => onSubmit({ name: form.name, description: form.description || undefined }),
    onSuccess: () => {
      notify.success('Lưu quyền thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] })
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
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Lưu</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Tên quyền" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: COURSE_READ" />
        <Input label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
    </AdminModal>
  )
}
