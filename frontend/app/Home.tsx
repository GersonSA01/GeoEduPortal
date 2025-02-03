"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import InteractiveGlobe from "../components/InteractiveGlobe";


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
          onClick={onStart} 
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
