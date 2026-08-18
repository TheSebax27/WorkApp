import type { Job, RemotiveJob, AdzunaJob } from '../types'

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY

function calcScore(tags: string[], userStack: string[]): number {
  if (!tags.length || !userStack.length) return 0
  const tagsLower = tags.map(t => t.toLowerCase())
  const stackLower = userStack.map(s => s.toLowerCase())
  const matches = stackLower.filter(s => tagsLower.some(t => t.includes(s) || s.includes(t)))
  return Math.round((matches.length / stackLower.length) * 100)
}

export async function fetchRemotiveJobs(userStack: string[] = []): Promise<Job[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=50')
  const data = await res.json()
  return (data.jobs as RemotiveJob[]).map(j => ({
    id: `remotive-${j.id}`,
    fuente: 'remotive' as const,
    titulo: j.title,
    empresa: j.company_name,
    pais: j.candidate_required_location || 'Worldwide',
    url: j.url,
    descripcion: j.description,
    tags: j.tags || [],
    remoto: true,
    salario_min: null,
    salario_max: null,
    moneda: null,
    score: calcScore(j.tags || [], userStack),
    fecha_publicacion: j.publication_date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    fecha_scrape: new Date().toISOString(),
  }))
}

export async function fetchAdzunaJobs(
  country: 'us' | 'gb' | 'au' | 'ca' | 'es',
  userStack: string[] = []
): Promise<Job[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return []
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=developer+remote&results_per_page=20`
  const res = await fetch(url)
  const data = await res.json()
  return ((data.results || []) as AdzunaJob[]).map(j => {
    const tags = [j.category?.label].filter(Boolean) as string[]
    return {
      id: `adzuna-${j.id}`,
      fuente: 'adzuna' as const,
      titulo: j.title,
      empresa: j.company?.display_name ?? 'Desconocida',
      pais: j.location?.display_name ?? country.toUpperCase(),
      url: j.redirect_url,
      descripcion: j.description,
      tags,
      remoto: j.title.toLowerCase().includes('remote') || j.description.toLowerCase().includes('remote'),
      salario_min: j.salary_min ?? null,
      salario_max: j.salary_max ?? null,
      moneda: country === 'es' ? 'EUR' : country === 'au' ? 'AUD' : country === 'ca' ? 'CAD' : 'USD',
      score: calcScore(tags, userStack),
      fecha_publicacion: j.created?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      fecha_scrape: new Date().toISOString(),
    }
  })
}

export async function fetchArbeitnowJobs(userStack: string[] = []): Promise<Job[]> {
  const res = await fetch('https://arbeitnow.com/api/job-board-api')
  const data = await res.json()
  return ((data.data || []) as Array<{
    slug: string; title: string; company_name: string; location: string; url: string
    description: string; tags: string[]; remote: boolean; created_at: number
  }>).map(j => ({
    id: `arbeitnow-${j.slug}`,
    fuente: 'arbeitnow' as const,
    titulo: j.title,
    empresa: j.company_name,
    pais: j.location || 'Europa',
    url: j.url,
    descripcion: j.description,
    tags: j.tags || [],
    remoto: j.remote,
    salario_min: null,
    salario_max: null,
    moneda: 'EUR',
    score: calcScore(j.tags || [], userStack),
    fecha_publicacion: new Date(j.created_at * 1000).toISOString().split('T')[0],
    fecha_scrape: new Date().toISOString(),
  }))
}

export async function fetchAllJobs(userStack: string[] = []): Promise<Job[]> {
  const results = await Promise.allSettled([
    fetchRemotiveJobs(userStack),
    fetchArbeitnowJobs(userStack),
  ])
  const jobs: Job[] = []
  results.forEach(r => { if (r.status === 'fulfilled') jobs.push(...r.value) })
  const seen = new Set<string>()
  return jobs
    .filter(j => { if (seen.has(j.url)) return false; seen.add(j.url); return true })
    .sort((a, b) => b.score - a.score)
}
