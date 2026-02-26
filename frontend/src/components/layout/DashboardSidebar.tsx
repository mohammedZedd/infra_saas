// frontend/src/components/layout/DashboardSidebar.tsx
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  emoji: string;
}

const navItems: NavItem[] = [
  { label: 'Projects',  href: '/dashboard', emoji: '📁' },
  { label: 'Templates', href: '/templates', emoji: '📚', badge: 'Soon' },
  { label: 'Analytics', href: '/analytics', emoji: '📊', badge: 'Pro' },
  { label: 'Billing',   href: '/billing',   emoji: '💳' },
  { label: 'Team',      href: '/team',      emoji: '👥' },
  { label: 'Settings',  href: '/settings',  emoji: '⚙️' },
];

export default function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      {/* Logo — même style que la navbar */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          borderBottom: '1px solid #F3F4F6',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #4F6EF7, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>ID</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
          InfraDesigner
        </span>
      </div>

      {/* Workspace info */}
      <div style={{ padding: '20px 16px 0' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: '#9CA3AF',
            margin: '0 0 6px',
          }}
        >
          Workspace
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
            My Workspace
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
            }}
          >
            Free
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#F3F4F6', margin: '0 16px' }} />

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: '12px 12px 0',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === '/dashboard' && location.pathname === '/');

          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#4F46E5' : '#4B5563',
                backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.emoji}</span>
                <span>{item.label}</span>
              </span>

              {item.badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 999,
                    backgroundColor:
                      item.badge === 'Pro' ? '#FEF3C7' : '#F3F4F6',
                    color: item.badge === 'Pro' ? '#B45309' : '#6B7280',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — collé en bas */}
      <div
        style={{
          padding: '12px 14px 16px',
          borderTop: '1px solid #F3F4F6',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#F9FAFB',
            color: '#6B7280',
            fontSize: 12,
            cursor: 'pointer',
            marginBottom: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>❓</span>
            <span>Need help?</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#4F46E5' }}>
            Docs
          </span>
        </button>

        <button
          type="button"
          style={{
            width: '100%',
            padding: '10px 10px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}
        >
          ⚡ Upgrade to Pro
        </button>

        {/* User info en bas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 14,
            padding: '8px 4px 0',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F6EF7, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>J</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>
              John Doe
            </p>
            <p
              style={{
                fontSize: 10,
                color: '#9CA3AF',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              john@company.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}