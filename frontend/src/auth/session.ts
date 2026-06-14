import { tokenService } from '@/auth/token.service'
import { notify } from '@/lib/notify'

export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

let sessionExpiredHandled = false

export function resetSessionExpiredFlag() {
  sessionExpiredHandled = false
}

export function handleSessionExpired() {
  if (sessionExpiredHandled) return
  sessionExpiredHandled = true

  tokenService.clearAuth()
  notify.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))

  const path = window.location.pathname
  if (!path.startsWith('/login') && !path.startsWith('/register')) {
    window.location.assign('/login')
  }
}
