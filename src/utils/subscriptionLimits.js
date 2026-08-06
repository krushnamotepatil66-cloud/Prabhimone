/**
 * Subscription Plan Limits — single source of truth
 * Used by all pages and components to enforce feature/usage gates.
 */

export const PLAN_LIMITS = {
  free: {
    displayName: "Free",
    color: "#64748b",
    invoicesPerMonth: 3,
    customers: 5,
    items: 5,
    expenses: 5,
    estimates: 2,
    creditNotes: 2,
    proformaInvoices: 2,
    purchases: false,      // feature locked
    reports: "basic",      // "basic" | "full"
    advancedReports: false,
  },
  Starter: {
    displayName: "Starter",
    color: "#3b82f6",
    invoicesPerMonth: 5,
    customers: 20,
    items: 20,
    expenses: 20,
    estimates: 5,
    creditNotes: 5,
    proformaInvoices: 5,
    purchases: false,      // still locked on Starter
    reports: "basic",
    advancedReports: false,
  },
  Professional: {
    displayName: "Professional",
    color: "#6366f1",
    invoicesPerMonth: Infinity,
    customers: Infinity,
    items: Infinity,
    expenses: Infinity,
    estimates: Infinity,
    creditNotes: Infinity,
    proformaInvoices: Infinity,
    purchases: true,
    reports: "full",
    advancedReports: true,
  },
  Enterprise: {
    displayName: "Enterprise",
    color: "#7c3aed",
    invoicesPerMonth: Infinity,
    customers: Infinity,
    items: Infinity,
    expenses: Infinity,
    estimates: Infinity,
    creditNotes: Infinity,
    proformaInvoices: Infinity,
    purchases: true,
    reports: "full",
    advancedReports: true,
  },
};

/**
 * Returns the plan limits for the given plan name.
 * Falls back to "free" if null, cancelled, or unrecognised.
 */
export function getPlanLimits(planName, subscriptionStatus) {
  if (!planName || subscriptionStatus === "cancelled") return PLAN_LIMITS.free;
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}

/**
 * Checks if a resource is within limit.
 * @param {string} planName
 * @param {string} subscriptionStatus
 * @param {string} resource  - e.g. "invoicesPerMonth", "customers"
 * @param {number} currentCount
 * @returns {{ allowed: boolean, limit: number|null, used: number, pct: number }}
 */
export function checkLimit(planName, subscriptionStatus, resource, currentCount) {
  const limits = getPlanLimits(planName, subscriptionStatus);
  const limit = limits[resource];
  if (limit === Infinity || limit === undefined) {
    return { allowed: true, limit: null, used: currentCount, pct: 0 };
  }
  const pct = limit > 0 ? Math.min(100, Math.round((currentCount / limit) * 100)) : 100;
  return {
    allowed: currentCount < limit,
    limit,
    used: currentCount,
    pct,
  };
}

/**
 * Check if a boolean feature is available on the plan.
 * @param {string} planName
 * @param {string} subscriptionStatus
 * @param {string} feature - e.g. "purchases", "advancedReports"
 * @returns {boolean}
 */
export function isFeatureAllowed(planName, subscriptionStatus, feature) {
  const limits = getPlanLimits(planName, subscriptionStatus);
  return !!limits[feature];
}

/**
 * Returns number of days until the next billing date.
 * Returns null if no billing date set.
 * @param {string|null} nextBillingDate  ISO date string "YYYY-MM-DD"
 */
export function getDaysUntilExpiry(nextBillingDate) {
  if (!nextBillingDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(nextBillingDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Count invoices created in the current calendar month.
 * @param {Array} invoices
 */
export function countInvoicesThisMonth(invoices) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return invoices.filter((inv) => {
    if (!inv.date) return false;
    const d = new Date(inv.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
}

/**
 * Returns the plan to upgrade to for a given feature.
 */
export function getUpgradePlan(feature) {
  if (feature === "purchases" || feature === "advancedReports") return "Professional";
  return "Starter";
}
