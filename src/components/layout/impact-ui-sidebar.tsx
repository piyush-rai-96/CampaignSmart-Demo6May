import type { Dispatch, SetStateAction } from 'react'
import { LayoutDashboard, Palette, Users, Tag } from 'lucide-react'

// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Sidebar } from 'impact-ui/src/components/Sidebar/index.js'

/**
 * Main app navigation for impact-ui `<Sidebar />`.
 * `value` must match `parentActive`; `link` is passed to the app router on click.
 */
export const NAV_ROUTES = [
  {
    value: 'campaigns',
    label: 'Campaign Engine',
    tooltip: 'Campaign Engine',
    icon: <LayoutDashboard size={20} />,
    link: '/campaigns',
    children: [],
  },
  {
    value: 'creative-studio',
    label: 'Creative Studio',
    tooltip: 'Creative Studio',
    icon: <Palette size={20} />,
    link: '/creative-studio',
    children: [],
  },
  {
    value: 'segments',
    label: 'Segment Library',
    tooltip: 'Segment Library',
    icon: <Users size={20} />,
    link: '/segments',
    children: [],
  },
  {
    value: 'promos',
    label: 'Promotion Library',
    tooltip: 'Promotion Library',
    icon: <Tag size={20} />,
    link: '/promos',
    children: [],
  },
] as const

export type ImpactUiSidebarProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  parentActive: string
  onNavigate: (path: string) => void
  onLogout: () => void
}

/** Thin wrapper — the only place that imports impact-ui `Sidebar` for the shell. */
export function ImpactUiSidebar({
  isOpen,
  setIsOpen,
  parentActive,
  onNavigate,
  onLogout,
}: ImpactUiSidebarProps) {
  return (
    <Sidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleClose={() => setIsOpen((prev) => !prev)}
      routes={[...NAV_ROUTES]}
      actionRoutes={[]}
      parentActive={parentActive}
      handleParentRouteChange={(item: { link: string }) => onNavigate(item.link)}
      childActive=""
      handleChildRouteChange={() => {}}
      handleLogOut={onLogout}
      isMemoryRouter={false}
      isCloseWhenClickOutside={true}
      visibleModulesCount={NAV_ROUTES.length}
    />
  )
}
