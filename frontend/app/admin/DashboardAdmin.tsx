"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Map from "../../components/map/Map";
import Swal from "sweetalert2";
import CoordinatePicker from "./CoordinatePicker"; 
import PointForm from "./PointForm";

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia"; 
  url?: string;
  images?: string[];
}

export default function DashboardAdmin() {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [showPicker, setShowPicker] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  const [newPoint, setNewPoint] = useState({
    id: null,
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    type: "noticia",
    url: "",
    images: null,
  });


  const loadPoints = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/points");
      setMapPoints(response.data);
    } catch (error) {
      console.error("Error al cargar los puntos:", error);
    }
  }, []);
  
  useEffect(() => {
    loadPoints();
  }, [loadPoints]);
  

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);  
  }, []);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target.name === "images") {
      const files = e.target.files;
      if (files) {
        setImageFiles(Array.from(files));
        setNewPoint({ ...newPoint, images: files });

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  
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
    }).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" }); 
      }, 300); 
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

      <PointForm
        newPoint={newPoint}
        setNewPoint={setNewPoint}
        savePoint={savePoint}
        handleChange={handleChange}
        removeImagePreview={removeImagePreview}
        openPicker={() => setShowPicker(true)}
        imagePreviews={imagePreviews}
      />

        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Vista del Mapa</h2>
          <Map width={800} height={600} points={mapPoints} editPoint={editPoint} deletePoint={deletePoint} isAuthenticated={isAuthenticated}/>
        </div>

        {showPicker && <CoordinatePicker onSave={() => {}} onClose={() => setShowPicker(false)} />}

    </div>
  );
}
