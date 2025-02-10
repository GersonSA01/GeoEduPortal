"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [isRegister, setIsRegister] = useState(false); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      Swal.fire("Error", "Por favor, introduce un correo electrónico válido.", "error");
      return;
    }
    if (formData.password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    if (isRegister && formData.name.trim() === "") {
      Swal.fire("Error", "El nombre es obligatorio para registrarse.", "error");
      return;
    }
    if (isRegister && formData.password !== formData.confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden.", "error");
      return;
    }

    const url = isRegister
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    try {
      const { data } = await axios.post(url, formData);

      if (isRegister) {
        Swal.fire("¡Registro enviado!", "Tu solicitud ha sido enviada. Espera la aprobación del administrador.", "info");
        setIsRegister(false);
      } else if (!data.approved) {
        Swal.fire("Pendiente de Aprobación", "Tu cuenta aún no ha sido aprobada. Por favor, espera.", "warning");
        return;
      } else {
        localStorage.setItem("authToken", data.token);
        Swal.fire("¡Éxito!", "Inicio de sesión correcto.", "success");
        onLoginSuccess();
        onClose();
      }

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Swal.fire("Error", error.response?.data?.message || "Error inesperado en la solicitud.", "error");
      } else {
        Swal.fire("Error", "No se pudo conectar con el servidor. Revisa tu conexión a Internet.", "error");
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white p-6 rounded-md shadow-md max-w-md mx-auto top-1/2 transform -translate-y-1/2">
        <h2 className="text-xl font-semibold mb-4">
          {isRegister ? "Registro de Administrador" : "Inicio de Sesión"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nombre completo"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {isRegister ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-500 hover:underline text-sm"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
}
