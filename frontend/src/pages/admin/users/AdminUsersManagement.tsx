import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'
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
  AdminNativeSelect,
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
  StatusBadge,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { AdminUser, UserStatus } from '@/types/admin'

const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'LOCKED', 'DISABLED']
const ROLE_OPTIONS = ['STUDENT', 'TEACHER', 'ADMIN']

export type AdminUsersMode = 'students' | 'accounts'

const MODE_CONFIG = {
  students: {
    title: 'Học viên',
    description: 'Danh sách học viên.',
    createLabel: 'Thêm học viên',
    emptyMessage: 'Không tìm thấy học viên.',
    editTitle: 'Sửa học viên',
    createTitle: 'Thêm học viên',
    defaultRole: 'STUDENT',
    lockCreateRole: true,
  },
  accounts: {
    title: 'Tài khoản',
    description: 'Quản lý mọi tài khoản trên nền tảng. Lọc theo vai trò và trạng thái.',
    createLabel: 'Thêm tài khoản',
    emptyMessage: 'Không tìm thấy tài khoản.',
    editTitle: 'Sửa tài khoản',
    createTitle: 'Thêm tài khoản',
    defaultRole: 'STUDENT',
    lockCreateRole: false,
  },
} as const

interface AdminUsersManagementProps {
  mode: AdminUsersMode
}

