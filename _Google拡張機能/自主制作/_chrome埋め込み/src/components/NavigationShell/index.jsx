import { Menu, X, User } from 'lucide-react'

const navLinkBaseClassName =
  'flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left text-sm font-medium transition-colors'

const navLinkInactiveClassName =
  'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'

const navLinkActiveClassName =
  'bg-blue-50 text-blue-700'

function NavigationShell(props) {
  const {
    NAV_LINKS,
    activePage,
    selectPage,
    setSidebarOpen,
    sidebarOpen,
  } = props

  return (
    <>
      <div
        id="mobile-header"
        className="fixed left-0 top-0 z-40 flex h-12 w-full items-center border-b border-slate-200 bg-white px-3 md:hidden"
      >
        <button
          id="mobile-menu-btn"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          type="button"
          aria-label="メニュー"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div
        id="mobile-overlay"
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden',
          sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setSidebarOpen(false)}
      />

      <div id="sidebar-wrap">
        <aside
          className={[
            'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out',
            'md:static md:z-auto md:translate-x-0 md:shadow-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex h-12 shrink-0 items-center justify-end border-b border-slate-200 px-3 md:hidden">
            <button
              id="sidebar-close"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              type="button"
              aria-label="閉じる"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = activePage === link.key

              return (
                <button
                  key={link.key}
                  type="button"
                  className={[
                    navLinkBaseClassName,
                    isActive ? navLinkActiveClassName : navLinkInactiveClassName,
                  ].join(' ')}
                  onClick={() => selectPage(link.key)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="shrink-0 border-t border-slate-200 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                <User size={18} />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  平野 義幸
                </div>
                <div className="truncate text-xs text-slate-500">
                  PD吉島
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default NavigationShell