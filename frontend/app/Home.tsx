"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import InteractiveGlobe from "../components/InteractiveGlobe";

const dummyNews = [
  {
    position: [2, 0, 0],
    title: "Descubrimiento Arqueológico en Egipto",
    summary: "Nueva tumba encontrada en el Valle de los Reyes",
    link: "https://example.com/news/1",
  },
  {
    position: [0, 2, 0],
    title: "Avance Tecnológico en Japón",
    summary: "Nuevo robot asistente para hospitales",
    link: "https://example.com/news/2",
  },
];

export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/2 left-6 transform -translate-y-1/2 text-white z-10 max-w-md"
      >
        <h2 className="text-4xl font-bold mb-4">Explora el Mundo a través de las Noticias</h2>
        <p className="text-lg text-gray-300 mb-6">
          Descubre eventos globales en tiempo real con nuestro mapa interactivo. Mantente informado sobre los acontecimientos más importantes alrededor del mundo.
        </p>
        <button
          onClick={onStart} // Llamar a la función recibida como prop
          className="bg-blue-500 px-6 py-3 rounded-md text-white font-bold hover:bg-blue-600 transition"
        >
          Empezar
        </button>
      </div>




      <div className="h-screen w-full">
            <InteractiveGlobe />
      </div>
    </main>
  );
}
