import ActionCard from './ActionCard';

const TIER_CONFIG = {
  today: { label: 'Today',      sub: '· Due today',              pill: { background: '#FDF2F2', color: '#C0392B', border: '1px solid #F5C6C6' } },
  week:  { label: 'This Week',  sub: '· Due by Friday',          pill: { background: '#FFFBF0', color: '#7D5A00', border: '1px solid #F0E0A0' } },
  month: { label: 'This Month', sub: '· Begin preparation now',  pill: { background: '#F0F9F4', color: '#1A5C3A', border: '1px solid #B8DFC8' } },
  watch: { label: 'Watch',      sub: '· No action required',     pill: { background: '#F0F4FB', color: '#2C4A7A', border: '1px solid #C0CDE8' } },
};

export default function TierSection({ tier, actions, onGetDraft, onMarkDone, onViewAccount, onSnooze, onToast }) {
  if (!actions || actions.length === 0) return null;
  const cfg = TIER_CONFIG[tier];

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
          textTransform: 'uppercase', letterSpacing: '0.05em', ...cfg.pill,
        }}>
          {cfg.label}
        </span>
        <span style={{ fontSize: 12, color: '#8B91A3' }}>
          {actions.length} action{actions.length !== 1 ? 's' : ''} {cfg.sub}
        </span>
      </div>

      {actions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onGetDraft={onGetDraft}
          onMarkDone={onMarkDone}
          onViewAccount={onViewAccount}
          onSnooze={onSnooze}
          onToast={onToast}
        />
      ))}
    </div>
  );
}
