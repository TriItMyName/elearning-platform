import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { adminApi } from '@/api/admin.api'
import {
  AdminBadge,
  AdminCard,
  AdminChecklistItem,
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
  AdminTh,
  AdminTr,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { AdminRole } from '@/types/admin'

export function AdminRolesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
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
        title="Vai trò & quyền"
        description="Định nghĩa vai trò người dùng và phân quyền truy cập tính năng."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm vai trò
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Tên vai trò</AdminTh>
                <AdminTh>Quyền hạn</AdminTh>
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {rolesQuery.isLoading ? (
                <AdminEmptyRow colSpan={3} message="Đang tải..." />
              ) : roles.length === 0 ? (
                <AdminEmptyRow colSpan={3} message="Chưa có vai trò nào." />
              ) : (
                roles.map((role) => (
                  <AdminTr key={role.id}>
                    <AdminTd className="font-semibold text-[#111827]">{role.name}</AdminTd>
                    <AdminTd>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions?.length ? (
                          role.permissions.map((permission) => (
                            <AdminBadge key={permission}>{permission}</AdminBadge>
                          ))
                        ) : (
                          <span className="text-xs text-[#9ca3af]">Chưa gán quyền</span>
                        )}
                      </div>
                    </AdminTd>
                    <AdminTd align="right">
                      <div className="flex justify-end gap-0.5">
                        <AdminIconButton title="Gán quyền" onClick={() => setPermRole(role)}>
                          <KeyRound className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton title="Sửa" onClick={() => setEditRole(role)}>
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton
                          title="Xóa"
                          variant="danger"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Xóa vai trò',
                              description: `Bạn có chắc muốn xóa vai trò "${role.name}"? Hành động này không thể hoàn tác.`,
                              confirmLabel: 'Xóa',
                            })
                            if (ok) deleteMutation.mutate(role.id)
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

      <RoleFormModal
        open={createOpen}
        title="Thêm vai trò"
        onClose={() => setCreateOpen(false)}
        onSubmit={(name) => adminApi.roles.create({ name })}
      />
      {editRole ? (
        <RoleFormModal
          open
          title={`Sửa vai trò`}
          description={editRole.name}
          initialName={editRole.name}
          onClose={() => setEditRole(null)}
          onSubmit={(name) => adminApi.roles.update(editRole.id, { name })}
        />
      ) : null}
      {permRole && permissionsQuery.data ? (
        <AssignPermissionsModal
          role={permRole}
          permissions={permissionsQuery.data}
          onClose={() => setPermRole(null)}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function RoleFormModal({
  open,
  title,
  description,
  initialName = '',
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  description?: string
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
      <Input label="Tên vai trò" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: MODERATOR" />
    </AdminModal>
  )
}

function getRolePermissionIds(
  role: AdminRole,
  permissions: { id: number; name: string }[],
): Set<number> {
  const roleNames = new Set(role.permissions)
  return new Set(permissions.filter((p) => roleNames.has(p.name)).map((p) => p.id))
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
    () => getRolePermissionIds(role, permissions),
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
      title="Gán quyền"
      description={`Chọn quyền cho vai trò ${role.name}.`}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
        />
      }
    >
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {permissions.map((perm) => (
          <AdminChecklistItem
            key={perm.id}
            label={perm.name}
            checked={selected.has(perm.id)}
            onChange={(checked) => {
              const next = new Set(selected)
              if (checked) next.add(perm.id)
              else next.delete(perm.id)
              setSelected(next)
            }}
          />
        ))}
      </div>
    </AdminModal>
  )
}
