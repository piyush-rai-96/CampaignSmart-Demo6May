import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Header } from 'impact-ui/src/components/Header/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Breadcrumbs } from 'impact-ui/src/components/Breadcrumbs/index.js'

import { ImpactUiSidebar, NAV_ROUTES } from '@/components/layout/impact-ui-sidebar'
import { PRODUCT_NAME } from '@/config/brand'

/** Build the breadcrumb trail from the current pathname. */
function buildBreadcrumbs(pathname: string, navigate: (path: string) => void) {
  const crumbs: { label: string; onClick?: () => void; disabled?: boolean }[] = [
    { label: 'Home', onClick: () => navigate('/campaigns') },
  ]

  if (pathname.startsWith('/campaigns')) {
    crumbs.push({ label: 'Campaign Engine', onClick: () => navigate('/campaigns') })
    if (pathname === '/campaigns/overview') {
      crumbs.push({ label: 'Overview' })
    } else if (pathname.startsWith('/campaigns/') && pathname !== '/campaigns') {
      crumbs.push({ label: 'Active Campaign' })
    } else {
      crumbs[crumbs.length - 1] = { label: 'Campaign Engine', disabled: true }
    }
  } else if (pathname.startsWith('/creative-studio')) {
    crumbs.push({ label: 'Creative Studio', disabled: true })
  } else if (pathname.startsWith('/segments')) {
    crumbs.push({ label: 'Segment Library', disabled: true })
  } else if (pathname.startsWith('/promos')) {
    crumbs.push({ label: 'Promotion Library', disabled: true })
  }

  return crumbs
}

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const parentActive =
    NAV_ROUTES.find(
      (r) => location.pathname === r.link || location.pathname.startsWith(r.link + '/'),
    )?.value ?? ''

  const sidebarWidth = isOpen ? 280 : 64
  const breadcrumbList = buildBreadcrumbs(location.pathname, navigate)

  return (
    <div className={isOpen ? 'layout-sidebar-open' : 'layout-sidebar-closed'}>
      <ImpactUiSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        parentActive={parentActive}
        onNavigate={(path) => navigate(path)}
        onLogout={() => navigate('/login')}
      />

      <Header
        title={PRODUCT_NAME}
        userName="John Doe"
        showNotificationIcon={true}
        notificationIndicator={true}
        showHelpIcon={true}
        showMessageIcon={false}
        showChatBotIcon={false}
        handleLogoClick={() => navigate('/campaigns')}
        handleHelpClick={() => {}}
        handleNotificationClick={() => {}}
        handleChatBotClick={() => {}}
        dropMenuOptions={[
          { label: 'John Doe', onClick: () => {} },
          { label: 'Sign Out', onClick: () => navigate('/login') },
        ]}
      />

      <main
        style={{
          marginLeft: `${sidebarWidth}px`,
          marginTop: '56px',
          transition: 'margin-left 0.3s ease',
        }}
        className="h-[calc(100vh-56px)] overflow-auto relative z-0"
      >
        <div className="px-8 py-3 border-b border-border bg-surface-secondary">
          <Breadcrumbs list={breadcrumbList} />
        </div>

        <Outlet />
      </main>
    </div>
  )
}
