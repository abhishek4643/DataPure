/**
 * api.js — Axios instance and all API call functions.
 * Base URL is read from VITE_API_BASE_URL environment variable.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Entries ─────────────────────────────────

/** Submit a new entry for redundancy validation */
export const submitEntry = (data) => api.post('/entries', data);

/** Get paginated list of all entries */
export const getEntries = (params = {}) => api.get('/entries', { params });

// ─── Stats ────────────────────────────────────

/** Get dashboard statistics */
export const getStats = () => api.get('/stats');

// ─── Flagged ─────────────────────────────────

/** Get all pending flagged entries */
export const getFlagged = () => api.get('/flagged');

/** Approve a flagged entry (inserts it into main DB) */
export const approveFlagged = (id) => api.post(`/flagged/${id}/approve`);

/** Reject a flagged entry */
export const rejectFlagged = (id) => api.post(`/flagged/${id}/reject`);

// ─── Scan ─────────────────────────────────────

/** Trigger a duplicate scan on existing records */
export const scanDuplicates = () => api.post('/scan-duplicates');

export default api;
