import { Outlet } from 'react-router-dom'

import { ContentContainer } from '@/components/site/ContentContainer'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { SIDEBAR_WIDTH_CLASS, Sidebar } from '@/components/site/Sidebar'
import { HEADER_HEIGHT_PX } from '@/constants/layout'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Header />
      <Sidebar />
      <div
        className={`flex flex-col ${SIDEBAR_WIDTH_CLASS}`}
        style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}
      >
        <main className="flex-1 bg-white pt-2 pb-4">
          <ContentContainer>
            <Outlet />
          </ContentContainer>
        </main>
        <Footer />
      </div>
    </div>
  )
}
