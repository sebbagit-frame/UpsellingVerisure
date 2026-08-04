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
├── layout.tsx              → layout base + Navbar (lee la cookie de sesión y le pasa el rol; el Navbar solo se renderiza si hay sesión activa)
├── page.tsx                → Inicio (logo, bienvenida, avisos, sectores, accesos rápidos)
├── login/page.tsx          → formulario de contraseña única, con fondo a pantalla completa
├── nosotros/page.tsx       → grilla de tarjetas del equipo de operadores (foto, nombre, matrícula, interno)
├── dispositivos/page.tsx   → catálogo de dispositivos
├── instructivos/page.tsx   → selector de categoría + listado de recursos (buscador y filtro por tipo)
├── admin/
│   ├── page.tsx            → dashboard de administración (solo rol admin)
│   ├── operadores/page.tsx → CRUD de operadores (tabla + formulario, con subida de foto)
│   ├── sectores/page.tsx   → CRUD de sectores (tabla + formulario)
│   ├── dispositivos/page.tsx → CRUD de dispositivos (con subida de imagen)
│   ├── avisos/page.tsx     → CRUD de avisos de Inicio
│   ├── accesos-rapidos/page.tsx → CRUD de accesos rápidos de Inicio
│   └── recursos/page.tsx   → CRUD de recursos (con subida de archivos)
└── api/
    ├── login/route.ts      → valida contraseña, setea cookie de sesión
    ├── logout/route.ts     → borra la cookie
    └── admin/              → rutas de escritura (solo rol admin, protegidas por middleware)
        ├── operadores/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   ├── [id]/route.ts   → PUT (editar) y DELETE (eliminar + borra la foto del bucket)
        │   └── foto/route.ts   → POST: asegura el bucket, sube la foto y devuelve la URL pública
        ├── sectores/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   └── [id]/route.ts   → PUT (editar) y DELETE (eliminar)
        ├── dispositivos/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   ├── [id]/route.ts   → PUT (editar) y DELETE (eliminar + borra la imagen del bucket)
        │   └── imagen/route.ts → POST: sube la imagen al bucket y devuelve la URL pública
        ├── avisos/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   └── [id]/route.ts   → PUT (editar) y DELETE (eliminar)
        ├── recursos/
        │   ├── route.ts        → GET (listar) y POST (crear)
        │   ├── [id]/route.ts   → PUT (editar) y DELETE (eliminar + borra el archivo del bucket)
        │   └── archivo/route.ts → POST: sube el archivo al bucket y devuelve la URL pública
        └── accesos-rapidos/
            ├── route.ts        → GET (listar) y POST (crear)
            └── [id]/route.ts   → PUT (editar) y DELETE (eliminar)
components/
├── Navbar.tsx               → consciente del rol: muestra el link "Administración" solo a sesiones admin
├── LogoutButton.tsx
├── CatalogoDispositivos.tsx → selector de sistema + buscador + grilla (cliente)
├── CardDispositivo.tsx      → tarjeta expandible de un dispositivo
└── ListaInstructivos.tsx
lib/
├── session.ts              → firma/verifica el token de sesión
├── supabase.ts             → cliente de Supabase con anon key (lectura)
├── supabaseAdmin.ts        → cliente con service role key (escritura, ignora RLS) — SOLO importar desde rutas API del servidor
├── storageDispositivos.ts  → helpers del bucket de imágenes de dispositivos (borrar por URL pública)
├── storageRecursos.ts      → helpers del bucket de archivos de recursos (borrar por URL pública)
├── storageOperadores.ts    → helpers del bucket de fotos de operadores (asegura el bucket si no existe, borrar por URL pública)
├── hooks/useRevelarAlEntrar.ts → IntersectionObserver reutilizable para la animación de entrada escalonada de listas/grillas
├── tipos.ts                → tipos compartidos (Dispositivo, SistemaAlarma, Operador, Sector, Aviso, AccesoRapido, Recurso)
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

**operadores** — id, nombre_operador, matricula, interno (opcional), foto_url (opcional), rol (`'Supervisor'` | `'Coordinador'` | `'Mentor'` | `'Operador'`). Se muestran en la página pública Nosotros agrupados por rol, en secciones apiladas en ese orden fijo (Supervisor → Coordinador → Mentores/as → Operadores); cada sección es una grilla de tarjetas (foto o placeholder con ícono de persona, nombre, matrícula, interno) y se oculta por completo si no tiene ningún integrante. Ya no aparecen en Inicio.

