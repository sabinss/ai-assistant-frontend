import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: message ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
      background: '#1A1F2E', borderRadius: '99px', padding: '8px 18px',
      fontSize: '12.5px', color: '#fff', opacity: message ? 1 : 0,
      transition: 'all 0.22s', zIndex: 200, whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
}
