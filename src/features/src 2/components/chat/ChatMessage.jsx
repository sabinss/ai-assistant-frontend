import DraftCard from './DraftCard';

export default function ChatMessage({ msg, onToast }) {
  const isUser = msg.role === 'user';
  const time = msg.time;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      {msg.type === 'draft' ? (
        <DraftCard
          subject={msg.subject}
          body={msg.body}
          onCopy={() => onToast('Copied to clipboard')}
          onEdit={() => onToast('Opening editor…')}
        />
      ) : msg.type === 'typing' ? (
        <div style={{
          display: 'flex', gap: 3, padding: '9px 12px', background: '#fff',
          borderRadius: 10, border: '1px solid #E2E6EF', borderBottomLeftRadius: 3,
          width: 'fit-content',
        }}>
          {[0, 150, 300].map(delay => (
            <span key={delay} style={{
              width: 5, height: 5, background: '#8B91A3', borderRadius: '50%',
              display: 'inline-block',
              animation: 'bounce 1.2s infinite',
              animationDelay: `${delay}ms`,
            }} />
          ))}
        </div>
      ) : (
        <div
          style={{
            maxWidth: '90%', padding: '9px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.55,
            background: isUser ? '#1B3A8C' : '#fff',
            color: isUser ? '#fff' : '#1A1F2E',
            border: isUser ? 'none' : '1px solid #E2E6EF',
            borderBottomRightRadius: isUser ? 3 : 10,
            borderBottomLeftRadius: isUser ? 10 : 3,
          }}
          dangerouslySetInnerHTML={{ __html: msg.content }}
        />
      )}
      {time && (
        <div style={{ fontSize: 10, color: '#8B91A3', padding: '0 3px' }}>{time}</div>
      )}
    </div>
  );
}
