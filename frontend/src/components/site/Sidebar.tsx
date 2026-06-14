import { NavLink } from 'react-router-dom'

import {
  IconBook,
  IconHome,
  IconUserBook,
} from '@/components/site/SidebarIcons'
import { HEADER_HEIGHT_PX, SIDEBAR_WIDTH_PX } from '@/constants/layout'

function SidebarLink({
  to,
  end,
  icon: Icon,
  label,
}: {
  to: string
  end?: boolean
  icon: typeof IconHome
  label: string
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-[11px] font-medium transition-colors',
          isActive ? 'bg-[#ebebeb] text-[#292929]' : 'text-[#666] hover:bg-[#f5f5f5]',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5" />
      <span className="text-center leading-tight">{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <>
      <aside
        className="fixed left-0 z-40 hidden flex-col items-center bg-transparent py-3 lg:flex"
        style={{
          top: HEADER_HEIGHT_PX,
          width: SIDEBAR_WIDTH_PX,
          height: `calc(100vh - ${HEADER_HEIGHT_PX}px)`,
        }}
      >
        <nav className="flex w-full flex-col items-center gap-0.5 px-1.5">
          <SidebarLink to="/" end icon={IconHome} label="Trang chủ" />
          <SidebarLink to="/courses" icon={IconBook} label="Khóa học" />
          <SidebarLink to="/my-courses" icon={IconUserBook} label="Của tôi" />
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#ebebeb] bg-white px-1 py-1 lg:hidden">
        <div className="flex flex-1">
          <SidebarLink to="/" end icon={IconHome} label="Trang chủ" />
        </div>
        <div className="flex flex-1">
          <SidebarLink to="/courses" icon={IconBook} label="Khóa học" />
        </div>
        <div className="flex flex-1">
          <SidebarLink to="/my-courses" icon={IconUserBook} label="Của tôi" />
        </div>
      </nav>
    </>
  )
}

export { SIDEBAR_WIDTH_CLASS } from '@/constants/layout'
