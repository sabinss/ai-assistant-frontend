import type { PatientPrioritiesDashboardData } from "../types"

/**
 * Synthetic sample payload shaped like the future API response.
 * Swap this for a real fetch — components already consume this shape.
 * Names and details are fake demo data only (not real patients).
 */
export const samplePatientPrioritiesData: PatientPrioritiesDashboardData = {
  clinicName: "Asta Dental",
  updatedLabel: "Updated today at 6:00 AM",
  title: "Patient Priorities",
  subtitle: "Who your team should pay attention to first, and why.",
  listNote: "Only your team can help with these",
  summaryStats: [
    {
      id: "very_high",
      label: "Very High",
      count: 6,
      description: "patients need a person today",
      tone: "very_high",
      active: true,
    },
    {
      id: "health",
      label: "Health",
      count: 2,
      description: "reported pain or symptoms",
      tone: "health",
    },
    {
      id: "might_leave",
      label: "Might be leaving",
      count: 3,
      description: "patients drifting away",
      tone: "might_leave",
    },
    {
      id: "treatment",
      label: "May want treatment",
      count: 5,
      description: "likely to book more care",
      tone: "treatment",
    },
  ],
  filters: [
    { id: "very_high", label: "Very High", count: 6 },
    { id: "high", label: "High", count: 3 },
  ],
  patients: [
    {
      id: "pat-001",
      patientName: "Test Patient 001",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Reply waiting", kind: "reply_waiting" },
        { id: "t3", label: "Treatment", kind: "treatment" },
      ],
      reason:
        "Asked whether her insurance covers the crown Dr. Ben recommended. Nobody has answered yet.",
      meta: "Waiting 2 days · Last visit 7 months ago",
      nextStep: "Call or text back with a coverage answer.",
    },
    {
      id: "pat-002",
      patientName: "Test Patient 002",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Health", kind: "health" },
        { id: "t3", label: "Treatment", kind: "treatment" },
      ],
      reason:
        "Says a lower tooth has been throbbing for 3 days. A crown was recommended in May but never scheduled.",
      meta: "Waiting 1 day · Last visit 6 months ago",
      nextStep: "Call today and offer the earliest appointment.",
    },
    {
      id: "pat-003",
      patientName: "Test Patient 003",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Reply waiting", kind: "reply_waiting" },
        { id: "t3", label: "Treatment", kind: "treatment" },
      ],
      reason:
        "Texted to schedule a filling next week. Only free in the mornings.",
      meta: "Waiting 4 hours · Last visit 2 months ago",
      nextStep: "Offer two morning times this week.",
    },
    {
      id: "pat-004",
      patientName: "Test Patient 004",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Might leave", kind: "might_leave" },
      ],
      reason:
        "Insurance just changed. Looking at other dentists who take the new plan.",
      meta: "Waiting 2 days · Last visit 4 months ago",
      nextStep: "Call and talk through new coverage options.",
    },
    {
      id: "pat-005",
      patientName: "Test Patient 005",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Might leave", kind: "might_leave" },
      ],
      reason:
        "No visit in 14 months. Did not reply to 3 texts and 2 emails about a checkup.",
      meta: "Automated outreach finished with no reply · No future appointment",
      nextStep: "Make a personal call to try to win her back.",
    },
    {
      id: "pat-006",
      patientName: "Test Patient 006",
      priority: "very_high",
      tags: [
        { id: "t1", label: "Very High", kind: "very_high" },
        { id: "t2", label: "Reply waiting", kind: "reply_waiting" },
        { id: "t3", label: "Treatment", kind: "treatment" },
      ],
      reason:
        "Asked what a root canal would cost with his plan. Wants a call with an estimate.",
      meta: "Waiting 1 day · Last visit 3 months ago",
      nextStep: "Call with a benefits estimate and next available slots.",
    },
    {
      id: "pat-007",
      patientName: "Test Patient 007",
      priority: "high",
      tags: [
        { id: "t1", label: "High", kind: "high" },
        { id: "t2", label: "Treatment", kind: "treatment" },
      ],
      reason:
        "Interested in whitening after a cleaning. Asked for pricing but has not booked.",
      meta: "Waiting 3 days · Last visit 3 weeks ago",
      nextStep: "Send two appointment options and a simple price range.",
    },
    {
      id: "pat-008",
      patientName: "Test Patient 008",
      priority: "high",
      tags: [
        { id: "t1", label: "High", kind: "high" },
        { id: "t2", label: "Reply waiting", kind: "reply_waiting" },
      ],
      reason:
        "Requested a records transfer form. Form was sent; no confirmation yet.",
      meta: "Waiting 5 days · Last visit 11 months ago",
      nextStep: "Follow up once to confirm they received the form.",
    },
    {
      id: "pat-009",
      patientName: "Test Patient 009",
      priority: "high",
      tags: [
        { id: "t1", label: "High", kind: "high" },
        { id: "t2", label: "Health", kind: "health" },
      ],
      reason:
        "Mentioned mild gum sensitivity after a cleaning. Not urgent but should be checked.",
      meta: "Waiting 2 days · Last visit 1 week ago",
      nextStep: "Check in and offer a short hygiene follow-up if needed.",
    },
  ],
}
