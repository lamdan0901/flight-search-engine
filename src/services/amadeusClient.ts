type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
}

const API_BASE = import.meta.env.VITE_AMADEUS_API_BASE ?? 'https://test.api.amadeus.com'
const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET

let tokenCache: { token: string; expiresAt: number } | null = null

export const getApiBase = () => API_BASE

export const getAccessToken = async (): Promise<string> => {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Amadeus credentials')
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  const response = await fetch(`${API_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    throw new Error('Unable to obtain access token')
  }

  const data = (await response.json()) as TokenResponse
  const expiresAt = now + Math.max(0, data.expires_in - 60) * 1000
  tokenCache = { token: data.access_token, expiresAt }
  return data.access_token
}
