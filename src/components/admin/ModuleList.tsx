"use client";

import { type Module } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

interface ModuleListProps {
  modules: Module[];
}

export default function ModuleList({ modules }: ModuleListProps) {
  return (
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
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pt-2">
                    {module.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                      >
                        <span className="text-sm">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
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
                      <p className="text-sm text-muted-foreground italic px-2">
                        Este módulo no tiene lecciones.
                      </p>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Este curso aún no tiene módulos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
