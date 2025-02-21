"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire("Error", "Las nuevas contraseñas no coinciden.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("¡Éxito!", response.data.message, "success");
      onClose();
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "Error al cambiar la contraseña.", "error");
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white p-6 rounded-md shadow-md max-w-md mx-auto top-1/2 transform -translate-y-1/2">
        <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
