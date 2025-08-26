// src/components/partner/PartnerCoursesTable.tsx
"use client";

import { useState } from "react"; // <-- Se necesita useState
import { usePartnerCourses } from "@/hooks/usePartnerCourses";
import { type Course } from "@/lib/types";
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
  Trash2, // <-- Se necesita Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import TableSkeleton from "../shared/TableSkeleton";
import { useCourseMutations } from "@/hooks/useCourseMutations"; // <-- Se importa el hook
import DeleteCourseAlert from "@/components/admin/DeleteCourseAlert"; // <-- Reutilizamos la alerta del admin

export default function PartnerCoursesTable() {
  const { data: courses, isLoading, error } = usePartnerCourses();
  // Se obtienen las funciones para actualizar y borrar
  const { updateCourseStatus, isUpdatingStatus } = useCourseMutations();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  if (isLoading) return <TableSkeleton columns={5} />;
  if (error) return <p className="text-destructive">Error: {error.message}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all courses in your communities.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            You haven't created any courses yet.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.categories?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={course.is_free ? "default" : "secondary"}>
                      {course.is_free ? "Free" : "Paid"}
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
                      {course.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {/* ACCIONES AHORA HABILITADAS */}
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
                          disabled={isUpdatingStatus}
                        >
                          {course.status === "published" ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Set to Draft
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Publish Course
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setCourseToDelete(course)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* DIÁLOGO DE BORRADO AHORA CONECTADO */}
      {courseToDelete && (
        <DeleteCourseAlert
          isOpen={!!courseToDelete}
          onOpenChange={(isOpen) => !isOpen && setCourseToDelete(null)}
          course={courseToDelete}
        />
      )}
    </div>
  );
}
