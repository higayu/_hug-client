import { Menu, X, User } from 'lucide-react'

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
      <div id="mobile-header" className="mobile-header">
        <button
          id="mobile-menu-btn"
          className="mobile-menu-btn"
          type="button"
          aria-label="メニュー"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div
        id="mobile-overlay"
        className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div id="sidebar-wrap">
        <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <button
              id="sidebar-close"
              className="sidebar-close-btn"
              type="button"
              aria-label="閉じる"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.key}
                  type="button"
                  className={`nav-link ${activePage === link.key ? 'active' : ''}`}
                  onClick={() => selectPage(link.key)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <User size={18} />
              </div>
              <div>
                <div className="user-name">平野 義幸</div>
                <div className="user-facility">吉島事業所</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default NavigationShell
