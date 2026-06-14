import { Link } from 'react-router-dom'

import { AppLogo } from '@/components/site/Logo'

const footerLinks = [
  { label: 'Khóa học', to: '/courses' },
  { label: 'Khóa của tôi', to: '/my-courses' },
  { label: 'Đăng nhập', to: '/login' },
  { label: 'Đăng ký', to: '/register' },
]

export function Footer() {
  return (
    <footer className="relative z-50 mt-16 w-screen overflow-hidden bg-[#181821] text-[#a9b3bb] lg:-ml-[96px]">
      <div className="w-full px-6 pb-10 pt-12 sm:px-10 lg:px-[50px] lg:pt-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(260px,380px)_1fr] lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <AppLogo showTagline={false} />
              <strong className="text-[15px] font-bold uppercase leading-[1.35] text-white">
                WebLearning
              </strong>
            </Link>
            <p className="mt-4 max-w-md text-[14px] leading-[1.7]">
              Nền tảng e-learning quản lý khóa học, chương, bài học, quiz và bài tập trực tuyến.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold uppercase text-white">Liên kết</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[14px] leading-[1.7] transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#2d2d35] pt-6">
          <p className="text-[13px] leading-[1.7]">
            © {new Date().getFullYear()} WebLearning. Nền tảng học trực tuyến.
          </p>
        </div>
      </div>
    </footer>
  )
}
