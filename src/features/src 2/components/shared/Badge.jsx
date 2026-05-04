// Badge — reusable label chip
// variant: stage-onb | stage-active | stage-risk | renewal | renewal-urgent | owner | new-badge

const VARIANT_STYLES = {
  'stage-onb':     { background: '#EEF0FB', color: '#3B52C4' },
  'stage-active':  { background: '#EEF8F2', color: '#2E7D52' },
  'stage-risk':    { background: '#FDF2F2', color: '#C0392B' },
  'renewal':       { background: '#F5F5F5', color: '#4A5168' },
  'renewal-urgent':{ background: '#FDF2F2', color: '#C0392B' },
  'owner':         { background: '#E8EDF8', color: '#1B3A8C' },
  'new-badge':     { background: '#E8EDF8', color: '#1B3A8C', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.05em' },
};

export default function Badge({ variant = 'owner', children }) {
  const style = {
    fontSize: '10.5px',
    fontWeight: 500,
    padding: '2px 7px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    ...VARIANT_STYLES[variant],
  };
  return <span style={style}>{children}</span>;
}
