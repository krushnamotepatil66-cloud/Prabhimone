// ─── API Base Configuration ───────────────────────────────────────────────────
// Production backend: https://backend.prabhimtechnologies.in
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://backend.prabhimtechnologies.in";

export const API_ENDPOINTS = {
  // ── Authentication ──────────────────────────────────────────────────────────
  REGISTER: "/api/v1/auth/register/",
  VERIFY_EMAIL: "/api/v1/auth/verify-email/",
  RESEND_OTP: "/api/v1/auth/resend-otp/",
  LOGIN: "/api/v1/auth/login/",
  LOGOUT: "/api/v1/auth/logout/",
  LOGOUT_ALL: "/api/v1/auth/logout-all/",
  TOKEN_REFRESH: "/api/v1/auth/token/refresh/",
  SESSIONS: "/api/v1/auth/sessions/",

  // ── Profile ──────────────────────────────────────────────────────────────────
  ME: "/api/v1/auth/me/",
  PROFILE: "/api/v1/auth/profile/",
  PROFILE_IMAGE: "/api/v1/auth/profile/image/",
  FORGOT_PASSWORD: "/api/v1/auth/forgot-password/",
  VERIFY_RESET_OTP: "/api/v1/auth/verify-reset-otp/",
  RESET_PASSWORD: "/api/v1/auth/reset-password/",
  CHANGE_PASSWORD: "/api/v1/auth/change-password/",

  // ── Customers ─────────────────────────────────────────────────────────────────
  CUSTOMERS: "/api/v1/customers/",
  CUSTOMER_DETAIL: (id) => `/api/v1/customers/${id}/`,
  CUSTOMER_RESTORE: (id) => `/api/v1/customers/${id}/restore/`,
  CUSTOMER_ACTIVATE: (id) => `/api/v1/customers/${id}/activate/`,
  CUSTOMER_DEACTIVATE: (id) => `/api/v1/customers/${id}/deactivate/`,

  // ── Products / Items ──────────────────────────────────────────────────────────
  PRODUCTS: "/api/v1/products/",
  PRODUCT_DETAIL: (id) => `/api/v1/products/${id}/`,
  PRODUCT_RESTORE: (id) => `/api/v1/products/${id}/restore/`,
  PRODUCT_ACTIVATE: (id) => `/api/v1/products/${id}/activate/`,
  PRODUCT_DEACTIVATE: (id) => `/api/v1/products/${id}/deactivate/`,
  PRODUCT_BULK_DELETE: "/api/v1/products/bulk-delete/",
  PRODUCT_BULK_ACTIVATE: "/api/v1/products/bulk-activate/",
  PRODUCT_BULK_DEACTIVATE: "/api/v1/products/bulk-deactivate/",

  // ── Invoices ──────────────────────────────────────────────────────────────────
  INVOICES: "/api/v1/invoices/",
  INVOICE_DETAIL: (id) => `/api/v1/invoices/${id}/`,
  INVOICE_MARK_SENT: (id) => `/api/v1/invoices/${id}/mark-sent/`,
};
