"use client";
import { useEffect, useRef, useState } from "react";

interface MapPoint {
  id: string;
  name: string;
  description: string;
  type: "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia"; 
  url?: string;
  images?: string; 
}


interface NewsCardsProps {
  visiblePoints: MapPoint[];
  editPoint: (point: MapPoint) => void;
  deletePoint: (id: string) => void;
  isAuthenticated: boolean;
  selectedPointId: string | null;
}

export default function NewsCards({ visiblePoints, editPoint, deletePoint, isAuthenticated, selectedPointId }: NewsCardsProps) {
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (selectedPointId && refs.current[selectedPointId]) {
      refs.current[selectedPointId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPointId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevState) => {
        const newState = { ...prevState };

        visiblePoints.forEach((point) => {
          const imagesArray = point.images ? point.images.split(",").map(img => img.trim()) : [];
          if (imagesArray.length > 1) {
            newState[point.id] = (prevState[point.id] || 0) + 1 < imagesArray.length ? (prevState[point.id] || 0) + 1 : 0;
          }
        });

        return newState;
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, [visiblePoints]);

  return (
    <div className="w-full md:w-full max-h-[600px] p-4 bg-white rounded-lg shadow-lg md:overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Noticias en esta región</h2>

      {visiblePoints.length > 0 ? (
        <div className="flex flex-row sm:flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto">
          {visiblePoints.map((point) => {
            const imagesArray = point.images ? point.images.split(",").map(img => img.trim()) : [];
            const formattedImages = imagesArray.map(img => img.startsWith("http") ? img : `http://localhost:5000${img}`);
            const hasMultipleImages = formattedImages.length > 1;
            const currentIndex = currentImageIndex[point.id] || 0;

            return (
              <div
                key={point.id}
                ref={(el) => (refs.current[point.id] = el)}
                className={`p-4 border rounded-lg shadow-md bg-gray-100 relative min-w-[75%] sm:min-w-[50%] md:min-w-full ${
                  point.id === selectedPointId ? "border-2 border-blue-500 bg-blue-50" : ""
                }`}
              >
                {formattedImages.length > 0 ? (
                  <div className="relative overflow-hidden w-full h-48 rounded-md"> 
                    <div
                      className="absolute inset-0 transition-transform duration-500"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {formattedImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Imagen de ${point.name}`}
                          className="w-full h-64 object-cover rounded-md absolute" 
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/150")}
                          style={{ left: `${index * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Sin imágenes disponibles</p>
                )}


                <h3 className="text-md font-semibold mt-2">{point.name}</h3>
                <p className="text-sm text-gray-600">{point.description}</p>

                {point.url && (
                  <a href={point.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm mt-1 inline-block">
                    Ver más
                  </a>
                )}

                {isAuthenticated ? (
                  !(point.id?.toString().startsWith("gdelt-")) ? (
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" }); 
                          setTimeout(() => {
                            editPoint(point);
                          }, 300);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deletePoint(point.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 italic">
                      ❌ <span>Esta noticia no se puede editar ni eliminar</span>
                    </div>
                  )
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No hay noticias en esta región.</p>
      )}
    </div>
  );
}
