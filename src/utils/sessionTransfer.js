function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((base64url.length + 3) % 4)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeTransferPayload(payload) {
  return toBase64Url(JSON.stringify(payload))
}

export function decodeTransferPayload(code) {
  try {
    const json = fromBase64Url((code || '').trim())
    const payload = JSON.parse(json)
    if (!payload || payload.v !== 1) return null
    if (!payload.token || !payload.refreshToken || !payload.tokenExpiry) return null
    if (payload.validUntil && Date.now() > payload.validUntil) return null
    return payload
  } catch (_) {
    return null
  }
}
