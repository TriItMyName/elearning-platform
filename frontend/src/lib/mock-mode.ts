/** Bật mock theo module — khi BE sẵn sàng, set `VITE_MOCK_<MODULE>=false` trong `.env`. */
export type MockModule = 'assignments' | 'reports' | 'learn' | 'quizStudent'

const ENV_KEYS: Record<MockModule, string> = {
  assignments: 'VITE_MOCK_ASSIGNMENTS',
  reports: 'VITE_MOCK_REPORTS',
  learn: 'VITE_MOCK_LEARN',
  quizStudent: 'VITE_MOCK_QUIZ_STUDENT',
}

export function isMockEnabled(module: MockModule): boolean {
  const key = ENV_KEYS[module]
  const value = import.meta.env[key]
  if (value === 'false') return false
  if (value === 'true') return true
  return true
}
