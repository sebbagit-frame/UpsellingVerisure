# PortalOperadores — Guía del proyecto

Sitio web interno, informativo, para operadores de una empresa de alarmas (clientes ya activos, no leads). No es una herramienta de ventas ni de gestión: es un panel de consulta con matrículas e internos de operadores y sectores, catálogo de dispositivos y repositorio de instructivos en PDF. Acceso mediante una única contraseña compartida por sector, sin usuarios individuales.

---

## Instrucciones para Claude

- Todo el código, comentarios y nombres van en **español**
- No implementar autenticación de usuarios individuales bajo ninguna circunstancia — la única puerta de entrada es la contraseña compartida validada en el middleware
- Mantener todo el stack dentro de planes gratuitos (Vercel, Supabase free tier); no incorporar servicios pagos
- Nombres de variables, funciones y componentes siempre profesionales y descriptivos — nada de placeholders (`foo`, `test`, `ejemplo`, `miVariable`)
- Al implementar algo nuevo, actualizar la tabla de Estado actual
- No commitear credenciales ni secretos: van en variables de entorno (ver sección Configuración)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + Backend | Next.js 14 (App Router), TypeScript, TailwindCSS 3 |
| Persistencia | PostgreSQL (Supabase) |
| Almacenamiento de archivos | Supabase Storage (imágenes de dispositivos, PDFs de instructivos) |
| Autenticación | Contraseña única compartida + cookie de sesión firmada (HMAC-SHA256, Web Crypto API) — sin librerías de auth externas |
| Hosting | Vercel |

---

## Arquitectura

```
app/
├── layout.tsx              → layout base + Navbar
├── page.tsx                → Inicio (matrículas, internos, sectores)
├── login/page.tsx          → formulario de contraseña única
├── dispositivos/page.tsx   → catálogo de dispositivos
├── instructivos/page.tsx   → listado de PDFs
└── api/
    ├── login/route.ts      → valida contraseña, setea cookie de sesión
    └── logout/route.ts     → borra la cookie
components/
├── Navbar.tsx
├── LogoutButton.tsx
├── TablaOperadores.tsx
├── CardDispositivo.tsx
└── ListaInstructivos.tsx
lib/
├── session.ts              → firma/verifica el token de sesión
└── supabase.ts              → cliente de conexión a Supabase
middleware.ts                → protege todas las rutas salvo /login y /api/login
```

---

## Comandos

```bash
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción
npm run start    # sirve el build de producción
```

---

## Configuración — variables de entorno

El proyecto exige estas variables (en Vercel o en `.env.local` local):

| Variable | Descripción |
|----------|-------------|
| `SITE_PASSWORD` | Contraseña única de acceso al sitio, compartida por todo el sector |
| `SESSION_SECRET` | Secreto para firmar el token de sesión (generar con `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (solo lectura pública) |

---

## Modelo de datos (Supabase)

**sectores** — id, nombre, descripcion, interno

**operadores** — id, nombre_completo, matricula, interno, sector_id (FK → sectores), activo (bool)

**dispositivos** — id, nombre, imagen_url, categoria, caracteristicas, descripcion

**instructivos** — id, titulo, pdf_url, dispositivo_id (FK → dispositivos, opcional), fecha_subida

Imágenes y PDFs se guardan en Supabase Storage; las tablas solo referencian la URL pública.

---

## Autenticación

- Cookie `httpOnly`, `secure` en producción, `sameSite lax`, con token firmado (HMAC-SHA256)
- Sesión expira a los 30 días
- `middleware.ts` valida la cookie en cada request; sin sesión válida, redirige a `/login`
- No hay roles ni usuarios: cualquiera con la contraseña del sector accede a todo el sitio por igual

---

## Convenciones de código

### General
- **Idioma:** todo el código (comentarios, variables, mensajes) en **español**
- **Commits:** Conventional Commits en español → `feat(scope): descripción`, `fix(scope): ...`, `chore(scope): ...`

### TypeScript / Next.js
- Comillas dobles o simples consistentes con Prettier default, 2 espacios
- Componentes de cliente (`"use client"`) solo donde hay interactividad (formularios, botones); el resto server components
- Nombres de componentes en PascalCase, archivos de página siempre `page.tsx`
- Sin frameworks ajenos a Next.js — mantenerlo simple, es un sitio de un solo sector, no multi-tenant

### CSS / Estilos
- TailwindCSS para layout y utilitarios; evitar CSS-in-JS innecesario

---

## Flujo de trabajo (Git)
 
- `main`: rama estable, será la de producción (deploy en Vercel) cuando el proyecto se conecte
- `desarrollo`: rama de trabajo activo — pruebas, features nuevas, cambios en curso
- Mergear a `main` solo cuando algo esté probado y funcionando
- Commits en Conventional Commits, en español (ver convenciones más abajo)

---

## Estado actual del proyecto

| Funcionalidad | Estado |
|--------------|--------|
| Scaffold Next.js + Tailwind + estructura base | ✅ Completo |
| Sistema de acceso con contraseña única (middleware, login, cookie de sesión) | ✅ Completo |
| Conexión a Supabase (`lib/supabase.ts`) | ⏳ Pendiente |
| Página Inicio (matrículas, internos, sectores) | ⏳ Pendiente |
| Página Dispositivos | ⏳ Pendiente |
| Página Instructivos | ⏳ Pendiente |
| Deploy a Vercel | ⏳ Pendiente |

---

## Seguridad — notas

- `SITE_PASSWORD` y `SESSION_SECRET` **no** van en el repo: solo en variables de entorno (Vercel o `.env.local`, incluido en `.gitignore`)
- La cookie de sesión es `httpOnly`, no accesible desde JavaScript del navegador
- Al no haber usuarios individuales, no hay trazabilidad de quién accede — si en el futuro se necesita auditoría, requiere rediseñar el sistema de acceso (fuera del alcance actual)
