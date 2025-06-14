"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type Course } from "@/lib/types";
import { Lesson } from "@/lib/types";

// Interfaz para CREAR un curso
interface CreateCoursePayload {
  title: string;
  description: string;
  categoryId: number;
  imageFile: File;
}

// Interfaz para ACTUALIZAR un curso (el ID es obligatorio, lo demás opcional)
interface UpdateCoursePayload {
  courseId: string;
  title?: string;
  description?: string;
  categoryId?: number;
  imageFile?: File | null; // La imagen puede o no cambiarse
}

interface CreateModulePayload {
  title: string;
  courseId: string;
}

interface CreateLessonPayload {
  title: string;
  description: string;
  moduleId: string;
  courseId: string; // La necesitamos para invalidar la caché correcta
  lessonType: Lesson["lesson_type"];
  contentUrl?: string;
  contentText?: string;
}

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();

  // --- MUTACIÓN PARA CREAR CURSO (sin cambios) ---
  const { mutate: createCourse, isPending: isCreatingCourse } = useMutation({
    mutationFn: async (payload: CreateCoursePayload) => {
      if (!user) throw new Error("No autenticado.");

      const supabase = createSupabaseBrowserClient();

      // --- INICIO DE LA LÓGICA MEJORADA ---

      // PASO 1: Insertar los datos del curso SIN la URL de la imagen para obtener su nuevo ID.
      const { data: newCourse, error: insertError } = await supabase
        .from("courses")
        .insert({
          title: payload.title,
          description: payload.description,
          category_id: payload.categoryId,
          teacher_id: user.id,
          status: "draft",
        })
        .select("id")
        .single();

      if (insertError)
        throw new Error(
          `Error al crear el curso en la base de datos: ${insertError.message}`
        );
      if (!newCourse)
        throw new Error("No se pudo obtener el ID del nuevo curso.");

      // PASO 2: Subir la imagen a una carpeta organizada usando el ID del curso.
      const fileExt = payload.imageFile.name.split(".").pop();
      // Creamos una ruta limpia y predecible: ej. '10/cover.png'
      const filePath = `${newCourse.id}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, payload.imageFile, {
          upsert: true, // Importante: sobrescribe la imagen si ya existe una con el mismo nombre.
        });

      if (uploadError)
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);

      // PASO 3: Obtener la URL pública de la imagen y ACTUALIZAR el registro del curso.
      const {
        data: { publicUrl },
      } = supabase.storage.from("course-images").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("courses")
        .update({ image_url: publicUrl })
        .eq("id", newCourse.id);

      if (updateError)
        throw new Error(
          `Error al actualizar la URL de la imagen: ${updateError.message}`
        );

      // --- FIN DE LA LÓGICA MEJORADA ---
    },
    onSuccess: () => {
      toast.success("¡Curso creado con éxito como borrador!");
      // Invalidamos la query de cursos de admin para que la tabla se actualice con el nuevo curso.
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      // Redirigimos al usuario de vuelta a la tabla.
      router.push("/admin/courses");
    },
    onError: (error) => {
      // En caso de error, el toast ahora mostrará un mensaje mucho más específico.
      toast.error(error.message);
    },
  });

  // --- NUEVA MUTACIÓN PARA ACTUALIZAR CURSO ---
  const { mutate: updateCourse, isPending: isUpdatingCourse } = useMutation({
    mutationFn: async (payload: UpdateCoursePayload) => {
      const supabase = createSupabaseBrowserClient();
      let imageUrl = undefined; // Por defecto, no actualizamos la imagen

      // Si se proporciona un nuevo archivo de imagen, lo subimos
      if (payload.imageFile) {
        const fileExt = payload.imageFile.name.split(".").pop();
        const filePath = `${payload.courseId}/cover.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("course-images")
          .upload(filePath, payload.imageFile, { upsert: true });
        if (uploadError)
          throw new Error(
            `Error al subir la nueva imagen: ${uploadError.message}`
          );

        // Obtenemos la nueva URL pública
        imageUrl = supabase.storage.from("course-images").getPublicUrl(filePath)
          .data.publicUrl;
      }

      // Creamos el objeto de actualización solo con los campos que tienen valor
      const courseUpdateData: { [key: string]: any } = {};
      if (payload.title) courseUpdateData.title = payload.title;
      if (payload.description)
        courseUpdateData.description = payload.description;
      if (payload.categoryId) courseUpdateData.category_id = payload.categoryId;
      if (imageUrl) courseUpdateData.image_url = imageUrl;
      courseUpdateData.updated_at = new Date().toISOString();

      // Actualizamos el curso en la base de datos
      const { error: updateError } = await supabase
        .from("courses")
        .update(courseUpdateData)
        .eq("id", payload.courseId);

      if (updateError)
        throw new Error(`Error al actualizar el curso: ${updateError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("¡Curso actualizado con éxito!");
      // Invalidamos la query de la tabla Y la del curso individual
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
      router.push("/admin/courses");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteCourse, isPending: isDeletingCourse } = useMutation({
    mutationFn: async (courseToDelete: Course) => {
      const supabase = createSupabaseBrowserClient();

      // 1. Borrar la imagen del Storage primero
      if (courseToDelete.image_url) {
        // Extraemos la ruta del archivo de la URL completa
        const filePath = new URL(courseToDelete.image_url).pathname.split(
          "/course-images/"
        )[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("course-images")
            .remove([filePath]);

          if (storageError) {
            // Decidimos si queremos detener el proceso o solo registrar el error
            console.error("Error eliminando imagen del storage:", storageError);
            toast.warning(
              "El curso se eliminó, pero hubo un error al borrar la imagen."
            );
          }
        }
      }

      // 2. Borrar el curso de la base de datos
      const { error: dbError } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);

      if (dbError)
        throw new Error(`Error al eliminar el curso: ${dbError.message}`);
    },
    onSuccess: () => {
      toast.success("Curso eliminado con éxito");
      // Invalidamos la query para que la tabla se actualice automáticamente
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- NUEVA MUTACIÓN PARA CREAR MÓDULO ---
  const { mutate: createModule, isPending: isCreatingModule } = useMutation({
    mutationFn: async (payload: CreateModulePayload) => {
      const supabase = createSupabaseBrowserClient();

      // 1. Obtenemos el orden del último módulo para poner el nuevo al final
      const { count, error: countError } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true })
        .eq("course_id", payload.courseId);

      if (countError) throw new Error("Error al calcular el orden del módulo.");

      const newModuleOrder = (count || 0) + 1;

      // 2. Insertamos el nuevo módulo
      const { error: insertError } = await supabase.from("modules").insert({
        title: payload.title,
        course_id: payload.courseId,
        module_order: newModuleOrder,
      });

      if (insertError)
        throw new Error(`Error al crear el módulo: ${insertError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Módulo creado con éxito");
      // Invalidamos la query del curso específico para que la lista de módulos se refresque
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- NUEVA MUTACIÓN PARA CREAR LECCIÓN ---
  const { mutate: createLesson, isPending: isCreatingLesson } = useMutation({
    mutationFn: async (payload: CreateLessonPayload) => {
      const supabase = createSupabaseBrowserClient();

      const { count, error: countError } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("module_id", payload.moduleId);

      if (countError)
        throw new Error("Error al calcular el orden de la lección.");
      const newLessonOrder = (count || 0) + 1;

      // --- INICIO DE LA CORRECCIÓN ---
      // La inserción ahora incluye los nuevos campos
      const { error: insertError } = await supabase.from("lessons").insert({
        title: payload.title,
        description: payload.description, // <-- Nuevo
        module_id: payload.moduleId,
        lesson_type: payload.lessonType,
        content_url: payload.contentUrl,
        content_text: payload.contentText, // <-- Nuevo
        lesson_order: newLessonOrder,
      });
      // --- FIN DE LA CORRECCIÓN ---

      if (insertError)
        throw new Error(`Error al crear la lección: ${insertError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Lección añadida con éxito");
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createCourse,
    isCreatingCourse,
    updateCourse,
    isUpdatingCourse,
    deleteCourse,
    isDeletingCourse,
    createModule,
    isCreatingModule,
    createLesson,
    isCreatingLesson,
  };
}
