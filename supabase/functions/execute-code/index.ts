// supabase/functions/execute-code/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function createResponse(body: object, status: number = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    },
    status: status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createResponse({ message: "ok" });
  }

  try {
    const { studentCode, testCode } = await req.json();

    // Creamos nuestro objeto 'assert' que estará disponible para las pruebas.
    const assert = {
      strictEqual: (actual: any, expected: any, message?: string) => {
        if (actual !== expected) {
          throw new Error(
            message || `Se esperaba ${expected} pero se obtuvo ${actual}`
          );
        }
      },
    };

    // Combinamos todo el código en un solo script.
    const fullCode = `
      ${studentCode}
      ${testCode}
    `;

    // Usamos el constructor de Función para crear un entorno aislado.
    // Le pasamos 'assert' como un argumento, así que estará disponible dentro del código.
    const testFunction = new Function("assert", fullCode);

    // Ejecutamos la función, pasándole nuestro objeto 'assert'.
    testFunction(assert);

    // Si la línea anterior no lanzó un error, todas las pruebas pasaron.
    return createResponse({
      success: true,
      output: "✅ ¡Felicidades! Todas las pruebas pasaron.",
      error: null,
    });
  } catch (e) {
    // Si cualquier cosa falla (error de sintaxis o una prueba de assert), lo capturamos.
    return createResponse({
      success: false,
      output: null,
      error: `❌ ${e.message}`,
    });
  }
});
