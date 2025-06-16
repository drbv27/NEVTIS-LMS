// src/components/shared/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Highlighter,
  RemoveFormatting,
  Check,
  Palette, // <-- 1. IMPORTAMOS EL ICONO DE PALETA
} from "lucide-react";

const Toolbar = ({ editor }: { editor: any | null }) => {
  if (!editor) return null;

  const highlightColors = [
    { name: "Amarillo", color: "#FFF3A3" },
    { name: "Melocotón", color: "#FAA275" },
    { name: "Malva", color: "#CE6A85" },
  ];

  // 2. CREAMOS UNA LISTA DE COLORES PARA EL TEXTO
  const textColors = [
    { name: "Default", color: "var(--foreground)" }, // Usará el color por defecto del tema
    { name: "Coral", color: "#FF8C61" },
    { name: "Ciruela", color: "#985277" },
    { name: "Berenjena", color: "#5C374C" },
  ];

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex items-center gap-1 flex-wrap">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Negrita"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Cursiva"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Encabezado"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Resaltar">
            <Highlighter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {highlightColors.map(({ name, color }) => (
            <DropdownMenuItem
              key={color}
              onClick={() =>
                editor.chain().focus().setHighlight({ color }).run()
              }
              className="flex items-center gap-2"
            >
              {editor.isActive("highlight", { color }) && (
                <Check className="h-4 w-4" />
              )}
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span>{name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            <RemoveFormatting className="mr-2 h-4 w-4" />
            Quitar Resaltado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- INICIO DEL NUEVO MENÚ PARA COLOR DE TEXTO --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Color de Texto"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {textColors.map(({ name, color }) => (
            <DropdownMenuItem
              key={color}
              onClick={() =>
                name === "Default"
                  ? editor.chain().focus().unsetColor().run()
                  : editor.chain().focus().setColor(color).run()
              }
              className="flex items-center gap-2"
            >
              {editor.isActive("textStyle", { color }) && (
                <Check className="h-4 w-4" />
              )}
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span>{name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* --- FIN DEL NUEVO MENÚ PARA COLOR DE TEXTO --- */}

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Lista de viñetas"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};

// El resto del archivo no cambia
interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[150px] w-full rounded-b-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col justify-stretch min-h-[250px] rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
