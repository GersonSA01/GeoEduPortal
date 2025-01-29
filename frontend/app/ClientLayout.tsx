"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLoginModal from "./AdminLoginModal";
import DashboardAdmin from "./admin/DashboardAdmin";
import Home from "./Home";
import Map from "../components/map/Map";
import { Globe as GlobeIcon } from "lucide-react";
import Image from 'next/image';

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [showMap, setShowMap] = useState(false); // Estado centralizado para controlar qué mostrar

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);

    import("sweetalert2").then((Swal) => {
      Swal.default.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }

    axios
      .get("http://localhost:5000/api/points")
      .then((response) => {
        setMapPoints(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar los puntos:", error);
      });
  }, []);

  return (
    <>
      <nav className="bg-gray-800 text-white p-4 shadow-md fixed top-0 left-0 w-full z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
          <img src="/logo.png" alt="GeoEduPortal Logo" className="h-20" />

          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={toggleModal}
            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Admin Login
          </button>
        )}
      </nav>

      <div className="pt-16">
        <AdminLoginModal isOpen={isModalOpen} onClose={toggleModal} onLoginSuccess={handleLoginSuccess} />

        {isAuthenticated ? (
          <DashboardAdmin mapPoints={mapPoints} setMapPoints={setMapPoints} isAuthenticated={isAuthenticated} />
        ) : showMap ? (
          <Map points={mapPoints} />
        ) : (
          <Home onStart={() => setShowMap(true)} /> // Pasar la función para manejar el estado
        )}
      </div>
    </>
  );
}
