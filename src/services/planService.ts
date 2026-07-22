export const PLAN_DURATIONS = {
  monthly: 30,
  yearly: 365,
  weekly: 7,
};

/**
 * Parses the expiration string. It handles both 'YYYY-MM-DD' and full ISO strings.
 */
export function parseExpiration(expiration: string): Date {
  if (expiration.includes("T")) {
    return new Date(expiration);
  }
  return new Date(expiration + "T00:00:00");
}

/**
 * Returns true if the given expiration date is within the next `thresholdDays` days.
 */
export function isExpiringSoon(expiration: string, thresholdDays: number = 5): boolean {
  const expDate = parseExpiration(expiration);
  const now = new Date();
  const diff = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= thresholdDays;
}

/**
 * Returns true if the user is within the grace period (3 days after expiration).
 */
export function isInGracePeriod(expiration: string, graceDays: number = 3): boolean {
  const expDate = parseExpiration(expiration);
  const now = new Date();
  const diff = (now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= graceDays;
}

/**
 * Returns true if the user should be blocked (expiration + grace period has passed).
 */
export function isBlocked(expiration: string, graceDays: number = 3): boolean {
  const expDate = parseExpiration(expiration);
  const now = new Date();
  const diff = (now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24);
  return diff > graceDays;
}

/**
 * Helper to calculate new expiration date when adding a plan.
 * `plan` should be 'monthly' | 'yearly' | 'weekly'.
 */
export function addPlanDuration(currentExpiration: string | null, plan: keyof typeof PLAN_DURATIONS): string {
  const now = new Date();
  const base = currentExpiration ? new Date(currentExpiration + "T00:00:00") : now;
  const daysToAdd = PLAN_DURATIONS[plan];
  const newDate = new Date(base.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return newDate.toISOString().split('T')[0]; // return YYYY-MM-DD
}
