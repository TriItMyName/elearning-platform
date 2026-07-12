import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Settings2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { DashboardMetricCard, type DashboardMetric } from '@/components/admin/dashboard/DashboardMetricCard'
import {
  loadMetricsPrefs,
  mergeVisibleReorder,
  saveMetricsPrefs,
  type MetricCardId,
} from '@/lib/dashboard-metrics.storage'
import { cn } from '@/lib/utils'

interface DashboardMetricsGridProps {
  metrics: DashboardMetric[]
  ready?: boolean
  loading?: boolean
}

function SortableMetricCard({
  metric,
  ready,
  ignoreClickRef,
}: {
  metric: DashboardMetric
  ready: boolean
  ignoreClickRef: RefObject<boolean>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: metric.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('touch-none', isDragging && 'opacity-30')}
    >
      <DashboardMetricCard metric={metric} ready={ready} sortable ignoreClickRef={ignoreClickRef} />
    </div>
  )
}

export function DashboardMetricsGrid({ metrics, ready = true, loading = false }: DashboardMetricsGridProps) {
  const [prefs, setPrefs] = useState(loadMetricsPrefs)
  const [configOpen, setConfigOpen] = useState(false)
  const [activeId, setActiveId] = useState<MetricCardId | null>(null)
  const configRef = useRef<HTMLDivElement>(null)
  const ignoreClickRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const metricsById = useMemo(() => new Map(metrics.map((m) => [m.id, m])), [metrics])

  const orderedVisible = useMemo(() => {
    return prefs.order
      .filter((id) => prefs.visible[id] !== false)
      .map((id) => metricsById.get(id))
      .filter((m): m is DashboardMetric => m != null)
  }, [prefs, metricsById])

  const visibleIds = useMemo(() => orderedVisible.map((m) => m.id), [orderedVisible])
  const activeMetric = activeId ? metricsById.get(activeId) : null

  useEffect(() => {
    saveMetricsPrefs(prefs)
  }, [prefs])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (configRef.current && !configRef.current.contains(e.target as Node)) {
        setConfigOpen(false)
      }
    }
    if (configOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [configOpen])

  const persist = (next: typeof prefs) => setPrefs(next)

  const toggleVisible = (id: MetricCardId) => {
    const currentlyVisible = prefs.visible[id] !== false
    const visibleCount = prefs.order.filter((itemId) => prefs.visible[itemId] !== false).length
    if (currentlyVisible && visibleCount <= 1) return

    persist({
      ...prefs,
      visible: { ...prefs.visible, [id]: !currentlyVisible },
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    ignoreClickRef.current = false
    setActiveId(event.active.id as MetricCardId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (active.id !== over?.id) {
      ignoreClickRef.current = true
      window.setTimeout(() => {
        ignoreClickRef.current = false
      }, 120)
    }

    if (!over || active.id === over.id) return

    persist({
      ...prefs,
      order: mergeVisibleReorder(
        prefs.order,
        visibleIds,
        active.id as MetricCardId,
        over.id as MetricCardId,
        prefs.visible,
      ),
    })
  }

  const handleDragCancel = () => setActiveId(null)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[148px] animate-pulse rounded-2xl bg-[#ececec]" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-end" ref={configRef}>
        <button
          type="button"
          onClick={() => setConfigOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#f05123] transition hover:text-[#e04a1f]"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Tùy chỉnh
        </button>

        {configOpen ? (
          <div className="absolute right-0 top-7 z-30 w-60 rounded-xl border border-[#ececec] bg-white p-3 shadow-lg">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#9ca3af] uppercase">
              Hiển thị card
            </p>
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {prefs.order.map((id) => {
                const metric = metricsById.get(id)
                if (!metric) return null
                const checked = prefs.visible[id] !== false
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-[#374151] hover:bg-[#fafafa]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVisible(id)}
                        className="h-4 w-4 rounded border-[#d1d5db] accent-[#f05123]"
                      />
                      <span className="truncate">{metric.label}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 border-t border-[#f3f4f6] pt-2 text-[11px] leading-relaxed text-[#9ca3af]">
              Giữ và kéo cả card để đổi vị trí. Click nhanh để xem chi tiết. Tối thiểu 1 card.
            </p>
          </div>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={visibleIds} strategy={rectSortingStrategy}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orderedVisible.map((metric) => (
              <SortableMetricCard
                key={metric.id}
                metric={metric}
                ready={ready}
                ignoreClickRef={ignoreClickRef}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
          {activeMetric ? (
            <div className="scale-[1.02] rotate-1">
              <DashboardMetricCard metric={activeMetric} ready overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {orderedVisible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#ececec] py-10 text-center text-sm text-[#9ca3af]">
          Chưa chọn card nào. Bấm{' '}
          <button
            type="button"
            className="font-semibold text-[#f05123] hover:underline"
            onClick={() => setConfigOpen(true)}
          >
            Tùy chỉnh
          </button>{' '}
          để bật lại.
        </p>
      ) : null}
    </div>
  )
}
