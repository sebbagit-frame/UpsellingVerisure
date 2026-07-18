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
├── layout.tsx              → layout base + Navbar (lee la cookie de sesión y le pasa el rol)
├── page.tsx                → Inicio (matrículas, internos, sectores)
├── login/page.tsx          → formulario de contraseña única
├── dispositivos/page.tsx   → catálogo de dispositivos
├── instructivos/page.tsx   → listado de PDFs
├── admin/
│   ├── page.tsx            → dashboard de administración (solo rol admin)
│   ├── operadores/page.tsx → CRUD de operadores (tabla + formulario)
│   ├── sectores/page.tsx   → CRUD de sectores (tabla + formulario)
│   └── dispositivos/page.tsx → CRUD de dispositivos (con subida de imagen)
└── api/
    ├── login/route.ts      → valida contraseña, setea cookie de sesión
    ├── logout/route.ts     → borra la cookie
    └── admin/              → rutas de escritura (solo rol admin, protegidas por middleware)
        ├── operadores/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   └── [id]/route.ts   → PUT (editar) y DELETE (eliminar)
        ├── sectores/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   └── [id]/route.ts   → PUT (editar) y DELETE (eliminar)
        └── dispositivos/
            ├── route.ts        → GET (listar) y POST (crear)
            ├── [id]/route.ts   → PUT (editar) y DELETE (eliminar + borra la imagen del bucket)
            └── imagen/route.ts → POST: sube la imagen al bucket y devuelve la URL pública
components/
├── Navbar.tsx               → consciente del rol: muestra el link "Administración" solo a sesiones admin
├── LogoutButton.tsx
├── TablaOperadores.tsx
├── CatalogoDispositivos.tsx → selector de sistema + buscador + grilla (cliente)
├── CardDispositivo.tsx      → tarjeta expandible de un dispositivo
└── ListaInstructivos.tsx
lib/
├── session.ts              → firma/verifica el token de sesión
├── supabase.ts             → cliente de Supabase con anon key (lectura)
├── supabaseAdmin.ts        → cliente con service role key (escritura, ignora RLS) — SOLO importar desde rutas API del servidor
├── storageDispositivos.ts  → helpers del bucket de imágenes (borrar por URL pública)
├── tipos.ts                → tipos compartidos (Dispositivo, SistemaAlarma, Operador, Sector)
└── validaciones.ts         → validación de datos de entrada de las APIs
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
| `SITE_PASSWORD` | Contraseña compartida del sector (rol `sector`, solo lectura) |
| `ADMIN_PASSWORD` | Contraseña de administrador (rol `admin`, acceso a `/admin` con permisos de escritura) |
| `SESSION_SECRET` | Secreto para firmar el token de sesión (generar con `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (solo lectura pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role de Supabase (escritura, ignora RLS) — **sin** prefijo `NEXT_PUBLIC`, solo se usa en el servidor |

---

## Modelo de datos (Supabase)

**sectores** — id, sector (nombre del sector), interno (opcional)

**operadores** — id, nombre_operador, matricula, interno (opcional)

**dispositivos** — id, nombre_dispositivo, nomenclatura (código corto, ej. "YR", opcional), imagen_url (opcional), categoria, caracteristicas, descripcion, speech (guion para la conversación con el cliente, opcional), sistema (`'Verifast'` | `'Presense'`)

**instructivos** — id, titulo, pdf_url, dispositivo_id (FK → dispositivos, opcional), fecha_subida

Imágenes y PDFs se guardan en Supabase Storage; las tablas solo referencian la URL pública.

**Flujo de subida de imagen de dispositivos:** el formulario del panel admin envía el archivo a `POST /api/admin/dispositivos/imagen`, que lo sube al bucket público `dispositivos` con nombre único (`<timestamp>-<nombre-saneado>`) y devuelve la URL pública; esa URL viaja luego en el `imagen_url` del POST/PUT del dispositivo. Al eliminar un dispositivo (o reemplazar su imagen al editar) se borra también el archivo anterior del bucket.

---

## Autenticación

- Cookie `httpOnly`, `secure` en producción, `sameSite lax`, con token firmado (HMAC-SHA256)
- Sesión expira a los 30 días
- `middleware.ts` valida la cookie en cada request; sin sesión válida, redirige a `/login`
- **Dos niveles de acceso**, ambos por contraseña compartida (sin usuarios individuales):
  - Rol `sector` (`SITE_PASSWORD`): solo lectura, acceso a todo el sitio salvo `/admin`
  - Rol `admin` (`ADMIN_PASSWORD`): además accede a `/admin` con permisos de escritura
- Ambas contraseñas entran por el mismo campo del login; el rol se asigna según cuál coincida
- El token firmado incluye el rol; el middleware exige rol `admin` para las rutas `/admin/*` (una sesión de sector es redirigida a `/`)
- Las rutas `/api/admin/*` también exigen rol `admin`, pero responden `401` en JSON en vez de redirigir (son APIs, no páginas)

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
| Roles de acceso `sector` / `admin` y protección de `/admin` | ✅ Completo |
| Panel admin — dashboard y CRUD de Operadores | ✅ Completo |
| Panel admin — CRUD de Sectores | ✅ Completo |
| Panel admin — CRUD de Dispositivos (con subida de imagen a Storage) | ✅ Completo |
| Panel admin — Recursos | ⏳ Pendiente |
| Conexión a Supabase (`lib/supabase.ts`) | ✅ Completo |
| Página Inicio (matrículas, internos, sectores) | ⏳ Pendiente |
| Página Dispositivos (selector Verifast/Presense, buscador, tarjetas expandibles) | ✅ Completo |
| Página Instructivos | ⏳ Pendiente |
| Deploy a Vercel | ⏳ Pendiente |

---

## Seguridad — notas

- `SITE_PASSWORD`, `ADMIN_PASSWORD` y `SESSION_SECRET` **no** van en el repo: solo en variables de entorno (Vercel o `.env.local`, incluido en `.gitignore`)
- La cookie de sesión es `httpOnly`, no accesible desde JavaScript del navegador
- Al no haber usuarios individuales, no hay trazabilidad de quién accede — si en el futuro se necesita auditoría, requiere rediseñar el sistema de acceso (fuera del alcance actual)
