// ─────────────────────────────────────────────
// ACTION API
// Handles all action-related operations.
// Swap the mock implementations for real
// fetch() calls when the backend is ready.
// ─────────────────────────────────────────────

import { ACTIONS, SUMMARY_STATS } from '../data/mockData';

/**
 * Fetch all actions for the current user.
 * @returns {Promise<Array>} list of action objects
 */
export async function fetchActions() {
  // TODO: replace with real endpoint
  // return fetch('/api/actions').then(r => r.json());
  return Promise.resolve([...ACTIONS]);
}

/**
 * Fetch summary counts (Today / This Week / This Month / Watch).
 * @returns {Promise<Array>}
 */
export async function fetchSummaryStats() {
  // TODO: return fetch('/api/actions/summary').then(r => r.json());
  return Promise.resolve([...SUMMARY_STATS]);
}

/**
 * Mark an action as done with an outcome and optional notes.
 * @param {string} actionId
 * @param {string} outcome  — value from OUTCOME_OPTIONS
 * @param {string} notes    — free text
 * @returns {Promise<{ success: boolean }>}
 */
export async function markActionDone(actionId, outcome, notes) {
  // TODO: replace with real endpoint
  // return fetch(`/api/actions/${actionId}/done`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ outcome, notes }),
  // }).then(r => r.json());
  console.log('[actionApi] markActionDone', { actionId, outcome, notes });
  return Promise.resolve({ success: true });
}

/**
 * Snooze an action for a given number of hours.
 * @param {string} actionId
 * @param {number} hours
 * @returns {Promise<{ success: boolean }>}
 */
export async function snoozeAction(actionId, hours = 24) {
  // TODO: return fetch(`/api/actions/${actionId}/snooze`, {
  //   method: 'PATCH',
  //   body: JSON.stringify({ hours }),
  // }).then(r => r.json());
  console.log('[actionApi] snoozeAction', { actionId, hours });
  return Promise.resolve({ success: true });
}
