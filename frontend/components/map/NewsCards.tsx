// NewsCards.tsx
"use client";

interface MapPoint {
  id: string;
  name: string;
  description: string;
  type: string;
  url?: string;
  images?: string;
  isAuthenticated: boolean;

}

interface NewsCardsProps {
  visiblePoints: MapPoint[];
  editPoint: (point: MapPoint) => void;
  deletePoint: (id: string) => void;
}

export default function NewsCards({ visiblePoints, editPoint, deletePoint, isAuthenticated   }: NewsCardsProps) {
  return (
    <div className="w-1/3 max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Noticias en esta región</h2>
      {visiblePoints.length > 0 ? (
        visiblePoints.map((point) => (
          <div key={point.id} className="mb-4 p-4 border rounded-lg shadow-md bg-gray-100 relative">
            {point.images ? (
              <div className="relative w-full h-32 overflow-hidden rounded-md">
                {point.images.split(",").map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000${img}`}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin imágenes disponibles</p>
            )}

            <h3 className="text-md font-semibold mt-2">{point.name}</h3>
            <p className="text-sm text-gray-600">{point.description}</p>

            {point.url && (
              <a
                href={point.url}
                target="_blank"
                className="text-blue-500 text-sm mt-1 inline-block"
              >
                Ver más
              </a>
            )}

{isAuthenticated && (
              <div className="absolute top-2 right-2 flex gap-2">
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
