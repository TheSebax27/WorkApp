export interface Profile {
  id: string
  nombre: string
  stack: string[]
  nivel_ingles: string
  paises_objetivo: string[]
  cv_base_url: string | null
  anios_experiencia: number
  updated_at: string
}

export interface Job {
  id: string
  fuente: 'remotive' | 'adzuna' | 'arbeitnow'
  titulo: string
  empresa: string
  pais: string
  url: string
  descripcion: string
  tags: string[]
  remoto: boolean
  salario_min: number | null
  salario_max: number | null
  moneda: string | null
  score: number
  fecha_publicacion: string
  fecha_scrape: string
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  job?: Job
  estado: ApplicationStatus
  fecha_aplicacion: string
  cv_usado_url: string | null
  notas: string | null
  created_at: string
}

export type ApplicationStatus =
  | 'preparando'
  | 'enviada'
  | 'en_proceso'
  | 'rechazada'
  | 'oferta'

export interface JobFilters {
  remoto: boolean | null
  pais: string
  stack: string
  fuente: string
  minScore: number
}

export interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  candidate_required_location: string
  tags: string[]
  job_type: string
  publication_date: string
  description: string
  salary: string | null
}

export interface AdzunaJob {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  redirect_url: string
  description: string
  category: { label: string }
  created: string
  salary_min?: number
  salary_max?: number
}
