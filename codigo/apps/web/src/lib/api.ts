import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const match = document.cookie.split(';').find((c) => c.trim().startsWith('bm_token='))
    const token = match?.split('=')[1]
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      document.cookie = 'bm_token=; path=/; max-age=0'
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { api }
