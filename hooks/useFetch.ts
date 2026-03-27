'use client'
import { useState, useEffect } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    setError(null)

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    }

    fetch(url, { ...options, headers })
      .then(async (res) => {
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        } else {
          setError(json.message || 'Request failed')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [url, trigger])

  return { data, loading, error, refetch: () => setTrigger(t => t + 1) }
}
