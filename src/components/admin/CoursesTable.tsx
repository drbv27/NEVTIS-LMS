//src/components/admin/CourseTable.tsx
"use client";

import { useState } from "react"; // Importamos useState
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import { type Course } from "@/lib/types"; // Importamos el tipo
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MoreHorizontal,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import DeleteCourseAlert from "./DeleteCourseAlert";
import TableSkeleton from "../shared/TableSkeleton";

export default function CoursesTable() {
  const { data: courses, isLoading, error } = useAdminCourses();

  /* const { updateCourseStatus, isUpdatingStatus } = useCourseMutations(); */
  const { updateCourseStatus } = useCourseMutations();

  // Estado para controlar qué curso se va a eliminar y si el diálogo está abierto
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  if (isLoading) return <TableSkeleton columns={5} />;
  if (error) return <p className="text-destructive">Error: {error.message}</p>;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
            <p className="text-muted-foreground">
              Crea, edita y gestiona todos los cursos de la plataforma.
            </p>
          </div>
          <Link href="/admin/courses/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Curso
            </Button>
          </Link>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.categories?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={course.is_free ? "default" : "secondary"}>
                      {course.is_free ? "Gratis" : "De Pago"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.status === "published"
                          ? "outline"
                          : "destructive"
                      }
                      className={
                        course.status === "published"
                          ? "border-green-500 text-green-600"
                          : ""
                      }
                    >
                      {course.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {/* --- INICIO DE LA NUEVA LÓGICA --- */}
                        <DropdownMenuItem
                          onClick={() =>
                            updateCourseStatus({
                              courseId: course.id,
                              newStatus:
                                course.status === "published"
                                  ? "draft"
                                  : "published",
                            })
                          }
                        >
                          {course.status === "published" ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Pasar a borrador
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Publicar curso
                            </>
                          )}
                        </DropdownMenuItem>
                        {/* --- FIN DE LA NUEVA LÓGICA --- */}
                        <DropdownMenuSeparator />
                        {/* Al hacer clic, establecemos el curso a borrar y abrimos el diálogo */}
                        <DropdownMenuItem
                          onClick={() => setCourseToDelete(course)}
                          className="text-destructive focus:text-destructive"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* El diálogo de alerta. Solo se muestra si hay un 'courseToDelete' */}
      {courseToDelete && (
        <DeleteCourseAlert
          isOpen={!!courseToDelete}
          onOpenChange={(isOpen) => !isOpen && setCourseToDelete(null)}
          course={courseToDelete}
        />
      )}
    </>
  );
}
