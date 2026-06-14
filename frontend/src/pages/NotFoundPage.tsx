import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f8f8] px-4">
      <h1 className="text-6xl font-bold text-[#f05123]">404</h1>
      <p className="mt-4 text-lg text-[#666]">Trang bạn tìm không tồn tại.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d93d0f]"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