**Flujo de subida de foto de operadores:** el formulario del panel admin envía el archivo a `POST /api/admin/operadores/foto`, que primero se asegura de que exista el bucket público `operadores` (lo crea si falta, a diferencia de `dispositivos` y `recursos` que se crean a mano desde el dashboard), lo sube con nombre único (`<timestamp>-<nombre-saneado>`) y devuelve la URL pública; esa URL viaja luego en el `foto_url` del POST/PUT del operador. Al eliminar un operador (o reemplazar su foto al editar) se borra también la foto anterior del bucket.

**dispositivos** — id, nombre_dispositivo, nomenclatura (código corto, ej. "YR", opcional), imagen_url (opcional), categoria, caracteristicas, descripcion, speech (guion para la conversación con el cliente, opcional), sistema (`'Verifast'` | `'Presense'`)

**recursos** — id, titulo, tipo (`'pdf'` | `'excel'` | `'word'` | `'enlace'`, con check constraint en minúsculas), categoria (`'usos_basicos'` | `'upselling'`), archivo_url (opcional), enlace_externo (opcional), dispositivo_id (FK → dispositivos, opcional), fecha_subida. Cada recurso tiene **archivo_url o enlace_externo, nunca ambos**. Se muestran en la página Instructivos, que primero pide elegir categoría; los archivos van al bucket `recursos`.

**Flujo de subida de archivos de recursos:** el formulario del panel admin envía el archivo y el tipo a `POST /api/admin/recursos/archivo`, que valida la extensión según el tipo (pdf → `.pdf`; excel → `.xls/.xlsx/.csv`; word → `.doc/.docx`), limita a 20 MB, lo sube al bucket público `recursos` con nombre único y devuelve la URL pública. Al eliminar un recurso (o reemplazar su archivo al editar) se borra el archivo anterior del bucket.

**avisos** — id, titulo, mensaje. Se muestran como tarjetas destacadas al tope de Inicio; si la tabla está vacía (o no existe aún), la sección se oculta.

**accesos_rapidos** — id, titulo, url. Barra inferior de botones en Inicio que abren la URL en pestaña nueva; misma lógica de ocultamiento que avisos.

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
| Panel admin — dashboard y CRUD de Operadores (con subida de foto a Storage) | ✅ Completo |
| Panel admin — CRUD de Sectores | ✅ Completo |
| Panel admin — CRUD de Dispositivos (con subida de imagen a Storage) | ✅ Completo |
| Panel admin — CRUD de Avisos y Accesos rápidos | ✅ Completo (falta crear las tablas en Supabase) |
| Panel admin — CRUD de Recursos (con subida de archivos a Storage) | ✅ Completo |
| Conexión a Supabase (`lib/supabase.ts`) | ✅ Completo |
| Página Inicio (rediseño corporativo: logo, bienvenida roja/negra, avisos, sectores, accesos rápidos) | ✅ Completo (falta crear tablas `avisos` y `accesos_rapidos` en Supabase) |
| Página Nosotros (grilla de operadores con foto) | ✅ Completo |
| Página Dispositivos (selector Verifast/Presense, buscador, tarjetas expandibles) | ✅ Completo |
| Página Instructivos (buscador, filtro por tipo, archivos y enlaces) | ✅ Completo |
| Animación de entrada escalonada (Inicio, Dispositivos, Instructivos, Nosotros) | ✅ Completo |
| Deploy a Vercel | ⏳ Pendiente |

---

## Seguridad — notas

- `SITE_PASSWORD`, `ADMIN_PASSWORD` y `SESSION_SECRET` **no** van en el repo: solo en variables de entorno (Vercel o `.env.local`, incluido en `.gitignore`)
- La cookie de sesión es `httpOnly`, no accesible desde JavaScript del navegador
- Al no haber usuarios individuales, no hay trazabilidad de quién accede — si en el futuro se necesita auditoría, requiere rediseñar el sistema de acceso (fuera del alcance actual)
