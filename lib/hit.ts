export const hit = async (url: string, init?: RequestInit) => {
  const f = async (token?: string) => await fetch(url.startsWith('http') ? url : `${
    process.env.NEXT_PUBLIC_API_URL || ''}${url}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...token ? { Authorization: `Bearer ${token}` } : {},
    },
    credentials: 'include'
  })
  const resp = await f()
  if (resp.status === 401) {
    const token = window && localStorage.getItem('refresh_token')
    if (token) {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`, {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const json = await resp.json()
      if (resp.ok) {
        return f(json.access_token)
      }
      if (window && json.refresh_token) {
        localStorage.setItem('refresh_token', json.refresh_token)
      }
    }
  }
  return resp
}
