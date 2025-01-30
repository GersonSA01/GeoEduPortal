"use client";
import { useEffect, useRef } from "react";

interface MapPoint {
  id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  images?: string; // Puede ser una URL simple o una lista separada por comas
}

interface NewsCardsProps {
  visiblePoints: MapPoint[];
  editPoint: (point: MapPoint) => void;
  deletePoint: (id: string) => void;
  isAuthenticated: boolean;
  selectedPointId: string | null;
}

export default function NewsCards({ visiblePoints, editPoint, deletePoint, isAuthenticated, selectedPointId }: NewsCardsProps) {
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({}); // Diccionario de referencias

  useEffect(() => {
    if (selectedPointId && refs.current[selectedPointId]) {
      refs.current[selectedPointId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPointId]); // 🔹 Se activa solo cuando cambia la selección

  return (
    <div className="w-1/3 max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Noticias en esta región</h2>
      {visiblePoints.length > 0 ? (
        visiblePoints.map((point) => (
          <div
            key={point.id}
            ref={(el) => (refs.current[point.id] = el)} // 🔹 Se asigna la referencia individualmente
            className={`mb-4 p-4 border rounded-lg shadow-md bg-gray-100 relative ${
              point.id === selectedPointId ? "border-2 border-blue-500 bg-blue-50" : ""
            }`}
          >
            {point.images ? (
              <img
                src={point.images.includes("http") ? point.images : `http://localhost:5000${point.images}`}
                alt={`Imagen de ${point.name}`}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
              />
            ) : (
              <p className="text-gray-500 text-sm">Sin imágenes disponibles</p>
            )}

            <h3 className="text-md font-semibold mt-2">{point.name}</h3>
            <p className="text-sm text-gray-600">{point.description}</p>

            {point.url && (
              <a href={point.url} target="_blank" className="text-blue-500 text-sm mt-1 inline-block">
                Ver más
              </a>
            )}

            {isAuthenticated && (
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => editPoint(point)} className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600">
                  Editar
                </button>
                <button onClick={() => deletePoint(point.id)} className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600">
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No hay noticias en esta región.</p>
      )}
    </div>
  );
}
