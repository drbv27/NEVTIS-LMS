# Nevtis LMS - Plataforma de Gestión de Aprendizaje

Bienvenido a la documentación de Nevtis LMS, una plataforma de gestión de aprendizaje moderna construida con un enfoque de arquitectura centrado en el cliente para una experiencia de usuario fluida y reactiva.

## 📝 Descripción General y Arquitectura

Este proyecto es un Sistema de Gestión de Aprendizaje (LMS) completo que permite a los administradores crear y gestionar cursos, y a los estudiantes inscribirse y consumir contenido de manera interactiva.

La arquitectura se basa en **Next.js 14 con el App Router**, pero con una filosofía de **Single Page Application (SPA)**. La lógica de negocio, las interacciones y la gestión de estado ocurren principalmente en el lado del cliente, mientras que se utiliza **Supabase** como un potente Backend como Servicio (BaaS) para la persistencia de datos, autenticación y almacenamiento de archivos.

---

## 🚀 Tecnologías Principales

- **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
- **Backend y Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Gestión de Estado del Servidor:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Gestión de Estado Global del Cliente:** [Zustand](https://zustand-demo.pmnd.rs/)
- **UI y Componentes:** [Shadcn UI](https://ui.shadcn.com/) sobre [Radix UI](https://www.radix-ui.com/) y [Tailwind CSS](https://tailwindcss.com/)
- **Formularios y Notificaciones:** [React Hook Form](https://react-hook-form.com/) (implícito en los componentes) y [Sonner](https://sonner.emilkowal.ski/)
- **Editor de Texto:** [Tiptap](https://tiptap.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Configuración del Entorno de Desarrollo

Sigue estos pasos para levantar el proyecto en un entorno local.

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

### 2. Instalar Dependencias

Asegúrate de tener [Node.js](https://nodejs.org/) (v18 o superior) instalado. Luego, instala las dependencias del proyecto.

```bash
npm install
```

### 3. Configurar Supabase

Este proyecto requiere una instancia de Supabase.

- Ve a [supabase.com](https://supabase.com/) y crea un nuevo proyecto.
- Dentro de tu proyecto, necesitarás la **URL del Proyecto** y la **Clave Anónima Pública (`anon key`)**. Las encontrarás en **Project Settings > API**.
- Ejecuta los scripts SQL para crear las tablas y las políticas de seguridad (RLS) que se encuentran en este repositorio o en la documentación del proyecto.

### 4. Configurar Variables de Entorno

Crea un archivo llamado `.env.local` en la raíz del proyecto. Copia el contenido de `.env.example` (si existe) o usa la siguiente plantilla.

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=TU_URL_DEL_PROYECTO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLICA_SUPABASE
```

Reemplaza los valores con las credenciales que obtuviste en el paso anterior.

### 5. Iniciar el Servidor de Desarrollo

Una vez configurado, puedes iniciar la aplicación.

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Configuración Clave de Supabase

El correcto funcionamiento de la aplicación depende críticamente de la configuración de Supabase.

- **Autenticación:** Asegúrate de habilitar los proveedores de autenticación necesarios (Email, Google) en el Dashboard de Supabase. Configura correctamente la `Site URL` y las `Redirect URLs` en **Authentication > URL Configuration**.
- **Seguridad (RLS):** La seguridad de los datos se delega casi por completo a las **Políticas de Seguridad a Nivel de Fila (Row Level Security)**. Es **mandatorio** que RLS esté habilitado en todas las tablas y que las políticas estén correctamente aplicadas. Sin ellas, los datos quedarían expuestos.
- **Storage:** El proyecto utiliza buckets para almacenar archivos. Los buckets de contenido de lecciones (`lesson-pdfs`, `lesson-videos`) deben ser **privados**, y su acceso está protegido por políticas de Storage que validan la inscripción del usuario.
