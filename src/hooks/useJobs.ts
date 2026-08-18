import { useState, useCallback } from 'react'
import type { Job, JobFilters } from '../types'
import { fetchAllJobs } from '../services/jobApi'

const DEFAULT_FILTERS: JobFilters = {
  remoto: null,
  pais: '',
  stack: '',
  fuente: '',
  minScore: 0,
}

export function useJobs(userStack: string[] = []) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllJobs(userStack)
      setJobs(data)
      setLastFetch(new Date())
    } catch (e) {
      setError('Error al cargar ofertas. Verifica tu conexión.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [userStack])

  const filtered = jobs.filter(j => {
    if (filters.remoto !== null && j.remoto !== filters.remoto) return false
    if (filters.pais && !j.pais.toLowerCase().includes(filters.pais.toLowerCase())) return false
    if (filters.fuente && j.fuente !== filters.fuente) return false
    if (filters.stack && !j.tags.some(t => t.toLowerCase().includes(filters.stack.toLowerCase()))) return false
    if (j.score < filters.minScore) return false
    return true
  })

  return { jobs: filtered, totalJobs: jobs.length, loading, error, filters, setFilters, fetchJobs, lastFetch }
}
