"use client";

import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ImagePreview from "./ImagePreview";
import CoordinatePicker from "./CoordinatePicker";

interface PointFormProps {
  newPoint: any;
  setNewPoint: (point: any) => void;
  savePoint: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
  const [showPicker, setShowPicker] = useState(false);
  const maxTitleLength = 100;
  const maxDescLength = 130;

  const saveCoordinates = (latitude: string, longitude: string) => {
    setNewPoint({ ...newPoint, latitude, longitude });
    setShowPicker(false);
  };

  const cancelEdit = () => {
    setNewPoint({
      id: null,
      name: "",
      description: "",
      latitude: "",
      longitude: "",
      url: "",
      type: "research",
      images: [],
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {newPoint.id ? "Editar Punto" : "Agregar Puntos en el Mapa"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium">Título de la noticia</label>
          <div className="relative w-full">
            <input
              type="text"
              name="name"
              placeholder="Ejemplo: Descubrimiento de nuevos minerales"
              value={newPoint.name}
              onChange={handleChange}
              maxLength={maxTitleLength}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
            />
            <span className="absolute bottom-2 right-2 text-gray-500 text-xs pointer-events-none bg-white px-1">
              {newPoint.name.length}/{maxTitleLength}
            </span>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium">Descripción</label>
          <div className="relative w-full">
            <TextareaAutosize
              name="description"
              placeholder="Describe los detalles de la noticia..."
              value={newPoint.description}
              onChange={handleChange}
              maxLength={maxDescLength}
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-36 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
            />
            <span className="absolute bottom-2 right-2 text-gray-500 text-xs pointer-events-none bg-white px-1">
              {newPoint.description.length}/{maxDescLength}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-gray-700 font-medium">Latitud</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="latitude"
              placeholder="Ejemplo: -12.0433"
              value={newPoint.latitude}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={() => setShowPicker(true)} className="text-blue-500 hover:text-blue-700 text-lg">
              📍
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-gray-700 font-medium">Longitud</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="longitude"
              placeholder="Ejemplo: -77.0283"
              value={newPoint.longitude}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={() => setShowPicker(true)} className="text-blue-500 hover:text-blue-700 text-lg">
              📍
            </button>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium">URL de la noticia</label>
          <input
            type="text"
            name="url"
            placeholder="Ejemplo: https://example.com/noticia"
            value={newPoint.url}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium">Imágenes</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium">Categoría</label>
          <select
            name="type"
            value={newPoint.type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="salud">Salud</option>
            <option value="politica">Política</option>
            <option value="seguridad">Seguridad</option>
            <option value="accidente">Accidente</option>
            <option value="conflicto">Conflicto</option>
            <option value="clima">Clima</option>
            <option value="Tecnologia">Tecnologia</option>
          </select>

        </div>

      </div>

      <ImagePreview imagePreviews={imagePreviews} removeImagePreview={removeImagePreview} />

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={savePoint}
          className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          {newPoint.id ? "Guardar Cambios" : "Agregar Punto"}
        </button>

        {newPoint.id && (
          <button
            onClick={cancelEdit}
            className="bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-300"
          >
            Cancelar
          </button>
        )}
      </div>

      {showPicker && <CoordinatePicker onSave={saveCoordinates} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
