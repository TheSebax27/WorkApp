import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Application, ApplicationStatus } from '../types'

export function useApplications(userId: string | null) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setApplications(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const addApplication = async (jobId: string, notas = '') => {
    if (!userId) return
    const { data } = await supabase
      .from('applications')
      .insert({ user_id: userId, job_id: jobId, estado: 'preparando', notas, fecha_aplicacion: new Date().toISOString().split('T')[0] })
      .select()
      .single()
    if (data) setApplications(prev => [data, ...prev])
  }

  const updateStatus = async (id: string, estado: ApplicationStatus) => {
    await supabase.from('applications').update({ estado }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, estado } : a))
  }

  const deleteApplication = async (id: string) => {
    await supabase.from('applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  return { applications, loading, addApplication, updateStatus, deleteApplication, refetch: fetch }
}
