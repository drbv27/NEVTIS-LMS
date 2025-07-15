// src/components/shared/CodeEditor.tsx
"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  height = "200px",
}: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={[javascript({ jsx: true, typescript: true })]}
      onChange={onChange}
      theme="dark"
      style={{
        fontSize: "14px",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
      }}
    />
  );
}
