/** @deprecated Mock đã tắt — luôn dùng API backend. Giữ type để tránh break import cũ. */
export type MockModule = 'reports' | 'learn' | 'quizStudent'

export function isMockEnabled(_module: MockModule): boolean {
  return false
}
