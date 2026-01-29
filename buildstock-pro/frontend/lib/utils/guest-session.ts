/**
 * Get or create a guest session ID
 */
export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('guest_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Clear guest session ID
 */
export function clearGuestSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('guest_session_id');
}
