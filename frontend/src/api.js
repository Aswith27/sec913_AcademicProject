const API_BASE = resolveApiBase()
const TOKEN_KEY = 'planpilot_token'
const USER_KEY = 'planpilot_user'
const REQUEST_TIMEOUT_MS = 15000

function resolveApiBase() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (port === '5173') {
        return '/api'
      }

      return `${protocol}//${hostname}:8002/api`
    }
  }

  return 'http://127.0.0.1:8002/api'
}

function authBase(path) {
  const root = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE
  return `${root}${path}`
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function persistAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

async function request(url, options = {}) {
  let response
  const token = getStoredToken()
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
      ...options,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `The backend API at ${url.replace(/\/[^/]+$/, '')} did not respond within ${Math.floor(REQUEST_TIMEOUT_MS / 1000)} seconds. Check that Spring Boot and the database are both running.`,
      )
    }

    throw new Error(
      `Cannot reach the backend API at ${url.replace(/\/[^/]+$/, '')}. Make sure your Spring Boot backend is running and the frontend .env points to the correct port.`,
    )
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }))
    if (response.status === 401) {
      clearAuth()
    }
    throw new Error(error.detail ?? `Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function signup(payload) {
  const data = await request(authBase('/auth/signup'), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persistAuth(data)
  return data
}

export async function login(payload) {
  const data = await request(authBase('/auth/login'), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persistAuth(data)
  return data
}

export function fetchDashboard() {
  return request(`${API_BASE}/dashboard`)
}

export function semanticSearch(query) {
  return request(`${API_BASE}/search`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export function createPlan(payload) {
  return request(`${API_BASE}/plans`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createSubscription(payload) {
  return request(`${API_BASE}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createAdminUser(payload) {
  return request(`${API_BASE}/admin/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function promoteUserToAdmin(userId) {
  return request(`${API_BASE}/admin/users/${userId}/promote`, {
    method: 'PATCH',
  })
}

export function updateSubscriptionStatus(subscriptionId, status) {
  return request(`${API_BASE}/subscriptions/${subscriptionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ subscription_id: subscriptionId, status }),
  })
}

export function changeSubscriptionPlan(subscriptionId, newPlanId, billingCycle) {
  return request(`${API_BASE}/subscriptions/${subscriptionId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({
      subscription_id: subscriptionId,
      new_plan_id: newPlanId,
      billing_cycle: billingCycle,
    }),
  })
}
