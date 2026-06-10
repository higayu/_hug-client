import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileEdit, LogOut, MessageSquare, User, UserSquare, X } from 'lucide-react';
import { clearAuth, getAuthUser } from '../lib/auth';

type SidebarProps = {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
};

const Sidebar = ({ isOpenMobile, onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const authUser = getAuthUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className={`sidebar-container ${isOpenMobile ? 'open' : ''}`} style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-inverse)',
      borderRight: '1px solid var(--border-color)',
    }}>
      <div style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>伴走ナビ</h2>
        <button 
          onClick={onCloseMobile}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: isOpenMobile ? 'block' : 'none' }}
        >
          <X size={24} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <NavItem to="/ai-record-editer" icon={<FileEdit />} label="AI校正機能" onClick={onCloseMobile} />
        <NavItem to="/chat" icon={<MessageSquare />} label="AI問い合わせ" onClick={onCloseMobile} />
        <NavItem to="/dashboard" icon={<LayoutDashboard />} label="ダッシュボード" onClick={onCloseMobile} />
        <NavItem to="/personal-record" icon={<UserSquare />} label="個人記録" onClick={onCloseMobile} />
        <NavItem to="/hug-personal-record" icon={<UserSquare />} label="hugから個人記録取得" onClick={onCloseMobile} />
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ minWidth: '32px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {authUser?.name || '未ログイン'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {authUser?.email || '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="ログアウト"
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.875rem 1.5rem',
        color: isActive ? 'var(--primary-color)' : 'var(--text-inverse)',
        textDecoration: 'none',
        backgroundColor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
        borderRight: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
        transition: 'background-color var(--transition-fast)',
        gap: '1rem'
      })}
    >
      <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontWeight: 500 }}>{label}</span>
    </NavLink>
  );
}

export default Sidebar;
