//src/hooks/useCourseMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lesson, Module, Course } from "@/lib/types";

// 1. ACTUALIZAMOS LOS PAYLOADS PARA INCLUIR 'communityId'
interface CreateCoursePayload {
  title: string;
  description: string;
  categoryId: number;
  imageFile: File;
  is_free: boolean;
  price?: number | null;
  stripe_price_id?: string | null;
  communityId: string; // <-- Nuevo y requerido
}
interface UpdateCoursePayload {
  courseId: string;
  title?: string;
  description?: string;
  categoryId?: number;
  imageFile?: File | null;
  is_free: boolean;
  price?: number | null;
  stripe_price_id?: string | null;
  communityId?: string; // <-- Nuevo y opcional
}

interface CreateModulePayload {
  title: string;
  courseId: string;
}
interface CreateLessonPayload {
  title: string;
  description: string | null;
  moduleId: string;
  courseId: string;
  lessonType: Lesson["lesson_type"];
  file?: File | null;
  contentText?: string | null;
  setup_code?: string | null;
  solution_code?: string | null;
  test_code?: string | null;
  live_session_room_name?: string | null;
}
interface UpdateLessonPayload {
  lessonId: string;
  courseId: string;
  title: string;
  description: string | null;
  file?: File | null;
  contentText?: string | null;
  setup_code?: string | null;
  solution_code?: string | null;
  test_code?: string | null;
  live_session_room_name?: string | null;
}
interface DeleteLessonPayload {
  lesson: Lesson;
  courseId: string;
}
interface UpdateCourseStatusPayload {
  courseId: string;
  newStatus: "published" | "draft";
}
interface UpdateModulePayload {
  moduleId: string;
  courseId: string; // Para invalidar la caché correcta
  title: string;
}
interface DeleteModulePayload {
  moduleToDelete: Module;
  courseId: string;
}

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();

  // Mutaciones de Course y Module (completas, sin cambios)
  const { mutate: createCourse, isPending: isCreatingCourse } = useMutation({
    mutationFn: async (payload: CreateCoursePayload) => {
      if (!user) throw new Error("No autenticado.");
      const supabase = createSupabaseBrowserClient();
      const { data: newCourse, error: insertError } = await supabase
        .from("courses")
        .insert({
          title: payload.title,
          description: payload.description,
          category_id: payload.categoryId,
          teacher_id: user.id,
          status: "draft",
          is_free: payload.is_free,
          price: payload.is_free ? null : payload.price,
          stripe_price_id: payload.is_free ? null : payload.stripe_price_id,
          community_id: payload.communityId,
        })
        .select("id")
        .single();
      if (insertError)
        throw new Error(
          `Error al crear el curso en la base de datos: ${insertError.message}`
        );
      if (!newCourse)
        throw new Error("No se pudo obtener el ID del nuevo curso.");
      const fileExt = payload.imageFile.name.split(".").pop();
      const filePath = `${newCourse.id}/cover.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, payload.imageFile, { upsert: true });
      if (uploadError)
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
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
    },
    onSuccess: () => {
      toast.success("¡Curso creado con éxito como borrador!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      router.push("/admin/courses");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateCourse, isPending: isUpdatingCourse } = useMutation({
    mutationFn: async (payload: UpdateCoursePayload) => {
      const supabase = createSupabaseBrowserClient();
      let imageUrl = undefined;
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
        imageUrl = supabase.storage.from("course-images").getPublicUrl(filePath)
          .data.publicUrl;
      }
      const courseUpdateData: Partial<Course> = {
        is_free: payload.is_free,
        price: payload.is_free ? null : payload.price,
        stripe_price_id: payload.is_free ? null : payload.stripe_price_id,
        updated_at: new Date().toISOString(),
      };
      if (payload.title) courseUpdateData.title = payload.title;
      if (payload.description)
        courseUpdateData.description = payload.description;
      if (payload.categoryId) courseUpdateData.category_id = payload.categoryId;
      if (payload.communityId)
        courseUpdateData.community_id = payload.communityId;
      if (imageUrl) courseUpdateData.image_url = imageUrl;
      courseUpdateData.updated_at = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("courses")
        .update(courseUpdateData)
        .eq("id", payload.courseId);
      if (updateError)
        throw new Error(`Error al actualizar el curso: ${updateError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("¡Curso actualizado con éxito!");
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

  // --- MUTACIÓN PARA ELIMINAR CURSO (VERSIÓN CON DEPURACIÓN) ---
  const { mutate: deleteCourse, isPending: isDeletingCourse } = useMutation({
    mutationFn: async (courseToDelete: Course) => {
      const supabase = createSupabaseBrowserClient();
      //console.log("--- INICIANDO DEPURACIÓN DE BORRADO DE CURSO ---");
      //console.log("1. Curso a eliminar:", courseToDelete);

      // PASO A: Encontrar todos los módulos que pertenecen al curso.
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseToDelete.id);

      if (modulesError)
        throw new Error(
          "Fallo en Depuración (Paso A): No se pudieron obtener los módulos."
        );
      //console.log("Paso A Exitoso. Módulos encontrados:", modules);

      if (modules && modules.length > 0) {
        const moduleIds = modules.map((m) => m.id);
        //console.log("IDs de los módulos a revisar:", moduleIds);

        // PASO B: Encontrar todas las lecciones de esos módulos para obtener sus URLs.
        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("content_url, lesson_type")
          .in("module_id", moduleIds);

        if (lessonsError)
          throw new Error(
            "Fallo en Depuración (Paso B): No se pudieron obtener las lecciones."
          );
        //console.log("Paso B Exitoso. Lecciones encontradas:", lessons);

        // PASO C: Recolectar las rutas de los archivos de las lecciones.
        if (lessons && lessons.length > 0) {
          const filesToDeleteByBucket: { [key: string]: string[] } = {
            "lesson-videos": [],
            "lesson-pdfs": [],
          };

          lessons.forEach((lesson) => {
            if (
              lesson.content_url &&
              lesson.content_url.includes("supabase.co")
            ) {
              try {
                const regex = /storage\/v1\/object\/public\/([^/]+)\/(.+)/;
                const matches = lesson.content_url.match(regex);
                if (matches && matches[1] && matches[2]) {
                  const bucket = matches[1];
                  const filePath = matches[2];
                  if (filesToDeleteByBucket[bucket]) {
                    filesToDeleteByBucket[bucket].push(filePath);
                  }
                }
              } catch (e) {
                console.warn("URL de lección no válida:", e);
              }
            }
          });

          /* console.log(
            "Paso C. Archivos de lecciones a eliminar (agrupados por bucket):",
            filesToDeleteByBucket
          ); */

          // Ejecutar el borrado en los buckets de lecciones
          for (const bucket in filesToDeleteByBucket) {
            if (filesToDeleteByBucket[bucket].length > 0) {
              console.log(`-> Ejecutando borrado en bucket: ${bucket}`);
              await supabase.storage
                .from(bucket)
                .remove(filesToDeleteByBucket[bucket]);
            }
          }
        } else {
          console.log(
            "Paso C. No se encontraron lecciones con archivos para borrar."
          );
        }
      }

      // PASO D: Borrar la imagen de portada del curso.
      if (
        courseToDelete.image_url &&
        courseToDelete.image_url.includes("supabase.co")
      ) {
        const regex = /storage\/v1\/object\/public\/(course-images)\/(.+)/;
        const matches = courseToDelete.image_url.match(regex);
        if (matches && matches[1] && matches[2]) {
          console.log(`Paso D. Borrando imagen de portada: ${matches[2]}`);
          await supabase.storage.from(matches[1]).remove([matches[2]]);
        }
      } else {
        console.log("Paso D. El curso no tiene imagen de portada para borrar.");
      }

      // PASO E: Finalmente, borrar el curso de la base de datos.
      //console.log("Paso E. Borrando el curso de la base de datos...");
      const { error: dbError } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);
      if (dbError)
        throw new Error(`Fallo en Depuración (Paso E): ${dbError.message}`);

      //console.log("--- FIN DEPURACIÓN ---");
    },
    onSuccess: () => {
      toast.success("Operación de borrado completada.");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createModule, isPending: isCreatingModule } = useMutation({
    mutationFn: async (payload: CreateModulePayload) => {
      const supabase = createSupabaseBrowserClient();
      const { count, error: countError } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true })
        .eq("course_id", payload.courseId);
      if (countError) throw new Error("Error al calcular el orden del módulo.");
      const newModuleOrder = (count || 0) + 1;
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
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- MUTACIÓN DE createLesson ACTUALIZADA ---
  const { mutate: createLesson, isPending: isCreatingLesson } = useMutation({
    mutationFn: async (payload: CreateLessonPayload) => {
      const supabase = createSupabaseBrowserClient();
      if (!user) throw new Error("No autenticado.");

      let fileUrl: string | null = null;

      if (payload.file) {
        const fileExt = payload.file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `c${payload.courseId}-m${payload.moduleId}-${fileName}`;
        const bucket =
          payload.lessonType === "video" ? "lesson-videos" : "lesson-pdfs";
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, payload.file);
        if (uploadError)
          throw new Error(`Error al subir el archivo: ${uploadError.message}`);
        fileUrl = supabase.storage.from(bucket).getPublicUrl(filePath)
          .data.publicUrl;
      }

      const { count } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("module_id", payload.moduleId);
      const newLessonOrder = (count || 0) + 1;

      const { error: insertError } = await supabase.from("lessons").insert({
        title: payload.title,
        description: payload.description,
        module_id: payload.moduleId,
        lesson_type: payload.lessonType,
        content_url: fileUrl,
        content_text: payload.contentText,
        lesson_order: newLessonOrder,
        // Guardamos los nuevos campos de código en la base de datos
        setup_code: payload.setup_code,
        solution_code: payload.solution_code,
        test_code: payload.test_code,
        live_session_room_name: payload.live_session_room_name,
      });

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

  // --- MUTACIÓN PARA ACTUALIZAR UNA LECCIÓN (REESCRITA) ---
  const { mutate: updateLesson, isPending: isUpdatingLesson } = useMutation<
    void,
    Error,
    UpdateLessonPayload
  >({
    mutationFn: async (payload: UpdateLessonPayload) => {
      const supabase = createSupabaseBrowserClient();
      const lessonUpdateData: Partial<Lesson> = {
        title: payload.title,
        description: payload.description,
        content_text: payload.contentText,
        setup_code: payload.setup_code,
        solution_code: payload.solution_code,
        test_code: payload.test_code,
        live_session_room_name: payload.live_session_room_name,
        updated_at: new Date().toISOString(),
      };

      if (payload.file) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("lesson_type, module_id")
          .eq("id", payload.lessonId)
          .single();
        if (!lessonData) throw new Error("Lección no encontrada.");

        const fileExt = payload.file.name.split(".").pop();
        const bucket =
          lessonData.lesson_type === "video" ? "lesson-videos" : "lesson-pdfs";
        const filePath = `c${payload.courseId}-m${lessonData.module_id}-l${payload.lessonId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, payload.file, { upsert: true });
        if (uploadError)
          throw new Error(`Error al subir archivo: ${uploadError.message}`);

        lessonUpdateData.content_url = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath).data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("lessons")
        .update(lessonUpdateData)
        .eq("id", payload.lessonId);
      if (updateError)
        throw new Error(`Error al actualizar lección: ${updateError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Lección actualizada con éxito");
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // --- MUTACIÓN PARA ELIMINAR LECCIÓN (REESCRITA Y CON DEPURACIÓN) ---
  const { mutate: deleteLesson, isPending: isDeletingLesson } = useMutation<
    void,
    Error,
    DeleteLessonPayload
  >({
    mutationFn: async (payload: { lesson: Lesson; courseId: string }) => {
      const supabase = createSupabaseBrowserClient();

      if (
        payload.lesson.content_url &&
        payload.lesson.content_url.includes("supabase.co")
      ) {
        // Expresión regular para capturar el nombre del bucket y la ruta del archivo
        const regex = /storage\/v1\/object\/public\/([^/]+)\/(.+)/;
        const matches = payload.lesson.content_url.match(regex);

        console.log("URL a procesar para borrado:", payload.lesson.content_url);
        console.log("Resultado del análisis con Regex:", matches);

        if (matches && matches[1] && matches[2]) {
          const bucket = matches[1];
          const filePath = matches[2];

          console.log(
            `DEPURACIÓN: Intentando borrar de bucket: '${bucket}', archivo: '${filePath}'`
          );

          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

          if (
            storageError &&
            storageError.message !== "The resource was not found"
          ) {
            // Si hay un error Y NO es porque el archivo ya no existía, lo lanzamos.
            throw new Error(
              `Error al borrar archivo de Storage: ${storageError.message}`
            );
          } else if (storageError) {
            console.warn(
              "El archivo no se encontró en Storage, puede que ya estuviera borrado. Continuando..."
            );
          }
        } else {
          console.warn(
            "No se pudo extraer la ruta del archivo de la URL. El archivo no se borrará del storage."
          );
        }
      }

      const { error: dbError } = await supabase
        .from("lessons")
        .delete()
        .eq("id", payload.lesson.id);
      if (dbError)
        throw new Error(
          `Error al eliminar la lección de la base de datos: ${dbError.message}`
        );
    },
    onSuccess: (_, variables) => {
      toast.success("Lección eliminada permanentemente");
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => toast.error(error.message),
  });
  // --- NUEVA MUTACIÓN PARA CAMBIAR ESTADO DEL CURSO ---
  const { mutate: updateCourseStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: async (payload: UpdateCourseStatusPayload) => {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase
          .from("courses")
          .update({
            status: payload.newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.courseId);

        if (error)
          throw new Error(`Error al cambiar el estado: ${error.message}`);
      },
      onSuccess: () => {
        toast.success("Estado del curso actualizado");
        queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  // --- NUEVA MUTACIÓN PARA ACTUALIZAR MÓDULO ---
  const { mutate: updateModule, isPending: isUpdatingModule } = useMutation({
    mutationFn: async (payload: UpdateModulePayload) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("modules")
        .update({ title: payload.title, updated_at: new Date().toISOString() })
        .eq("id", payload.moduleId);

      if (error)
        throw new Error(`Error al actualizar el módulo: ${error.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Módulo actualizado con éxito");
      queryClient.invalidateQueries({
        queryKey: ["admin-course", variables.courseId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  // --- NUEVA MUTACIÓN PARA ELIMINAR MÓDULO Y SUS ARCHIVOS ---
  const { mutate: deleteModule, isPending: isDeletingModule } = useMutation<
    void,
    Error,
    DeleteModulePayload
  >({
    mutationFn: async (payload: DeleteModulePayload) => {
      const supabase = createSupabaseBrowserClient();
      const { moduleToDelete } = payload;

      // 1. Recolectar las rutas de los archivos de todas las lecciones del módulo
      const fileUrls = moduleToDelete.lessons
        .map((lesson) => lesson.content_url)
        .filter(Boolean) as string[]; // Filtramos las lecciones que sí tienen un archivo

      if (fileUrls.length > 0) {
        // Extraemos las rutas de archivo de las URLs completas
        const filePaths: string[] = [];
        const bucketSet = new Set<string>(); // Para manejar múltiples buckets si fuera necesario

        fileUrls.forEach((url) => {
          const regex = /storage\/v1\/object\/public\/([^/]+)\/(.+)/;
          const matches = url.match(regex);
          if (matches && matches[1] && matches[2]) {
            bucketSet.add(matches[1]);
            filePaths.push(matches[2]);
          }
        });

        // 2. Si hay archivos, los borramos del Storage
        if (filePaths.length > 0) {
          // Asumimos por ahora que todas las lecciones de un módulo están en el mismo tipo de bucket
          // si no, la lógica necesitaría agrupar por bucket.
          const bucket = Array.from(bucketSet)[0];
          if (bucket) {
            const { error: storageError } = await supabase.storage
              .from(bucket)
              .remove(filePaths);
            if (storageError)
              throw new Error(
                `Error al borrar archivos del módulo: ${storageError.message}`
              );
          }
        }
      }

      // 3. Finalmente, borramos el módulo de la base de datos.
      // La DB se encargará de borrar las lecciones en cascada (ON DELETE CASCADE)
      const { error: dbError } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleToDelete.id);

      if (dbError)
        throw new Error(`Error al eliminar el módulo: ${dbError.message}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Módulo y sus lecciones eliminados con éxito");
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
    updateLesson,
    isUpdatingLesson,
    deleteLesson,
    isDeletingLesson,
    updateCourseStatus,
    isUpdatingStatus,
    updateModule,
    isUpdatingModule,
    deleteModule,
    isDeletingModule,
  };
}
