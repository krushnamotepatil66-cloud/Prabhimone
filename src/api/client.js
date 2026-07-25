import { API_BASE_URL, API_ENDPOINTS } from "./config";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");
export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = { ...options, headers };

  let response = await fetch(url, config);

  // Auto-refresh token on 401
  if (response.status === 401 && getRefreshToken()) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        headers["Authorization"] = `Bearer ${token}`;
        return fetch(url, { ...config, headers });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");
      const data = await refreshRes.json();
      setTokens(data.data.access, data.data.refresh || getRefreshToken());
      processQueue(null, data.data.access);
      headers["Authorization"] = `Bearer ${data.data.access}`;
      response = await fetch(url, { ...config, headers });
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      window.location.href = "/login";
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function handleResponse(responsePromise) {
  const res = await responsePromise;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data?.message || data?.detail;
    if (!message && typeof data === "object" && data !== null) {
      const errors = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          errors.push(`${key}: ${value.join(" ")}`);
        } else if (typeof value === "object" && value !== null) {
          errors.push(`${key}: ${JSON.stringify(value)}`);
        } else {
          errors.push(`${key}: ${value}`);
        }
      }
      if (errors.length > 0) {
        message = errors.join(" | ");
      }
    }
    throw new Error(message || "Request failed");
  }
  return data;
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.REGISTER, { method: "POST", body: JSON.stringify(payload) })
    ),

  verifyEmail: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.VERIFY_EMAIL, { method: "POST", body: JSON.stringify(payload) })
    ),

  resendOtp: (email, purpose = "registration") =>
    handleResponse(
      apiFetch(API_ENDPOINTS.RESEND_OTP, {
        method: "POST",
        body: JSON.stringify({ email, purpose }),
      })
    ),

  login: async (email, password) => {
    const data = await handleResponse(
      apiFetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
    );
    if (data?.data?.access) {
      setTokens(data.data.access, data.data.refresh);
    }
    return data;
  },

  logout: async (refreshToken) => {
    const data = await handleResponse(
      apiFetch(API_ENDPOINTS.LOGOUT, {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken || getRefreshToken() }),
      })
    );
    clearTokens();
    return data;
  },

  logoutAll: () =>
    handleResponse(apiFetch(API_ENDPOINTS.LOGOUT_ALL, { method: "POST" })),

  refreshToken: (refresh) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.TOKEN_REFRESH, {
        method: "POST",
        body: JSON.stringify({ refresh }),
      })
    ),

  getSessions: () => handleResponse(apiFetch(API_ENDPOINTS.SESSIONS)),
};

// ─── Profile APIs ─────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: () => handleResponse(apiFetch(API_ENDPOINTS.ME)),

  getProfile: () => handleResponse(apiFetch(API_ENDPOINTS.PROFILE)),

  updateProfile: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PROFILE, { method: "PUT", body: JSON.stringify(payload) })
    ),

  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append("profile_image", file);
    const token = getAccessToken();
    return handleResponse(
      fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE_IMAGE}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
    );
  },

  forgotPassword: (email) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ email }),
      })
    ),

  verifyResetOtp: (email, otp) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.VERIFY_RESET_OTP, {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      })
    ),

  resetPassword: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.RESET_PASSWORD, { method: "POST", body: JSON.stringify(payload) })
    ),

  changePassword: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.CHANGE_PASSWORD, { method: "POST", body: JSON.stringify(payload) })
    ),
};

// ─── Customer APIs ────────────────────────────────────────────────────────────
export const customerApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return handleResponse(apiFetch(`${API_ENDPOINTS.CUSTOMERS}${query ? "?" + query : ""}`));
  },

  create: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.CUSTOMERS, { method: "POST", body: JSON.stringify(payload) })
    ),

  get: (id) => handleResponse(apiFetch(API_ENDPOINTS.CUSTOMER_DETAIL(id))),

  update: (id, payload, partial = false) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.CUSTOMER_DETAIL(id), {
        method: partial ? "PATCH" : "PUT",
        body: JSON.stringify(payload),
      })
    ),

  delete: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.CUSTOMER_DETAIL(id), { method: "DELETE" })),

  restore: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.CUSTOMER_RESTORE(id), { method: "POST" })),

  activate: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.CUSTOMER_ACTIVATE(id), { method: "POST" })),

  deactivate: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.CUSTOMER_DEACTIVATE(id), { method: "POST" })),
};

// ─── Product/Item APIs ────────────────────────────────────────────────────────
export const productApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return handleResponse(apiFetch(`${API_ENDPOINTS.PRODUCTS}${query ? "?" + query : ""}`));
  },

  create: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PRODUCTS, { method: "POST", body: JSON.stringify(payload) })
    ),

  get: (id) => handleResponse(apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(id))),

  update: (id, payload, partial = true) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(id), {
        method: partial ? "PATCH" : "PUT",
        body: JSON.stringify(payload),
      })
    ),

  delete: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(id), { method: "DELETE" })),

  restore: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.PRODUCT_RESTORE(id), { method: "POST" })),

  activate: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.PRODUCT_ACTIVATE(id), { method: "POST" })),

  deactivate: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.PRODUCT_DEACTIVATE(id), { method: "POST" })),

  bulkDelete: (ids) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PRODUCT_BULK_DELETE, { method: "POST", body: JSON.stringify({ ids }) })
    ),

  bulkActivate: (ids) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PRODUCT_BULK_ACTIVATE, { method: "POST", body: JSON.stringify({ ids }) })
    ),

  bulkDeactivate: (ids) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.PRODUCT_BULK_DEACTIVATE, { method: "POST", body: JSON.stringify({ ids }) })
    ),
};

// ─── Invoice APIs ─────────────────────────────────────────────────────────────
export const invoiceApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return handleResponse(apiFetch(`${API_ENDPOINTS.INVOICES}${query ? "?" + query : ""}`));
  },

  create: (payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.INVOICES, { method: "POST", body: JSON.stringify(payload) })
    ),

  get: (id) => handleResponse(apiFetch(API_ENDPOINTS.INVOICE_DETAIL(id))),

  update: (id, payload) =>
    handleResponse(
      apiFetch(API_ENDPOINTS.INVOICE_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
    ),

  delete: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.INVOICE_DETAIL(id), { method: "DELETE" })),

  markSent: (id) =>
    handleResponse(apiFetch(API_ENDPOINTS.INVOICE_MARK_SENT(id), { method: "POST" })),
};
