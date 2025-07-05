// src/hooks/useCodeRunner.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CodeRunnerPayload {
  studentCode: string;
  testCode: string;
}

export interface CodeRunnerResult {
  success: boolean;
  output: string | null;
  error: string | null;
}

async function runCodeInSandbox(
  payload: CodeRunnerPayload
): Promise<CodeRunnerResult> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke("execute-code", {
    body: payload,
  });

  if (error) {
    throw new Error(`Error al invocar la función: ${error.message}`);
  }

  return data;
}

export function useCodeRunner() {
  const { mutate, isPending, data, error } = useMutation<
    CodeRunnerResult,
    Error,
    CodeRunnerPayload
  >({
    mutationFn: runCodeInSandbox,
  });

  return {
    runCode: mutate,
    isLoading: isPending,
    result: data,
    error,
  };
}
