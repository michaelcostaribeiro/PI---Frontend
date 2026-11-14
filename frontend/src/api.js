const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const DEFAULT_USER_ID = Number(import.meta.env.VITE_DEFAULT_USER_ID || 1)

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || 'Não foi possível concluir a requisição.')
  }

  return response.json()
}

function buildQuery({ dataInicio, dataFim } = {}) {
  const params = new URLSearchParams()
  if (dataInicio) params.set('data_inicio', dataInicio)
  if (dataFim) params.set('data_fim', dataFim)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getProducts(userId = DEFAULT_USER_ID, filters = {}) {
  return request(`/api/afiliados/${userId}/produtos${buildQuery(filters)}`)
}

export function getProduct(userId, productId, filters = {}) {
  return request(`/api/afiliados/${userId}/produtos/${productId}${buildQuery(filters)}`)
}

export function updateProduct(userId, productId, product) {
  return request(`/api/afiliados/${userId}/produtos/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}
