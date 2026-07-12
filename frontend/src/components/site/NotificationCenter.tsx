import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Filter } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { notificationsApi } from '@/api/notifications.api'
import { cn } from '@/lib/utils'

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [courseFilter, setCourseFilter] = useState<number | 'all'>('all')
  const rootRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const allQuery = useQuery({
    queryKey: ['notifications', 'student'],
    queryFn: () => notificationsApi.listMine(),
    staleTime: 30_000,
  })

  const filteredQuery = useQuery({
    queryKey: ['notifications', 'student', 'course', courseFilter],
    queryFn: () => notificationsApi.listByCourse(courseFilter as number),
    enabled: courseFilter !== 'all',
    staleTime: 30_000,
  })

  const query = courseFilter === 'all' ? allQuery : filteredQuery

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: (notification) => {
      const patch = (current: typeof allQuery.data) =>
        current?.map((item) => (item.id === notification.id ? notification : item))
      queryClient.setQueryData(['notifications', 'student'], patch)
      if (courseFilter !== 'all') {
        queryClient.setQueryData(['notifications', 'student', 'course', courseFilter], patch)
      }
    },
  })

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  const courseOptions = useMemo(() => {
    const items = allQuery.data ?? []
    const map = new Map<number, string>()
    for (const n of items) {
      if (n.courseId != null && n.courseTitle) map.set(n.courseId, n.courseTitle)
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }))
  }, [allQuery.data])

  const notifications = query.data ?? []
  const unreadCount = (allQuery.data ?? []).filter((n) => !n.isRead).length

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#555] transition hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-[19px] w-[19px]" />
        {unreadCount > 0 ? (
          <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#f05123] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-xl">
          <div className="border-b border-[#f0f0f0] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-[#242424]">Thông báo</h2>
              {unreadCount ? <span className="text-xs text-[#777]">{unreadCount} chưa đọc</span> : null}
            </div>
            {courseOptions.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-[#9ca3af]" aria-hidden />
                <button
                  type="button"
                  onClick={() => setCourseFilter('all')}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold transition',
                    courseFilter === 'all'
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#ececec]',
                  )}
                >
                  Tất cả
                </button>
                {courseOptions.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setCourseFilter(course.id)}
                    className={cn(
                      'max-w-[140px] truncate rounded-full px-2.5 py-1 text-xs font-semibold transition',
                      courseFilter === course.id
                        ? 'bg-[#f05123] text-white'
                        : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#ececec]',
                    )}
                    title={course.title}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {query.isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-[#999]">Đang tải thông báo...</p>
            ) : query.isError ? (
              <button
                type="button"
                className="w-full px-4 py-10 text-sm font-medium text-[#f05123]"
                onClick={() => void query.refetch()}
              >
                Không tải được. Thử lại
              </button>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#999]">
                {courseFilter === 'all' ? 'Chưa có thông báo nào.' : 'Không có thông báo cho khóa này.'}
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 border-b border-[#f4f4f4] px-4 py-3 last:border-b-0',
                    !notification.isRead && 'bg-[#fff8f5]',
                  )}
                >
                  <Link
                    to="/my-courses"
                    className="min-w-0 flex-1"
                    onClick={() => {
                      setOpen(false)
                      if (!notification.isRead) markRead.mutate(notification.id)
                    }}
                  >
                    <p className="text-xs font-semibold text-[#f05123]">{notification.courseTitle}</p>
                    <p className="mt-1 text-sm leading-5 text-[#333]">{notification.message}</p>
                    <p className="mt-1 text-xs text-[#999]">
                      {notification.senderName} · {formatNotificationTime(notification.createdAt)}
                    </p>
                  </Link>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#777] hover:bg-white hover:text-[#f05123]"
                      aria-label="Đánh dấu đã đọc"
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
