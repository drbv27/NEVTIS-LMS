"use client";

import { useState } from "react";
import { type Module, type Lesson } from "@/lib/types";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GripVertical, Pencil, Trash2, PlusCircle } from "lucide-react";
import CreateLessonForm from "./CreateLessonForm";
import EditLessonDialog from "./EditLessonDialog";
import DeleteLessonAlert from "./DeleteLessonAlert";
import EditModuleDialog from "./EditModuleDialog";

interface ModuleListProps {
  modules: Module[];
  courseId: string; // Necesitamos el ID del curso para crear un módulo
}

export default function ModuleList({ modules, courseId }: ModuleListProps) {
  // Hook para la mutación de crear módulo
  const { createModule, isCreatingModule } = useCourseMutations();
  // Estado local para el título del nuevo módulo
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // Estados para controlar los diálogos de lecciones
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);

  const handleCreateModule = () => {
    if (!newModuleTitle.trim()) return;
    createModule(
      { title: newModuleTitle, courseId },
      {
        onSuccess: () => {
          setNewModuleTitle(""); // Limpiamos el input al tener éxito
        },
      }
    );
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Contenido del Curso</CardTitle>
          <CardDescription>
            Visualiza, edita y organiza los módulos y lecciones de tu curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules && modules.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-4">
              {modules.map((module) => (
                <AccordionItem
                  value={module.id}
                  key={module.id}
                  className="border rounded-lg bg-background"
                >
                  <AccordionTrigger className="hover:no-underline px-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pb-2">
                    <ul className="space-y-2 pt-2 px-3">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                        >
                          <span className="text-sm">{lesson.title}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setLessonToEdit(lesson)}
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setLessonToDelete(lesson)}
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                      {module.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground italic px-2 py-4 text-center">
                          Este módulo no tiene lecciones.
                        </p>
                      )}
                    </ul>
                    {/* --- INICIO DEL CAMBIO --- */}
                    {/* Añadimos el formulario para crear lecciones a cada módulo */}
                    <CreateLessonForm
                      moduleId={module.id}
                      courseId={courseId}
                    />
                    {/* --- FIN DEL CAMBIO --- */}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>Este curso aún no tiene módulos.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full space-y-2">
            <h4 className="text-sm font-semibold">Añadir Nuevo Módulo</h4>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ej: Introducción al curso"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                disabled={isCreatingModule}
              />
              <Button
                onClick={handleCreateModule}
                disabled={isCreatingModule || !newModuleTitle.trim()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreatingModule ? "Añadiendo..." : "Añadir"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      {/* Los diálogos se renderizan aquí y se activan con el estado */}
      {lessonToEdit && (
        <EditLessonDialog
          isOpen={!!lessonToEdit}
          onOpenChange={() => setLessonToEdit(null)}
          lesson={lessonToEdit}
          courseId={courseId}
        />
      )}
      {lessonToDelete && (
        <DeleteLessonAlert
          isOpen={!!lessonToDelete}
          onOpenChange={() => setLessonToDelete(null)}
          lesson={lessonToDelete}
          courseId={courseId}
        />
      )}
    </>
  );
}
