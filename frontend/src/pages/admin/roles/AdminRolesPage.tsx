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
import type { AdminPermission, AdminRole } from '@/types/admin'

export function AdminRolesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<AdminRole | null>(null)
  const [permRole, setPermRole] = useState<AdminRole | null>(null)
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false)
  const [editPermission, setEditPermission] = useState<AdminPermission | null>(null)

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
  const deletePermissionMutation = useMutation({
    mutationFn: (id: number) => adminApi.permissions.delete(id),
    onSuccess: () => {
      notify.success('Xóa quyền thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] })
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

      <AdminCard className="mt-6">
        <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-5 py-4">
          <div>
            <h2 className="font-bold text-[#111827]">Danh mục quyền</h2>
            <p className="mt-1 text-sm text-[#6b7280]">Tạo và duy trì các quyền có thể gán cho vai trò.</p>
          </div>
          <Button size="sm" onClick={() => setCreatePermissionOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Thêm quyền
          </Button>
        </div>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Tên quyền</AdminTh>
                <AdminTh>Mô tả</AdminTh>
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {permissionsQuery.isLoading ? (
                <AdminEmptyRow colSpan={3} message="Đang tải..." />
              ) : permissionsQuery.data?.length ? (
                permissionsQuery.data.map((permission) => (
                  <AdminTr key={permission.id}>
                    <AdminTd className="font-mono text-xs font-semibold text-[#111827]">
                      {permission.name}
                    </AdminTd>
                    <AdminTd className="text-[#6b7280]">{permission.description || 'Chưa có mô tả'}</AdminTd>
                    <AdminTd align="right">
                      <div className="flex justify-end gap-0.5">
                        <AdminIconButton title="Sửa quyền" onClick={() => setEditPermission(permission)}>
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton
                          title="Xóa quyền"
                          variant="danger"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Xóa quyền',
                              description: `Xóa quyền "${permission.name}" khỏi hệ thống?`,
                              confirmLabel: 'Xóa',
                            })
                            if (ok) deletePermissionMutation.mutate(permission.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTd>
                  </AdminTr>
                ))
              ) : (
                <AdminEmptyRow colSpan={3} message="Chưa có quyền nào." />
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
      {createPermissionOpen ? (
        <PermissionFormModal open onClose={() => setCreatePermissionOpen(false)} />
      ) : null}
      {editPermission ? (
        <PermissionFormModal
          open
          initial={editPermission}
          onClose={() => setEditPermission(null)}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function PermissionFormModal({
  open,
  initial,
  onClose,
}: {
  open: boolean
  initial?: AdminPermission
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const mutation = useMutation({
    mutationFn: () =>
      initial
        ? adminApi.permissions.update(initial.id, { name: name.trim(), description: description.trim() })
        : adminApi.permissions.create({ name: name.trim(), description: description.trim() }),
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật quyền thành công' : 'Tạo quyền thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] })
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa quyền' : 'Thêm quyền'}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!name.trim() || !description.trim()}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tên quyền" value={name} onChange={(event) => setName(event.target.value)} />
        <Input
          label="Mô tả"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
    </AdminModal>
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
