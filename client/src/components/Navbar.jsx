import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, CircleDollarSign, History, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Given (Lender)', path: '/lender', icon: CircleDollarSign },
    { name: 'Taken (Borrower)', path: '/borrower', icon: Wallet },
    { name: 'History', path: '/history', icon: History }
  ];

  return (
    <header style={{ 
      background: 'rgba(10, 14, 23, 0.8)', 
      backdropFilter: 'blur(16px)', 
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container flex-between" style={{ height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h2 className="text-gradient">LendOS</h2>
          
          <nav style={{ display: 'flex', gap: '1rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.app_id}</div>
          </div>
          <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '0.5rem' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
