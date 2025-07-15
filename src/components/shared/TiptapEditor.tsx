// src/components/shared/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align"; // <-- 1. IMPORTAMOS LA NUEVA EXTENSIÓN
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
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Highlighter,
  RemoveFormatting,
  Check,
  Palette,
  Link as LinkIcon,
  /* Unlink, */
  Pilcrow,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify, // <-- 2. IMPORTAMOS ICONOS DE ALINEACIÓN
} from "lucide-react";

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const highlightColors = [
    { name: "Amarillo", color: "#FFF3A3" },
    { name: "Melocotón", color: "#FAA275" },
    { name: "Malva", color: "#CE6A85" },
  ];
  const textColors = [
    { name: "Default", color: "var(--foreground)" },
    { name: "Coral", color: "#FF8C61" },
    { name: "Ciruela", color: "#985277" },
    { name: "Berenjena", color: "#5C374C" },
  ];

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Introduce la URL del enlace:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const getCurrentTextStyle = () => {
    if (editor.isActive("heading", { level: 1 })) return "Encabezado 1";
    if (editor.isActive("heading", { level: 2 })) return "Encabezado 2";
    if (editor.isActive("heading", { level: 3 })) return "Encabezado 3";
    return "Párrafo";
  };

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex items-center gap-1 flex-wrap">
      {/* Menú de Estilos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-32 justify-between">
            <span>{getCurrentTextStyle()}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="mr-2 h-4 w-4" /> Párrafo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="mr-2 h-4 w-4" /> Encabezado 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="mr-2 h-4 w-4" /> Encabezado 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="mr-2 h-4 w-4" /> Encabezado 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* --- INICIO DEL NUEVO MENÚ DE ALINEACIÓN --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Alineación">
            {editor.isActive({ textAlign: "center" }) ? (
              <AlignCenter className="h-4 w-4" />
            ) : editor.isActive({ textAlign: "right" }) ? (
              <AlignRight className="h-4 w-4" />
            ) : editor.isActive({ textAlign: "justify" }) ? (
              <AlignJustify className="h-4 w-4" />
            ) : (
              <AlignLeft className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "left" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignLeft className="h-4 w-4 mr-2" /> Izquierda
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "center" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignCenter className="h-4 w-4 mr-2" /> Centro
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "right" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignRight className="h-4 w-4 mr-2" /> Derecha
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "justify" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignJustify className="h-4 w-4 mr-2" /> Justificado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* --- FIN DEL NUEVO MENÚ DE ALINEACIÓN --- */}

      {/* Otros menús y botones... */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Enlace">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={setLink}>
            Añadir/Editar Enlace
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
          >
            Quitar Enlace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Listas">
            <List className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="mr-2 h-4 w-4" /> Lista de Viñetas
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="mr-2 h-4 w-4" /> Lista Numerada
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        variant="ghost"
        size="icon"
        type="button"
        title="Separador Horizontal"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      // 3. AÑADIMOS Y CONFIGURAMOS LA EXTENSIÓN DE ALINEACIÓN
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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
