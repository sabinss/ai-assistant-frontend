// ─────────────────────────────────────────────
// SCORING API
// Fetches account scores and scoring metadata.
// Swap mock data for real endpoint when ready.
// ─────────────────────────────────────────────

const MOCK_SCORING_META = {
  lastRun: 'today at 08:45 AM',
  nextRun: 'in 7 days',
  scoringWindowDays: 60,
  todayActionCount: 2,
};

/**
 * Fetch scoring run metadata (last run time, next run, window).
 * @returns {Promise<Object>}
 */
export async function fetchScoringMeta() {
  // TODO: return fetch('/api/scoring/meta').then(r => r.json());
  return Promise.resolve({ ...MOCK_SCORING_META });
}

/**
 * Fetch the score breakdown for a specific company.
 * @param {string} companyId
 * @returns {Promise<Object>}
 */
export async function fetchCompanyScores(companyId) {
  // TODO: return fetch(`/api/scoring/companies/${companyId}`).then(r => r.json());
  console.log('[scoringApi] fetchCompanyScores', companyId);
  return Promise.resolve({ companyId, valueScore: null, riskScore: null, opportunityScore: null });
}
