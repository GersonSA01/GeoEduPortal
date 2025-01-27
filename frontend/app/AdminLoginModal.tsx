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
  const [isRegister, setIsRegister] = useState(false); // Estado para alternar entre login y registro
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isRegister
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const { data } = await axios.post(url, formData);

      if (isRegister) {
        Swal.fire("¡Éxito!", "Registro completado. Ahora puedes iniciar sesión.", "success");
        setIsRegister(false); 
      } else {
        localStorage.setItem("authToken", data.token);

        Swal.fire("¡Éxito!", "Inicio de sesión correcto.", "success");
        onLoginSuccess();
        onClose();
      }

      setFormData({ name: "", email: "", password: "" });
      setMessage("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error inesperado.");
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
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}
