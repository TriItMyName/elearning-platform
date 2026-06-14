import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'

import { adminApi } from '@/api/admin.api'
import {
  AdminCard,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTableWrap,
  StatusBadge,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { AdminUser, UserStatus } from '@/types/admin'

const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'LOCKED', 'DISABLED']
const ROLE_OPTIONS = ['STUDENT', 'TEACHER', 'ADMIN']

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null)

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, keyword, statusFilter],
    queryFn: () =>
      adminApi.users.list({
        page,
        size: 10,
        keyword: keyword || undefined,
        userStatus: statusFilter || undefined,
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

  return (
    <div>
      <AdminPageHeader
        title="Quản lý học viên"
        description="CRUD người dùng qua /api/admin/users"
        action={
          <Button
            className="!bg-[#f05123] hover:!bg-[#d93d0f]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm học viên
          </Button>
        }
      />

      <AdminCard className="mb-4 p-4">
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
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '')
              setPage(0)
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f05123]"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <thead className="bg-[#fafafa] text-left text-xs font-semibold uppercase tracking-wide text-[#999]">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {usersQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#999]">
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#999]">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#242424]">{user.fullName}</p>
                      <p className="text-xs text-[#999]">@{user.username}</p>
                    </td>
                    <td className="px-4 py-3 text-[#666]">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className="rounded bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#666]"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-[#666]">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Gán vai trò"
                          onClick={() => setRolesUser(user)}
                          className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Sửa"
                          onClick={() => setEditUser(user)}
                          className="rounded-lg p-2 text-[#666] hover:bg-[#f0f0f0]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Vô hiệu hóa"
                          onClick={() => {
                            if (confirm(`Vô hiệu hóa ${user.username}?`)) {
                              deleteMutation.mutate(user.id)
                            }
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

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-[#f0f0f0] px-4 py-3">
            <p className="text-sm text-[#666]">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
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

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editUser ? (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      ) : null}
      {rolesUser && rolesQuery.data ? (
        <AssignRolesModal
          user={rolesUser}
          roles={rolesQuery.data}
          onClose={() => setRolesUser(null)}
        />
      ) : null}
    </div>
  )
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.users.create(form),
    onSuccess: () => {
      notify.success('Tạo người dùng thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
      setForm({ username: '', fullName: '', email: '', password: '', role: 'STUDENT' })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title="Thêm học viên"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="!bg-[#f05123]"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Tạo
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Vai trò</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </AdminModal>
  )
}

function EditUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
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
      title={`Sửa: ${user.username}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={updateMutation.isPending || statusMutation.isPending} onClick={() => void handleSave()}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
    mutationFn: () =>
      adminApi.roles.assignToUser(user.id, { roleIds: Array.from(selected) }),
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
      title={`Gán vai trò: ${user.username}`}
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
      <div className="space-y-2">
        {roles.map((role) => (
          <label key={role.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#f0f0f0] px-3 py-2 hover:bg-[#fafafa]">
            <input
              type="checkbox"
              checked={selected.has(role.id)}
              onChange={(e) => {
                const next = new Set(selected)
                if (e.target.checked) next.add(role.id)
                else next.delete(role.id)
                setSelected(next)
              }}
            />
            <span className="text-sm font-medium">{role.name}</span>
          </label>
        ))}
      </div>
    </AdminModal>
  )
}
