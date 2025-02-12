"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLoginModal from "./AdminLoginModal";
import ProfileModal from "./ProfileModal";
import DashboardAdmin from "./admin/DashboardAdmin";
import Home from "./Home";
import Map from "../components/map/Map";
import Image from 'next/image';

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia"; 
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [showMap, setShowMap] = useState(false); 

  const loadPoints = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/points");
      setMapPoints(response.data);
    } catch (error) {
      console.error("Error al cargar los puntos:", error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    await loadPoints();

    import("sweetalert2").then((Swal) => {
      Swal.default.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
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
          <div className="flex gap-4">
            <button
              onClick={toggleProfileModal}
              className="bg-gray-500 px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Perfil
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
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
        <ProfileModal isOpen={isProfileModalOpen} onClose={toggleProfileModal} />
        
        {isAuthenticated ? (
          <DashboardAdmin mapPoints={mapPoints} setMapPoints={setMapPoints} isAuthenticated={isAuthenticated} />
        ) : showMap ? (
          <Map points={mapPoints} />
        ) : (
          <Home onStart={() => setShowMap(true)} /> 
        )}
      </div>
    </>
  );
}
