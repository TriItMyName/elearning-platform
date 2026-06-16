export type MetricCardId =
  | 'students'
  | 'courses'
  | 'active-enrollments'
  | 'categories'
  | 'roles'
  | 'completion-rate'
  | 'quiz-attempts'
  | 'assignments'
  | 'accounts'
  | 'permissions'

export interface DashboardMetricsPrefs {
  order: MetricCardId[]
  visible: Partial<Record<MetricCardId, boolean>>
}

const STORAGE_KEY = 'wl_dashboard_metrics_prefs'

export const ALL_METRIC_IDS: MetricCardId[] = [
  'students',
  'courses',
  'active-enrollments',
  'categories',
  'roles',
  'completion-rate',
  'quiz-attempts',
  'assignments',
  'accounts',
  'permissions',
]

const DEFAULT_VISIBLE: Record<MetricCardId, boolean> = {
  students: true,
  courses: true,
  'active-enrollments': true,
  categories: true,
  roles: true,
  'completion-rate': true,
  'quiz-attempts': false,
  assignments: false,
  accounts: false,
  permissions: false,
}

function mergeOrder(saved: MetricCardId[] | undefined): MetricCardId[] {
  const base = saved?.filter((id) => ALL_METRIC_IDS.includes(id)) ?? []
  const missing = ALL_METRIC_IDS.filter((id) => !base.includes(id))
  return [...base, ...missing]
}

export function loadMetricsPrefs(): DashboardMetricsPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { order: [...ALL_METRIC_IDS], visible: { ...DEFAULT_VISIBLE } }
    }
    const parsed = JSON.parse(raw) as DashboardMetricsPrefs
    return {
      order: mergeOrder(parsed.order),
      visible: { ...DEFAULT_VISIBLE, ...parsed.visible },
    }
  } catch {
    return { order: [...ALL_METRIC_IDS], visible: { ...DEFAULT_VISIBLE } }
  }
}

export function saveMetricsPrefs(prefs: DashboardMetricsPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function reorderMetrics(order: MetricCardId[], dragId: MetricCardId, targetId: MetricCardId): MetricCardId[] {
  if (dragId === targetId) return order
  const next = order.filter((id) => id !== dragId)
  const targetIndex = next.indexOf(targetId)
  if (targetIndex === -1) return order
  next.splice(targetIndex, 0, dragId)
  return next
}

/** Đổi thứ tự card đang hiển thị, giữ nguyên vị trí card ẩn trong full order */
export function mergeVisibleReorder(
  fullOrder: MetricCardId[],
  visibleIds: MetricCardId[],
  activeId: MetricCardId,
  overId: MetricCardId,
  visible: Partial<Record<MetricCardId, boolean>>,
): MetricCardId[] {
  if (activeId === overId) return fullOrder

  const from = visibleIds.indexOf(activeId)
  const to = visibleIds.indexOf(overId)
  if (from === -1 || to === -1) return fullOrder

  const reorderedVisible = [...visibleIds]
  const [moved] = reorderedVisible.splice(from, 1)
  reorderedVisible.splice(to, 0, moved)

  let pointer = 0
  return fullOrder.map((id) => {
    if (visible[id] === false) return id
    return reorderedVisible[pointer++]
  })
}
