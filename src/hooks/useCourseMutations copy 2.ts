"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lesson } from "@/lib/types";

// Interfaces para los payloads (sin cambios)
interface CreateCoursePayload {
  title: string;
  description: string;
  categoryId: number;
  imageFile: File;
}
interface UpdateCoursePayload {
  courseId: string;
  title?: string;
  description?: string;
  categoryId?: number;
  imageFile?: File | null;
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
  contentText?: string;
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
      const courseUpdateData: { [key: string]: any } = {};
      if (payload.title) courseUpdateData.title = payload.title;
      if (payload.description)
        courseUpdateData.description = payload.description;
      if (payload.categoryId) courseUpdateData.category_id = payload.categoryId;
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

  const { mutate: deleteCourse, isPending: isDeletingCourse } = useMutation({
    mutationFn: async (courseToDelete: any) => {
      const supabase = createSupabaseBrowserClient();
      if (courseToDelete.image_url) {
        const filePath = new URL(courseToDelete.image_url).pathname.split(
          "/course-images/"
        )[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("course-images")
            .remove([filePath]);
          if (storageError) {
            console.error("Error eliminando imagen del storage:", storageError);
            toast.warning(
              "El curso se eliminó, pero hubo un error al borrar la imagen."
            );
          }
        }
      }
      const { error: dbError } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);
      if (dbError)
        throw new Error(`Error al eliminar el curso: ${dbError.message}`);
    },
    onSuccess: () => {
      toast.success("Curso eliminado con éxito");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onMutate: async (courseToDelete: any) => {
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });
      const previousCourses = queryClient.getQueryData<any[]>([
        "admin-courses",
      ]);
      if (previousCourses) {
        queryClient.setQueryData<any[]>(
          ["admin-courses"],
          previousCourses.filter((p) => p.id !== courseToDelete.id)
        );
      }
      return { previousCourses };
    },
    onError: (err, courseId, context: any) => {
      if (context?.previousCourses) {
        queryClient.setQueryData<any[]>(
          ["admin-courses"],
          context.previousCourses
        );
      }
      toast.error(err.message);
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

      // --- INICIO DE LÓGICA DE SUBIDA DE ARCHIVO ---
      if (payload.file) {
        const fileExt = payload.file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        // Ruta organizada: c(ID_CURSO)-m(ID_MODULO)-nombrearchivo.ext
        const filePath = `c${payload.courseId}-m${payload.moduleId}-${fileName}`;

        // Determinamos el bucket correcto según el tipo de lección
        const bucket =
          payload.lessonType === "video" ? "lesson-videos" : "lesson-pdfs";

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, payload.file);

        if (uploadError)
          throw new Error(`Error al subir el archivo: ${uploadError.message}`);

        // Obtenemos la URL pública para guardarla en la tabla 'lessons'
        fileUrl = supabase.storage.from(bucket).getPublicUrl(filePath)
          .data.publicUrl;
      }
      // --- FIN DE LÓGICA DE SUBIDA DE ARCHIVO ---

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
