// src/components/shared/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
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
  Pilcrow,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const highlightColors = [
    { name: "Yellow", color: "#FFF3A3" },
    { name: "Peach", color: "#FAA275" },
    { name: "Mauve", color: "#CE6A85" },
  ];
  const textColors = [
    { name: "Default", color: "var(--foreground)" },
    { name: "Coral", color: "#FF8C61" },
    { name: "Plum", color: "#985277" },
    { name: "Aubergine", color: "#5C374C" },
  ];

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter the link URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const getCurrentTextStyle = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Paragraph";
  };

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex items-center gap-1 flex-wrap">
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
            <Pilcrow className="mr-2 h-4 w-4" /> Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="mr-2 h-4 w-4" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="mr-2 h-4 w-4" /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="mr-2 h-4 w-4" /> Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="icon"
        type="button"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Alignment">
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
            <AlignLeft className="h-4 w-4 mr-2" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "center" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignCenter className="h-4 w-4 mr-2" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "right" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignRight className="h-4 w-4 mr-2" /> Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className="flex items-center gap-2"
          >
            {editor.isActive({ textAlign: "justify" }) && (
              <Check className="h-4 w-4" />
            )}
            <AlignJustify className="h-4 w-4 mr-2" /> Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={setLink}>Add/Edit Link</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
          >
            Remove Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Highlight">
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
            Remove Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" title="Text Color">
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
          <Button variant="ghost" size="icon" type="button" title="Lists">
            <List className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="mr-2 h-4 w-4" /> Bulleted List
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="mr-2 h-4 w-4" /> Numbered List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        variant="ghost"
        size="icon"
        type="button"
        title="Horizontal Rule"
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
