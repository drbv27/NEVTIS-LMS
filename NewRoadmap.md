Roadmap: Pivote a Modelo de Comunidades y Membresías
Este es el plan de acción para refactorizar la plataforma hacia un modelo basado en comunidades. Cada fase representa un hito importante y testeable.

FASE 1: Cimientos del Backend (La Migración de Datos)
Objetivo: Modificar la estructura de la base de datos para soportar el concepto de "comunidades". Esta es la fase más crítica y debe hacerse primero.

1.1: Crear la Tabla communities:

Crear la nueva tabla communities con columnas para id, name, slug, description, image_url y stripe_price_id.

1.2: Crear la Tabla community_memberships:

Crear la tabla que vinculará a los usuarios con las comunidades, registrando el estado de su membresía (user_id, community_id, stripe_subscription_id, status, etc.).

1.3: Modificar Tablas Existentes:

Ejecutar un script ALTER TABLE en courses para añadir la columna community_id.

Ejecutar un script ALTER TABLE en posts para añadir la columna community_id.

1.4: Migrar Datos Existentes (Paso Manual Guiado):

Crear una "Comunidad por Defecto" en la nueva tabla communities.

Ejecutar un script UPDATE para asignar todos los cursos y posts existentes a esta comunidad por defecto. Esto es crucial para que la aplicación no se rompa.

1.5: Limpieza:

Eliminar la antigua tabla enrollments, que ya no será necesaria.

FASE 2: Adaptación del Panel de Administración
Objetivo: Darle a los administradores las herramientas para gestionar la nueva estructura de comunidades.

2.1: CRUD de Comunidades:

Crear una nueva sección en el panel de admin (/admin/communities) con una tabla para listar, crear, editar y eliminar comunidades.

2.2: Adaptar Formulario de Cursos:

Modificar el componente CourseForm.tsx para incluir un menú desplegable que permita asignar cada curso a una de las comunidades existentes.

FASE 3: Refactorización de la Experiencia de Usuario
Objetivo: Implementar la lógica para que los usuarios puedan seleccionar una comunidad y ver solo el contenido relevante.

3.1: Actualizar el Estado Global (Zustand):

Añadir al authStore una variable activeCommunityId y una lista de las memberships del usuario.

3.2: Crear el Selector de Comunidad:

Desarrollar un nuevo componente de menú desplegable en la Sidebar que muestre las comunidades del usuario y permita cambiar la activeCommunityId en el store.

3.3: Refactorizar los Hooks de Datos:

Modificar los hooks useFeed, useCourses, y useMyCourses para que acepten el activeCommunityId y filtren sus resultados basándose en él.

3.4: Actualizar Políticas de Seguridad (RLS):

Reescribir las políticas RLS clave. Por ejemplo, la regla para ver un curso ahora será: ...WHERE EXISTS (SELECT 1 FROM community_memberships WHERE community_id = courses.community_id AND user_id = auth.uid() AND status = 'active').

FASE 4: Refactorización de la Monetización (Stripe)
Objetivo: Cambiar el modelo de pago de compras únicas a suscripciones recurrentes.

4.1: Configuración de Productos en Stripe:

Documentar el proceso para crear un Producto en Stripe con un Precio recurrente (mensual) para cada comunidad.

4.2: Actualizar Edge Function de Checkout:

Modificar la función create-stripe-checkout para que cree sesiones de tipo subscription en lugar de payment.

4.3: Actualizar Webhook de Stripe:

Modificar la función stripe-webhook para que escuche eventos de suscripción (customer.subscription.created, customer.subscription.deleted, etc.) y actualice la tabla community_memberships en consecuencia.
