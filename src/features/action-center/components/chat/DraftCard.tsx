type DraftCardProps = {
  subject: string
  body: string
  onCopy: () => void
  onEdit: () => void
}

export default function DraftCard({ subject, body, onCopy, onEdit }: DraftCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #CDD3E0",
        borderRadius: 8,
        padding: 12,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#1B3A8C",
          fontWeight: 600,
          marginBottom: 7,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            background: "#1B3A8C",
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
        Draft ready
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1A1F2E",
          marginBottom: 6,
          borderBottom: "1px solid #E2E6EF",
          paddingBottom: 6,
        }}
      >
        {subject}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#4A5168",
          lineHeight: 1.65,
          whiteSpace: "pre-line",
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
        {body}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button
          onClick={onCopy}
          style={{
            fontSize: 11,
            padding: "5px 12px",
            background: "#fff",
            color: "#1B3A8C",
            border: "1px solid #1B3A8C",
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          Copy draft
        </button>
        <button
          onClick={onEdit}
          style={{
            fontSize: 11,
            padding: "5px 12px",
            background: "#fff",
            color: "#4A5168",
            border: "1px solid #CDD3E0",
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          Edit
        </button>
      </div>
    </div>
  )
}
