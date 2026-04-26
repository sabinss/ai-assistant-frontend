"use client"

import { useState } from "react"
import { OUTCOME_OPTIONS } from "../../data/mockData"
import type { ActionItem, MarkDonePayload } from "../../types"

type DoneModalProps = {
  action: ActionItem | null
  onSave: (payload: MarkDonePayload) => void
  onCancel: () => void
}

export default function DoneModal({ action, onSave, onCancel }: DoneModalProps) {
  const [outcome, setOutcome] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  function handleSave() {
    if (!outcome) {
      setError("Please select an outcome")
      return
    }
    onSave({ outcome, notes })
    setOutcome("")
    setNotes("")
    setError("")
  }

  function handleCancel() {
    setOutcome("")
    setNotes("")
    setError("")
    onCancel()
  }

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: action ? 1 : 0,
    pointerEvents: action ? "all" : "none",
    transition: "opacity 0.18s",
  }
  const modalStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #CDD3E0",
    borderRadius: 12,
    padding: 24,
    width: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    transform: action ? "translateY(0)" : "translateY(6px)",
    transition: "transform 0.18s",
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div style={modalStyle}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>
          Mark Done{action ? ` — ${action.company} / ${action.actionType}` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#8B91A3", marginBottom: 18 }}>
          Record the outcome and any notes before closing
        </div>

        <div style={{ fontSize: 11.5, color: "#4A5168", marginBottom: 5, fontWeight: 500 }}>Outcome</div>
        <select
          value={outcome}
          onChange={(e) => {
            setOutcome(e.target.value)
            setError("")
          }}
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #CDD3E0",
            borderRadius: 6,
            color: "#1A1F2E",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            marginBottom: 12,
            appearance: "none",
            cursor: "pointer",
          }}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {error && <div style={{ fontSize: 12, color: "#C0392B", marginBottom: 8 }}>{error}</div>}

        <div style={{ fontSize: 11.5, color: "#4A5168", marginBottom: 5, fontWeight: 500 }}>
          Notes <span style={{ color: "#8B91A3", fontWeight: 400 }}>(optional)</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What happened? Key points from the conversation…"
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #CDD3E0",
            borderRadius: 6,
            color: "#1A1F2E",
            fontFamily: "inherit",
            fontSize: 13,
            padding: "8px 10px",
            marginBottom: 16,
            resize: "none",
            height: 80,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            style={{
              background: "#fff",
              color: "#4A5168",
              border: "1px solid #CDD3E0",
              padding: "7px 16px",
              fontSize: 13,
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "#1B3A8C",
              color: "#fff",
              border: "none",
              padding: "7px 20px",
              fontSize: 13,
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )
}
