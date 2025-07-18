// src/components/admin/ModuleList.tsx
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
import DeleteModuleAlert from "./DeleteModuleAlert";
import LessonTypeIcon from "../lessons/LessonTypeIcon";

interface ModuleListProps {
  modules: Module[];
  courseId: string;
}

export default function ModuleList({ modules, courseId }: ModuleListProps) {
  const { createModule, isCreatingModule } = useCourseMutations();
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);

  const handleCreateModule = () => {
    if (!newModuleTitle.trim()) return;
    createModule(
      { title: newModuleTitle, courseId },
      {
        onSuccess: () => {
          setNewModuleTitle("");
        },
      }
    );
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            View, edit, and organize your course&apos;s modules and lessons.
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
                  <div className="flex items-center gap-2 pr-4">
                    <AccordionTrigger className="flex-1 hover:no-underline px-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-left">
                          {module.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <Button
                      onClick={() => setModuleToEdit(module)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Edit module"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setModuleToDelete(module)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label="Delete module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="px-1 pb-2">
                    <ul className="space-y-2 pt-2 px-3">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <LessonTypeIcon type={lesson.lesson_type} />
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setLessonToEdit(lesson)}
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Edit lesson"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setLessonToDelete(lesson)}
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Delete lesson"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                      {module.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground italic px-2 py-4 text-center">
                          This module has no lessons.
                        </p>
                      )}
                    </ul>
                    <CreateLessonForm
                      moduleId={module.id}
                      courseId={courseId}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>This course doesn&apos;t have any modules yet.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full space-y-2">
            <h4 className="text-sm font-semibold">Add New Module</h4>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., Introduction to the course"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                disabled={isCreatingModule}
              />
              <Button
                onClick={handleCreateModule}
                disabled={isCreatingModule || !newModuleTitle.trim()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreatingModule ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

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
      {moduleToEdit && (
        <EditModuleDialog
          isOpen={!!moduleToEdit}
          onOpenChange={() => setModuleToEdit(null)}
          module={moduleToEdit}
          courseId={courseId}
        />
      )}
      {moduleToDelete && (
        <DeleteModuleAlert
          isOpen={!!moduleToDelete}
          onOpenChange={() => setModuleToDelete(null)}
          module={moduleToDelete}
          courseId={courseId}
        />
      )}
    </>
  );
}
