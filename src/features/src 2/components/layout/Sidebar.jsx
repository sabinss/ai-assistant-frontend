import { NAV_ITEMS, NAV_OTHER_ITEMS } from '../../data/mockData';

const ICONS = {
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  message: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  trending: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>,
  help: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

function NavItem({ item, onSelect }) {
  const isActive = item.active;
  return (
    <div
      onClick={() => onSelect(item.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px',
        fontSize: 13, color: isActive ? '#1B3A8C' : '#4A5168', cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? '#1B3A8C' : 'transparent'}`,
        background: isActive ? '#E8EDF8' : 'transparent',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F2F5FC'; e.currentTarget.style.color = '#1A1F2E'; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4A5168'; } }}
    >
      <span style={{ width: 15, height: 15, flexShrink: 0, display: 'flex' }}>{ICONS[item.icon]}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span style={{
          background: '#1B3A8C', color: '#fff', fontSize: 10, fontWeight: 600,
          padding: '1px 6px', borderRadius: '99px',
        }}>
          {item.badge}
        </span>
      )}
    </div>
  );
}

export default function Sidebar({ onNav, onToast }) {
  return (
    <nav style={{
      width: 210, minWidth: 210, background: '#fff', borderRight: '1px solid #E2E6EF',
      display: 'flex', flexDirection: 'column', padding: '12px 0', overflowY: 'auto',
    }}>
      {NAV_ITEMS.map(item => (
        <NavItem key={item.id} item={item} onSelect={id => onToast(item.label)} />
      ))}

      <div style={{
        fontSize: 10, fontWeight: 600, color: '#8B91A3', textTransform: 'uppercase',
        letterSpacing: '0.07em', padding: '12px 18px 4px',
      }}>
        Others
      </div>

      {NAV_OTHER_ITEMS.map(item => (
        <NavItem key={item.id} item={item} onSelect={() => onToast(item.label)} />
      ))}
    </nav>
  );
}
