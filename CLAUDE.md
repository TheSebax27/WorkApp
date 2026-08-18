# Job Hunter — Contexto completo del proyecto

## ¿Qué es esto?

Aplicación web personal para buscar ofertas de trabajo en empresas extranjeras (España, EEUU, Canadá, Australia) y gestionar las aplicaciones. Construida por Sebastián para su propia búsqueda laboral como desarrollador.

## Stack tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Frontend | React 19 + Vite 8 + TypeScript 6 | `src/` |
| Estilos | Tailwind CSS v4 (@tailwindcss/vite) | sin config file, solo `@import "tailwindcss"` en index.css |
| Routing | React Router v6 | rutas en `src/App.tsx` |
| Backend/DB | Supabase (Postgres + Auth + Storage + Edge Functions) | |
| Iconos | lucide-react | |
| Fechas | date-fns | |
| Compilador React | babel-plugin-react-compiler (ya venía configurado) | |

## Variables de entorno

Archivo `.env` (local, nunca en git):
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_ADZUNA_APP_ID=tu-app-id   (opcional, free en adzuna.com/api)
VITE_ADZUNA_APP_KEY=tu-app-key (opcional)
```

Ejemplo en `.env.example` (este sí va al repo).

## Estructura de archivos

```
WorkApp/
├── CLAUDE.md                  ← este archivo
├── .env.example
├── .gitignore
├── vite.config.ts             ← tailwindcss() + react() + babel(reactCompilerPreset)
├── index.html
├── supabase/
│   └── migrations/
│       └── 001_init.sql       ← esquema base de datos (ejecutar en Supabase SQL Editor)
└── src/
    ├── index.css              ← solo @import "tailwindcss"
    ├── App.css                ← vacío (no se usa)
    ├── main.tsx               ← entry point
    ├── App.tsx                ← rutas principales con BrowserRouter
    ├── lib/
    │   └── supabase.ts        ← cliente Supabase singleton
    ├── types/
    │   └── index.ts           ← interfaces TypeScript globales
    ├── hooks/
    │   ├── useAuth.ts         ← sesión de usuario con Supabase Auth
    │   ├── useJobs.ts         ← fetch + filtros de ofertas (estado local)
    │   └── useApplications.ts ← CRUD de aplicaciones contra Supabase
    ├── services/
    │   └── jobApi.ts          ← llama APIs externas (Remotive, Adzuna, Arbeitnow)
    ├── components/
    │   ├── Layout.tsx         ← sidebar + header con NavLink activo
    │   ├── JobCard.tsx        ← tarjeta de oferta con score badge
    │   ├── FilterBar.tsx      ← filtros (fuente, remoto, país, stack, score mín.)
    │   ├── StatCard.tsx       ← card de estadística con icono
    │   └── LoadingSpinner.tsx
    └── pages/
        ├── Login.tsx          ← email/password + registro con Supabase
        ├── Dashboard.tsx      ← resumen + pipeline visual de aplicaciones
        ├── Jobs.tsx           ← lista de ofertas con filtros y modal de aplicación
        ├── Applications.tsx   ← historial con cambio de estado
        └── Profile.tsx        ← perfil + stack + países + nivel inglés
```

## Base de datos (Supabase Postgres)

### Tabla `profiles`
One-to-one con auth.users. Se crea automáticamente al registrarse (trigger).
```sql
id uuid PK (= auth.users.id)
nombre text
stack text[]           -- ej: ['React','TypeScript','Node']
nivel_ingles text      -- 'B1','B2','C1','C2'
paises_objetivo text[] -- ['España','EEUU','Canada','Australia']
cv_base_url text       -- URL en Supabase Storage (futuro)
anios_experiencia int
updated_at timestamptz
```

### Tabla `jobs`
Ofertas scrapeadas de APIs externas (se puede poblar desde Edge Function cron).
```sql
id uuid PK
fuente text            -- 'remotive' | 'adzuna' | 'arbeitnow'
titulo text
empresa text
pais text
url text UNIQUE        -- para no duplicar
descripcion text
tags text[]
remoto boolean
salario_min int
salario_max int
moneda text
score int              -- 0-100, calculado por match con perfil
fecha_publicacion date
fecha_scrape timestamptz
```

### Tabla `applications`
Registro de cada aplicación del usuario.
```sql
id uuid PK
user_id uuid FK → auth.users
job_id text            -- ID local de la oferta (ej: "remotive-12345")
estado text            -- 'preparando'|'enviada'|'en_proceso'|'rechazada'|'oferta'
fecha_aplicacion date
cv_usado_url text
notas text
created_at timestamptz
```

Migración completa en `supabase/migrations/001_init.sql`.

## Fuentes de datos (APIs externas — sin costo)

### Remotive — gratis, sin key
```
GET https://remotive.com/api/remote-jobs?category=software-dev&limit=50
```

### Arbeitnow — gratis, sin key
```
GET https://arbeitnow.com/api/job-board-api
```

### Adzuna — key gratuita en adzuna.com/api
```
GET https://api.adzuna.com/v1/api/jobs/{país}/search/1?app_id=ID&app_key=KEY&what=developer+remote
```
Países: `us`, `gb`, `au`, `ca`, `es`

## Cálculo de score (match)

En `src/services/jobApi.ts → calcScore()`:
- Compara `job.tags[]` con `userStack[]` del perfil
- Intersección simple: cuántas tecnologías del usuario aparecen en las tags de la oferta
- Resultado: 0–100%

## Flujo de la app

1. **Login** (`/login`) — Supabase Auth email/password, o registro
2. **Dashboard** (`/`) — stats globales + pipeline visual por estado
3. **Jobs** (`/jobs`) — busca ofertas en tiempo real + filtros + modal para registrar aplicación
4. **Applications** (`/applications`) — gestionar estado de cada aplicación
5. **Profile** (`/profile`) — definir stack (afecta el score), países objetivo, nivel inglés

## Comandos

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run lint      # oxlint
```

## Deploy

- **Frontend**: Vercel (conectar el repo, agregar variables de entorno en Settings > Environment Variables)
- **Backend**: Supabase cloud (gratis hasta 500MB y 50k requests/mes)
- **Dominio**: Vercel asigna uno gratis tipo `workapp-xyz.vercel.app`

## Estado del proyecto

- [x] Setup completo (Vite + React 19 + TS + Tailwind v4 + Supabase + Router)
- [x] Tipos TypeScript
- [x] Cliente Supabase singleton
- [x] Servicio de APIs externas (Remotive, Adzuna, Arbeitnow)
- [x] Hooks: useAuth, useJobs, useApplications
- [x] Componentes: Layout, JobCard, FilterBar, StatCard, LoadingSpinner
- [x] Páginas: Login, Dashboard, Jobs, Applications, Profile
- [x] SQL de migración (supabase/migrations/001_init.sql)
- [ ] Conectar Supabase real (pendiente: crear proyecto en supabase.com y poner credenciales en .env)
- [ ] Edge Function cron para scraping automático diario
- [ ] Subida de CV a Supabase Storage
- [ ] Deploy en Vercel
