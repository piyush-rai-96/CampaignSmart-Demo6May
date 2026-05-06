import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Palette, Users, Tag } from 'lucide-react'

// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Sidebar } from 'impact-ui/src/components/Sidebar/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Header } from 'impact-ui/src/components/Header/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Breadcrumbs } from 'impact-ui/src/components/Breadcrumbs/index.js'

const NAV_ROUTES = [
  { value: 'campaigns',       label: 'Campaign Engine',   icon: <LayoutDashboard size={20} />, link: '/campaigns',       children: [] },
  { value: 'creative-studio', label: 'Creative Studio',   icon: <Palette size={20} />,        link: '/creative-studio',  children: [] },
  { value: 'segments',        label: 'Segment Library',   icon: <Users size={20} />,          link: '/segments',         children: [] },
  { value: 'promos',          label: 'Promotion Library', icon: <Tag size={20} />,            link: '/promos',           children: [] },
]

const PAGE_TITLES: Record<string, string> = {
  '/campaigns':       'Campaign Engine',
  '/creative-studio': 'Creative Studio',
  '/segments':        'Segment Library',
  '/promos':          'Promotion Library',
}

/** Build a breadcrumb list from the current pathname. */
function buildBreadcrumbs(pathname: string, navigate: (path: string) => void) {
  const crumbs: { label: string; onClick?: () => void; disabled?: boolean }[] = [
    { label: 'Home', onClick: () => navigate('/campaigns') },
  ]

  if (pathname.startsWith('/campaigns')) {
    crumbs.push({ label: 'Campaign Engine', onClick: () => navigate('/campaigns') })
    if (pathname === '/campaigns/overview') {
      crumbs.push({ label: 'Overview' })
    } else if (pathname.startsWith('/campaigns/') && pathname !== '/campaigns') {
      // dynamic :id route
      crumbs.push({ label: 'Active Campaign' })
    } else {
      // /campaigns itself — make last item non-link (disabled)
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

  const parentActive = NAV_ROUTES.find(r =>
    location.pathname === r.link || location.pathname.startsWith(r.link + '/')
  )?.value ?? ''

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'Agentic Campaign Personalization Engine'

  const handleParentRouteChange = (item: { link: string }) => {
    navigate(item.link)
  }

  const breadcrumbList = buildBreadcrumbs(location.pathname, navigate)

  return (
    <>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleClose={() => setIsOpen(prev => !prev)}
        routes={NAV_ROUTES}
        actionRoutes={[]}
        parentActive={parentActive}
        handleParentRouteChange={handleParentRouteChange}
        childActive=""
        handleChildRouteChange={() => {}}
        handleLogOut={() => navigate('/login')}
        isMemoryRouter={false}
        isCloseWhenClickOutside={true}
      />
      <Header
        title={pageTitle}
        userName="John Doe"
        showNotificationIcon={false}
        showHelpIcon={false}
        showMessageIcon={false}
        showChatBotIcon={false}
        dropMenuOptions={[
          { label: 'John Doe', onClick: () => {} },
          { label: 'Sign Out', onClick: () => navigate('/login') },
        ]}
      />
      <main
        style={{ marginLeft: '64px', marginTop: '56px' }}
        className="h-[calc(100vh-56px)] overflow-auto relative z-0"
      >
        {/* Breadcrumb bar — shown on every screen */}
        <div className="px-6 py-3 border-b border-border bg-surface">
          <Breadcrumbs list={breadcrumbList} />
        </div>

        <Outlet />
      </main>
    </>
  )
}