export function AdminUsersManagement({ mode }: AdminUsersManagementProps) {
  const config = MODE_CONFIG[mode]
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [roleFilter, setRoleFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null)

  const fixedRole = mode === 'students' ? 'STUDENT' : roleFilter || undefined

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', mode, page, keyword, statusFilter, fixedRole],
    queryFn: () =>
      adminApi.users.list({
        page,
        size: 10,
        keyword: keyword || undefined,
        userStatus: statusFilter || undefined,
        role: fixedRole,
      }),
  })

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminApi.roles.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.users.delete(id),
    onSuccess: () => {
      notify.success('Đã vô hiệu hóa người dùng')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const users = usersQuery.data?.content ?? []
  const totalPages = usersQuery.data?.totalPages ?? 0
  const showRoleColumn = mode === 'accounts'
  const showCreatedColumn = mode === 'accounts'
  const colSpan = showRoleColumn && showCreatedColumn ? 6 : 4

  return (
    <div>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            {config.createLabel}
          </Button>
        }
      />

      <AdminCard className="mb-4" padding>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Tìm username, email, họ tên..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            className="flex-1"
          />
          {mode === 'accounts' ? (
            <AdminNativeSelect
              className="sm:w-44"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </AdminNativeSelect>
          ) : null}
          <AdminNativeSelect
            className="sm:w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '')
              setPage(0)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Người dùng</AdminTh>
                <AdminTh>Email</AdminTh>
                {showRoleColumn ? <AdminTh>Vai trò</AdminTh> : null}
                <AdminTh>Trạng thái</AdminTh>
                {showCreatedColumn ? <AdminTh>Ngày tạo</AdminTh> : null}
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {usersQuery.isLoading ? (
                <AdminEmptyRow colSpan={colSpan} message="Đang tải..." />
              ) : users.length === 0 ? (
                <AdminEmptyRow colSpan={colSpan} message={config.emptyMessage} />
              ) : (
                users.map((user) => {
                  const inactive = user.status !== 'ACTIVE'
                  return (
                    <AdminTr
                      key={user.id}
                      className={cn(
                        inactive && 'bg-[#fafafa]/90 opacity-60 hover:opacity-75 hover:bg-[#f5f5f5]',
                      )}
                    >
                      <AdminTd>
                        <div>
                          <p
                            className={cn(
                              'font-semibold',
                              inactive ? 'text-[#9ca3af]' : 'text-[#111827]',
                            )}
                          >
                            {user.fullName}
                          </p>
                          <p className="text-xs text-[#9ca3af]">@{user.username}</p>
                        </div>
                      </AdminTd>
                      <AdminTd className={cn(inactive ? 'text-[#b0b5bd]' : 'text-[#6b7280]')}>
                        {user.email}
                      </AdminTd>
                      {showRoleColumn ? (
                        <AdminTd>
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles?.map((role) => (
                              <AdminBadge key={role}>{role}</AdminBadge>
                            ))}
                          </div>
                        </AdminTd>
                      ) : null}
                      <AdminTd>
                        <StatusBadge status={user.status} />
                      </AdminTd>
                      {showCreatedColumn ? (
                        <AdminTd className={cn(inactive ? 'text-[#b0b5bd]' : 'text-[#6b7280]')}>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </AdminTd>
                      ) : null}
                      <AdminTd align="right">
                        <div className="flex justify-end gap-0.5">
                          <AdminIconButton title="Gán vai trò" onClick={() => setRolesUser(user)}>
                            <UserCog className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton title="Sửa" onClick={() => setEditUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton
                            title="Vô hiệu hóa"
                            variant="danger"
                            onClick={async () => {
                              const ok = await confirm({
                                title: 'Vô hiệu hóa người dùng',
                                description: `Bạn có chắc muốn vô hiệu hóa tài khoản "${user.username}"?`,
                                confirmLabel: 'Vô hiệu hóa',
                              })
                              if (ok) deleteMutation.mutate(user.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </AdminTd>
                    </AdminTr>
                  )
                })
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableWrap>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-[#ececec] px-5 py-3.5">
            <p className="text-sm text-[#666]">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </AdminCard>

      <CreateUserModal
        open={createOpen}
        mode={mode}
        onClose={() => setCreateOpen(false)}
      />
      {editUser ? (
        <EditUserModal user={editUser} mode={mode} onClose={() => setEditUser(null)} />
      ) : null}
      {rolesUser && rolesQuery.data ? (
        <AssignRolesModal user={rolesUser} roles={rolesQuery.data} onClose={() => setRolesUser(null)} />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function CreateUserModal({
  open,
  mode,
  onClose,
}: {
  open: boolean
  mode: AdminUsersMode
  onClose: () => void
}) {
  const config = MODE_CONFIG[mode]
  const queryClient = useQueryClient()
  const [form, setForm] = useState<{
    username: string
    fullName: string
    email: string
    password: string
    role: string
  }>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: config.defaultRole,
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.users.create(form),
    onSuccess: () => {
      notify.success('Tạo người dùng thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
      setForm({ username: '', fullName: '', email: '', password: '', role: config.defaultRole })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={config.createTitle}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitLabel="Tạo"
        />
      }
    >
      <div className="space-y-4">
        <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Vai trò</label>
          <AdminNativeSelect
            value={form.role}
            disabled={config.lockCreateRole}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
      </div>
    </AdminModal>
  )
}

function EditUserModal({
  user,
  mode,
  onClose,
}: {
  user: AdminUser
  mode: AdminUsersMode
  onClose: () => void
}) {
  const config = MODE_CONFIG[mode]
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ fullName: user.fullName, email: user.email, status: user.status })

  const updateMutation = useMutation({
    mutationFn: () => adminApi.users.update(user.id, { fullName: form.fullName, email: form.email }),
    onSuccess: () => {
      notify.success('Cập nhật thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const statusMutation = useMutation({
    mutationFn: () => adminApi.users.updateStatus(user.id, { status: form.status }),
    onSuccess: () => {
      notify.success('Cập nhật trạng thái thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const handleSave = async () => {
    await updateMutation.mutateAsync()
    if (form.status !== user.status) {
      await statusMutation.mutateAsync()
    } else {
      onClose()
    }
  }

  return (
    <AdminModal
      open
      title={config.editTitle}
      description={`@${user.username}`}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => void handleSave()}
          isLoading={updateMutation.isPending || statusMutation.isPending}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Trạng thái</label>
          <AdminNativeSelect
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
      </div>
    </AdminModal>
  )
}

function AssignRolesModal({
  user,
  roles,
  onClose,
}: {
  user: AdminUser
  roles: { id: number; name: string }[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const roleNameToId = Object.fromEntries(roles.map((r) => [r.name, r.id]))
  const [selected, setSelected] = useState<Set<number>>(
    new Set(user.roles.map((name) => roleNameToId[name]).filter(Boolean)),
  )

  const mutation = useMutation({
    mutationFn: () => adminApi.roles.assignToUser(user.id, { roleIds: Array.from(selected) }),
    onSuccess: () => {
      notify.success('Gán vai trò thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open
      title="Gán vai trò"
      description={`Phân quyền cho ${user.fullName}.`}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
        />
      }
    >
      <div className="space-y-2">
        {roles.map((role) => (
          <AdminChecklistItem
            key={role.id}
            label={role.name}
            checked={selected.has(role.id)}
            onChange={(checked) => {
              const next = new Set(selected)
              if (checked) next.add(role.id)
              else next.delete(role.id)
              setSelected(next)
            }}
          />
        ))}
      </div>
    </AdminModal>
  )
}
