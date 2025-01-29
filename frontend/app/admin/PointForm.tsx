"use client";

import { useState } from "react";
import ImagePreview from "./ImagePreview";
import CoordinatePicker from "./CoordinatePicker";

interface PointFormProps {
  newPoint: any;
  setNewPoint: (point: any) => void;
  savePoint: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  removeImagePreview: (index: number) => void;
  imagePreviews: string[];
}

export default function PointForm({
  newPoint,
  setNewPoint,
  savePoint,
  handleChange,
  removeImagePreview,
  imagePreviews
}: PointFormProps) {
  const [showPicker, setShowPicker] = useState(false); // 🔹 Estado para manejar la visibilidad de `CoordinatePicker`

  const saveCoordinates = (latitude: string, longitude: string) => {
    setNewPoint({ ...newPoint, latitude, longitude }); // 🔹 Guardar coordenadas en el estado
    setShowPicker(false); // 🔹 Cerrar el picker después de seleccionar
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        {newPoint.id ? "Editar Punto" : "Agregar Puntos en el Mapa"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={newPoint.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="description"
          placeholder="Descripción"
          value={newPoint.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        
        {/* 🔹 Input para Latitud con botón para abrir `CoordinatePicker` */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="latitude"
            placeholder="Latitud"
            value={newPoint.latitude}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => setShowPicker(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            📍
          </button>
        </div>

        {/* 🔹 Input para Longitud con botón para abrir `CoordinatePicker` */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="longitude"
            placeholder="Longitud"
            value={newPoint.longitude}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => setShowPicker(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            📍
          </button>
        </div>

        <input
          type="text"
          name="url"
          placeholder="URL de la noticia"
          value={newPoint.url}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="file"
          name="images"
          multiple
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <select
          name="type"
          value={newPoint.type}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="research">Investigación</option>
          <option value="mining">Minería</option>
          <option value="volcanic">Volcánico</option>
        </select>
      </div>

      {/* Vista previa de imágenes */}
      <ImagePreview imagePreviews={imagePreviews} removeImagePreview={removeImagePreview} />

      <button
        onClick={savePoint}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        {newPoint.id ? "Guardar Cambios" : "Agregar Punto"}
      </button>

      {/* 🔹 Mostrar `CoordinatePicker` cuando `showPicker` sea `true` */}
      {showPicker && (
        <CoordinatePicker onSave={saveCoordinates} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
