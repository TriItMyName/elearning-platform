import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
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
import type { AdminRole } from '@/types/admin'

export function AdminRolesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<AdminRole | null>(null)
  const [permRole, setPermRole] = useState<AdminRole | null>(null)

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminApi.roles.list(),
  })

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminApi.permissions.list(),
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.roles.delete(id),
    onSuccess: () => {
      notify.success('Xóa vai trò thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const roles = rolesQuery.data ?? []

  return (
    <div>
      <AdminPageHeader
        title="Quản lý vai trò"
        description="CRUD vai trò và gán quyền qua /api/admin/roles"
        action={
          <Button className="!bg-[#f05123]" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm vai trò
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase tracking-wide text-[#999]">
              <tr>
                <th className="px-4 py-3">Tên vai trò</th>
                <th className="px-4 py-3">Quyền hạn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {rolesQuery.isLoading ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-[#999]">Đang tải...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-[#999]">Chưa có vai trò</td></tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-semibold">{role.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.length ? (
                          role.permissions.map((p) => (
                            <span key={p.id} className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                              {p.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#999]">Chưa gán quyền</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Gán quyền" onClick={() => setPermRole(role)} className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]">
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditRole(role)} className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa vai trò "${role.name}"?`)) deleteMutation.mutate(role.id)
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

      <RoleFormModal open={createOpen} title="Thêm vai trò" onClose={() => setCreateOpen(false)} onSubmit={(name) => adminApi.roles.create({ name })} />
      {editRole ? (
        <RoleFormModal
          open
          title={`Sửa: ${editRole.name}`}
          initialName={editRole.name}
          onClose={() => setEditRole(null)}
          onSubmit={(name) => adminApi.roles.update(editRole.id, { name })}
        />
      ) : null}
      {permRole && permissionsQuery.data ? (
        <AssignPermissionsModal role={permRole} permissions={permissionsQuery.data} onClose={() => setPermRole(null)} />
      ) : null}
    </div>
  )
}

function RoleFormModal({
  open,
  title,
  initialName = '',
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initialName?: string
  onClose: () => void
  onSubmit: (name: string) => Promise<unknown>
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(initialName)

  const mutation = useMutation({
    mutationFn: () => onSubmit(name),
    onSuccess: () => {
      notify.success('Lưu vai trò thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
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
      <Input label="Tên vai trò" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: MODERATOR" />
    </AdminModal>
  )
}

function AssignPermissionsModal({
  role,
  permissions,
  onClose,
}: {
  role: AdminRole
  permissions: { id: number; name: string }[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<number>>(
    new Set(role.permissions.map((p) => p.id)),
  )

  const mutation = useMutation({
    mutationFn: () => adminApi.roles.assignPermissions(role.id, { permissionIds: Array.from(selected) }),
    onSuccess: () => {
      notify.success('Gán quyền thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open
      title={`Gán quyền: ${role.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Lưu</Button>
        </>
      }
    >
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {permissions.map((perm) => (
          <label key={perm.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#f0f0f0] px-3 py-2 hover:bg-[#fafafa]">
            <input
              type="checkbox"
              checked={selected.has(perm.id)}
              onChange={(e) => {
                const next = new Set(selected)
                if (e.target.checked) next.add(perm.id)
                else next.delete(perm.id)
                setSelected(next)
              }}
            />
            <span className="text-sm font-medium">{perm.name}</span>
          </label>
        ))}
      </div>
    </AdminModal>
  )
}
