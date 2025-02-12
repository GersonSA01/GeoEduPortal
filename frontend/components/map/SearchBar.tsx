"use client";

import { useState } from "react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm, selectedType, setSelectedType }: SearchBarProps) {
  const typeColors: Record<string, string> = {
    salud: "#2ecc71",    
    politica: "#e74c3c",    
    seguridad: "#f1c40f",   
    accidente: "#3498db",   
    conflicto: "#9b59b6",  
    clima: "#1abc9c", 
    tecnologia: "#050042",    
    todos: "#aabf93",
    otros: "#aabf93"
  };

  return (
    <div className="mb-6 w-full max-w-md">
      <input
        type="text"
        placeholder="Buscar puntos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
      />

      <div className="mt-4">
        <label className="block text-gray-700 font-medium">Filtrar por tipo:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="todos">Todos</option>
          {Object.keys(typeColors).map((key) =>
            key !== "todos" ? (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ) : null
          )}
        </select>
      </div>

      <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
        <h3 className="text-gray-700 font-semibold mb-2">Leyenda</h3>
        <ul className="space-y-2">
          {Object.entries(typeColors).map(([key, color]) => (
            key !== "todos" && (
              <li key={key} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm capitalize">{key}</span>
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
