import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }
  return pages.join('\n')
}

const KNOWN_STACK = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Node', 'Python', 'Java',
  'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'AWS',
  'Azure', 'Git', 'GitHub', 'Next.js', 'Vue', 'Angular', 'Express', 'FastAPI',
  'Django', 'Spring', 'Kotlin', 'Swift', 'Flutter', 'React Native', 'GraphQL',
  'REST', 'Tailwind', 'CSS', 'HTML', 'Linux', 'Kubernetes', 'Redis', 'Supabase',
]

const ENGLISH_LEVELS = ['A1','A2','B1','B2','C1','C2']

export interface ParsedProfile {
  nombre: string | null
  stack: string[]
  anios_experiencia: number | null
  nivel_ingles: string | null
}

export function parseProfileFromText(text: string): ParsedProfile {
  const lower = text.toLowerCase()

  // Stack: buscar tecnologías conocidas en el texto
  const stack = KNOWN_STACK.filter(tech =>
    lower.includes(tech.toLowerCase())
  )

  // Años de experiencia
  const expPatterns = [
    /(\d+)\+?\s*(?:años?|years?)\s*(?:de\s*)?(?:experiencia|experience)/i,
    /(?:experiencia|experience)\s*(?:de\s*)?(\d+)\+?\s*(?:años?|years?)/i,
    /(\d+)\+?\s*(?:años?|years?)\s*(?:en\s*)?(?:el\s*)?(?:sector|industry|campo|field)/i,
  ]
  let anios: number | null = null
  for (const pattern of expPatterns) {
    const m = text.match(pattern)
    if (m) { anios = parseInt(m[1]); break }
  }

  // Nivel de inglés
  let nivel_ingles: string | null = null
  for (const level of ENGLISH_LEVELS) {
    if (lower.includes(`inglés ${level.toLowerCase()}`) ||
        lower.includes(`english ${level.toLowerCase()}`) ||
        lower.includes(`nivel ${level.toLowerCase()}`) ||
        lower.includes(` ${level.toLowerCase()} `) ||
        new RegExp(`\\b${level}\\b`, 'i').test(text)) {
      nivel_ingles = level
      break
    }
  }

  // Nombre: primera línea no vacía que parezca un nombre propio
  const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean)
  let nombre: string | null = null
  for (const line of lines.slice(0, 5)) {
    // Línea corta (2-5 palabras), con mayúsculas, sin números ni símbolos extraños
    if (/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüña-z]+(\s[A-ZÁÉÍÓÚÜÑ][a-záéíóúüña-z]+){1,4}$/.test(line)) {
      nombre = line
      break
    }
  }

  return { nombre, stack, anios_experiencia: anios, nivel_ingles }
}
