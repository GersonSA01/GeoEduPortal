"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Map from "../components/Map";
import Swal from "sweetalert2";
import CoordinatePicker from "./CoordinatePicker"; 

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  url?: string;
  images?: string[];
}

export default function DashboardAdmin() {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [showPicker, setShowPicker] = useState(false); 
  const [newPoint, setNewPoint] = useState({
    id: null,
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    type: "research",
    url: "",
    images: null,
  });

  // Cargar puntos al inicio
  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = () => {
    axios
      .get("http://localhost:5000/api/points")
      .then((response) => {
        setMapPoints(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar los puntos:", error);
      });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target.name === "images") {
      const files = e.target.files;
      if (files) {
        setImageFiles(Array.from(files));
        setNewPoint({ ...newPoint, images: files });

        // Generar vistas previas de las imágenes
        const previews = Array.from(files).map((file) =>
          URL.createObjectURL(file)
        );
        setImagePreviews(previews);
      }
    } else {
      setNewPoint({ ...newPoint, [e.target.name]: e.target.value });
    }
  };

  const removeImagePreview = (index: number) => {
    // Eliminar la imagen de las vistas previas y de los archivos seleccionados
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index);

    setImagePreviews(updatedPreviews);
    setImageFiles(updatedFiles);

    setNewPoint({
      ...newPoint,
      images: updatedFiles.length > 0 ? updatedFiles : null,
    });
  };

  const savePoint = () => {
    const formData = new FormData();
    formData.append("name", newPoint.name);
    formData.append("description", newPoint.description);
    formData.append("latitude", newPoint.latitude);
    formData.append("longitude", newPoint.longitude);
    formData.append("type", newPoint.type);
    formData.append("url", newPoint.url);

    if (newPoint.images) {
      Array.from(newPoint.images).forEach((file) => {
        formData.append("images", file);
      });
    }

    const endpoint = newPoint.id
      ? `http://localhost:5000/api/points/${newPoint.id}`
      : "http://localhost:5000/api/points";

    const method = newPoint.id ? "put" : "post";

    axios({
      method,
      url: endpoint,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        loadPoints();
        setNewPoint({
          id: null,
          name: "",
          description: "",
          latitude: "",
          longitude: "",
          type: "research",
          url: "",
          images: null,
        });
        setImagePreviews([]); 
        setImageFiles([]); 
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: newPoint.id
            ? "Punto editado correctamente."
            : "Punto agregado correctamente.",
          timer: 2000,
        });
      })
      .catch((error) => {
        console.error("Error al guardar el punto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al guardar el punto.",
          timer: 2000,
        });
      });
  };

  const deletePoint = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:5000/api/points/${id}`)
          .then(() => {
            loadPoints();
            Swal.fire({
              icon: "success",
              title: "¡Eliminado!",
              text: "El punto ha sido eliminado correctamente.",
              timer: 2000,
            });
          })
          .catch((error) => {
            console.error("Error al eliminar el punto:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Ocurrió un error al eliminar el punto.",
              timer: 2000,
            });
          });
      }
    });
  };

  const editPoint = (point: MapPoint) => {
    setNewPoint({
      id: point.id,
      name: point.name,
      description: point.description,
      latitude: point.latitude.toString(),
      longitude: point.longitude.toString(),
      type: point.type,
      url: point.url || "",
      images: null, 
    });
    setImagePreviews([]); 
    Swal.fire({
      icon: "info",
      title: "Editar Punto",
      text: `Ahora puedes editar el punto "${point.name}".`,
      timer: 2000,
    });
  };

  const openPicker = () => setShowPicker(true);
  const closePicker = () => setShowPicker(false);

  const saveCoordinates = (latitude: string, longitude: string) => {
    setNewPoint({ ...newPoint, latitude, longitude });
    closePicker();
    Swal.fire({
      icon: "success",
      title: "Coordenadas Seleccionadas",
      text: `Latitud: ${latitude}, Longitud: ${longitude}`,
      timer: 2000,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Administrador</h1>

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
              onClick={openPicker}
              className="text-blue-500 hover:text-blue-700"
            >
              📍
            </button>
          </div>
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
              onClick={openPicker}
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
        {imagePreviews.length > 0 && (
          <div className="mt-4 flex gap-4">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  alt={`Vista previa ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                />
                <button
                  onClick={() => removeImagePreview(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={savePoint}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {newPoint.id ? "Guardar Cambios" : "Agregar Punto"}
        </button>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Vista del Mapa</h2>
          <Map width={800} height={600} points={mapPoints} />
        </div>

        <div className="w-1/3">
          <h2 className="text-2xl font-semibold mb-4">Puntos en el Mapa</h2>
          <ul className="space-y-4">
            {mapPoints.map((point) => (
              <li
                key={point.id}
                className="p-4 border rounded-lg shadow-md bg-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{point.name}</p>
                    <p className="text-sm text-gray-600">{point.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPoint(point)}
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showPicker && (
        <CoordinatePicker onSave={saveCoordinates} onClose={closePicker} />
      )}
    </div>
  );
}
