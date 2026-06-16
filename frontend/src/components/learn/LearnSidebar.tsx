import { CheckCircle2, Circle, FileText, HelpCircle, PlayCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { LearnChapter, LearnLesson } from '@/types/learn'
import { LESSON_TYPE_LABEL } from '@/types/lesson'

interface LearnSidebarProps {
  chapters: LearnChapter[]
  activeLessonId: number | null
  onSelectLesson: (lesson: LearnLesson) => void
}

export function LearnSidebar({ chapters, activeLessonId, onSelectLesson }: LearnSidebarProps) {
  return (
    <aside className="space-y-4">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <h3 className="px-2 text-xs font-bold tracking-wide text-[#9ca3af] uppercase">
            {chapter.title}
          </h3>
          <ul className="mt-2 space-y-1">
            {chapter.lessons.map((lesson) => {
              const active = lesson.id === activeLessonId
              const Icon =
                lesson.hasQuiz ? HelpCircle : lesson.lessonType === 0 ? PlayCircle : FileText

              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson)}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition',
                      active ? 'bg-[#fff4f0] text-[#f05123]' : 'text-[#374151] hover:bg-[#f8f8f8]',
                    )}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{lesson.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] opacity-70">
                        <Icon className="h-3 w-3" />
                        {lesson.hasQuiz ? 'Quiz' : LESSON_TYPE_LABEL[lesson.lessonType]}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </aside>
  )
}
