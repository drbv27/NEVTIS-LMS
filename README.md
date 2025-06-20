# Nevtis LMS - Documentación Técnica

Bienvenido a la documentación técnica de Nevtis LMS. Este documento proporciona una visión profunda de la arquitectura, los flujos de datos y las decisiones de diseño de la plataforma.

---

## 1. Filosofía y Arquitectura Principal

**Nevtis LMS** es una plataforma de gestión de aprendizaje moderna construida con una filosofía de **arquitectura del lado del cliente** (`Client-Side First`). Aunque utiliza **Next.js 14** con su App Router, el comportamiento de la aplicación replica el de una **Single Page Application (SPA)**, donde la lógica de negocio, la gestión del estado y las interacciones del usuario residen principalmente en el navegador.

Este enfoque se eligió para lograr una **experiencia de usuario fluida, rápida y reactiva**, eliminando recargas de página y minimizando la dependencia de la lógica del lado del servidor para las operaciones diarias.

### Componentes de la Arquitectura:

- **Frontend (Cliente):** Next.js 14, responsable de renderizar la UI y manejar toda la interacción del usuario.
- **Backend como Servicio (BaaS):** [Supabase](https://supabase.com/), que proporciona:
  - **Base de Datos:** PostgreSQL para la persistencia de datos.
  - **Autenticación:** Gestión de usuarios y proveedores de identidad (Email, Google).
  - **Storage:** Almacenamiento de archivos (imágenes de cursos, videos, PDFs).
  - **Serverless Functions:** Lógica de base de datos para automatizar tareas (triggers y funciones RPC).
- **Seguridad:** La seguridad de los datos se delega casi por completo a las **Políticas de Seguridad a Nivel de Fila (RLS)** de Supabase, que actúan como un cortafuegos a nivel de base de datos.

---

## 2. Stack Tecnológico

| Categoría                   | Tecnología                                                                      | Propósito                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Framework Frontend**      | [Next.js](https://nextjs.org/) 14 (App Router)                                  | Estructura de la aplicación, enrutamiento y renderizado del cliente.          |
| **Lenguaje**                | [TypeScript](https://www.typescriptlang.org/)                                   | Tipado estático para robustez y mantenibilidad del código.                    |
| **Backend & Base de Datos** | [Supabase](https://supabase.com/)                                               | Autenticación, base de datos PostgreSQL y almacenamiento de archivos.         |
| **Estado del Servidor**     | [TanStack Query (React Query)](https://tanstack.com/query/latest)               | Fetching, caching, y mutación de datos asíncronos. Es el pilar del data flow. |
| **Estado Global (UI)**      | [Zustand](https://zustand-demo.pmnd.rs/)                                        | Gestión de estado global simple para la UI (ej. visibilidad de sidebars).     |
| **UI y Componentes**        | [Shadcn UI](https://ui.shadcn.com/) sobre [Radix UI](https://www.radix-ui.com/) | Sistema de componentes accesibles y personalizables.                          |
| **Estilos**                 | [Tailwind CSS](https://tailwindcss.com/)                                        | Framework CSS "utility-first" para un diseño rápido y consistente.            |
| **Notificaciones**          | [Sonner](https://sonner.emilkowal.ski/)                                         | Notificaciones "toast" no intrusivas para la retroalimentación del usuario.   |
| **Editor de Texto**         | [Tiptap](https://tiptap.dev/)                                                   | Editor de texto enriquecido para la creación de contenido.                    |
| **Iconos**                  | [Lucide React](https://lucide.dev/)                                             | Librería de iconos ligera y personalizable.                                   |

---

## 3. Flujo de Datos y Gestión de Estado

La aplicación sigue un patrón claro para manejar los datos, separando el estado del servidor del estado de la UI.

### 3.1. Estado del Servidor con TanStack Query

Toda la comunicación con la base de datos de Supabase (lectura y escritura) se gestiona a través de **hooks personalizados** que encapsulan `useQuery` y `useMutation` de TanStack Query.

- **Fetching (`useQuery`):** Los hooks como `useCourses`, `useFeed`, `useLesson`, etc., son responsables de obtener datos de Supabase. TanStack Query gestiona automáticamente el caching, la revalidación en segundo plano y los estados de carga/error.
- **Mutaciones (`useMutation`):** Los hooks como `useCourseMutations` o `useProfile` exponen funciones (`createCourse`, `toggleLike`, etc.) que realizan cambios en la base de datos. Después de una mutación exitosa, se utiliza `queryClient.invalidateQueries` para invalidar la caché relevante, lo que provoca que los datos se vuelvan a solicitar y la UI se actualice automáticamente.

**Ejemplo de Flujo:**

1.  Un componente (`CourseCatalog.tsx`) llama al hook `useCourses()`.
2.  `useCourses` usa `useQuery` para ejecutar una función que obtiene los cursos de Supabase.
3.  TanStack Query maneja el estado (`isLoading`, `data`, `error`) y lo proporciona al componente.
4.  Un administrador elimina un curso, activando una mutación desde `useCourseMutations`.
5.  La mutación tiene éxito y llama a `queryClient.invalidateQueries({ queryKey: ['admin-courses'] })`.
6.  TanStack Query detecta que la query `admin-courses` está obsoleta, la vuelve a ejecutar y actualiza la tabla de cursos en la UI sin intervención manual.

### 3.2. Estado Global de la UI con Zustand

Para el estado que es puramente del cliente y no se persiste en el servidor (como el estado de la UI), se utiliza **Zustand**.

- `store/authStore.ts`: Es nuestro almacén central.
- **Responsabilidades:**
  - Almacena la sesión y el objeto de usuario (`user`, `session`, `isLoading`). Estos se sincronizan con Supabase Auth a través del `AuthProvider`.
  - Controla estados de la UI, como `isMainSidebarOpen` y `isLessonSidebarOpen`.

Este enfoque evita el "prop drilling" y mantiene los componentes de UI desacoplados de la lógica de estado.

---

## 4. Autenticación y Seguridad

La autenticación es un pilar fundamental, manejado con una combinación de lógica de cliente y un soporte mínimo pero crucial del servidor.

### Flujo de Autenticación:

1.  **Iniciación (Cliente):** El usuario interactúa con `SignInForm` o `GoogleSignInButton`. El SDK de Supabase (`@supabase/supabase-js`) inicia el flujo de autenticación.
2.  **Callback de OAuth (Servidor):** Para proveedores como Google, Supabase redirige a un _Route Handler_ en `app/auth/callback/route.ts`. Este endpoint del servidor intercambia de forma segura un código de autorización por una sesión, estableciendo la cookie de sesión.
3.  **Sincronización de Estado (Cliente):** El `AuthProvider`, montado en el layout raíz, escucha los cambios de estado de autenticación a través de `supabase.auth.onAuthStateChange`. Cuando detecta un evento (`SIGNED_IN`, `SIGNED_OUT`), actualiza el store de Zustand.
4.  **Protección de Rutas (Cliente):** Componentes como `ProtectedLayout` y `AdminProtectedLayout` usan el estado de Zustand para verificar si el usuario está autenticado (y si tiene el rol correcto) antes de renderizar su contenido, redirigiendo si es necesario.
5.  **Refresco de Sesión (Middleware):** El `middleware.ts` en la raíz del proyecto utiliza `@supabase/ssr` para refrescar el token de sesión en cada petición al servidor, asegurando que la sesión del usuario no expire mientras está activo.

### Modelo de Seguridad (RLS y Storage Policies):

La seguridad de los datos es la máxima prioridad.

- **RLS Habilitado:** Todas las tablas con datos sensibles tienen RLS habilitado. Las reglas son la **única fuente de verdad** para los permisos de datos.
- **Principio de Mínimo Privilegio:** Los usuarios solo pueden acceder y modificar los datos que les pertenecen o para los que tienen un rol explícito (`admin`, `teacher`).
- **Contenido Privado:** El material de las lecciones (videos, PDFs) se almacena en **buckets de Storage privados**. El acceso se concede a través de políticas que verifican si el usuario está inscrito en el curso correspondiente, generando URLs firmadas y de corta duración para el acceso.

---

## 5. Estructura del Proyecto (Directorios Clave)

- `/src/app`: Contiene la estructura de rutas de la aplicación utilizando el App Router.
  - `/(auth)`: Grupo de rutas para páginas de autenticación (login, signup).
  - `/(main)`: Grupo de rutas para la aplicación principal, protegidas por `ProtectedLayout`.
- `/src/components`: Contiene todos los componentes de React, organizados por funcionalidad.
  - `/ui`: Componentes base de Shadcn UI.
  - `/auth`, `/feed`, `/lessons`, etc.: Componentes específicos de cada módulo.
- `/src/hooks`: Todos los hooks personalizados de TanStack Query para la obtención y mutación de datos.
- `/src/lib`: Lógica de soporte.
  - `/supabase/client.ts`: Función para crear la instancia del cliente de Supabase.
  - `/types.ts`: Definiciones de todas las interfaces de TypeScript.
- `/src/store`: Contiene los stores de Zustand.

---

## 6. Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en un entorno local.

1.  **Clonar el Repositorio:** `git clone <URL_DEL_REPOSITORIO>`
2.  **Instalar Dependencias:** `npm install`
3.  **Configurar Variables de Entorno:** Crea un archivo `.env.local` y añade tus credenciales de Supabase.
    ```
    NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    ```
4.  **Configurar Base de Datos:** Ejecuta el script completo del archivo `SUPABASE_SETUP.md` en el editor SQL de tu proyecto Supabase para crear las tablas, vistas, funciones y políticas de seguridad.
5.  **Iniciar el Servidor:** `npm run dev`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).
