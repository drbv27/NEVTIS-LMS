import Navbar from "@/components/layout/Navbar"; // Importamos la Navbar

export default function LandingPage() {
  // Este es un Server Component, es más rápido porque no necesita JavaScript en el navegador
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Bienvenido a tu Plataforma
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Este es el punto de partida de tu aplicación. La autenticación se
            maneja desde el cliente para una experiencia de usuario fluida y
            rápida, replicando la sensación de una SPA.
          </p>
        </div>
      </main>
    </div>
  );
}
