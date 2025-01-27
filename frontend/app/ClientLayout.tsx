"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLoginModal from "./AdminLoginModal";
import DashboardAdmin from "./DashboardAdmin";
import Map from "../components/Map";

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
      <div className="fixed top-4 right-4 z-50">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={toggleModal}
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Admin Login
          </button>
        )}
      </div>

      <AdminLoginModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {isAuthenticated ? (
        <DashboardAdmin mapPoints={mapPoints} setMapPoints={setMapPoints} />
      ) : (
        <div className="container mx-auto px-4 py-8">

          <h1 className="text-3xl font-bold mb-6">Mapa de Puntos Públicos</h1>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#e63946]"></span>
                <span className="text-sm">Investigación</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2a9d8f]"></span>
                <span className="text-sm">Minería</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ee9b00]"></span>
                <span className="text-sm">Volcánico</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#457b9d]"></span>
                <span className="text-sm">Otros</span>
              </div>
            </div>
          <Map width={800} height={600} points={mapPoints} />
        </div>
      )}
    </>
  );
}
