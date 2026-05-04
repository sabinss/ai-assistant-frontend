export default function Header({ user }) {
  return (
    <header style={{
      height: 52, background: '#1B3A8C', display: 'flex', alignItems: 'center',
      padding: '0 20px', flexShrink: 0, gap: 16,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🚀</span>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Co<span style={{ color: '#FFC947' }}>Wrkr</span>
        </span>
      </div>

      {/* Hamburger */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button style={{
          width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)',
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', cursor: 'pointer' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Welcome back</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{user.email}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff',
        }}>
          {user.initials}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>▾</span>
      </div>
    </header>
  );
}
