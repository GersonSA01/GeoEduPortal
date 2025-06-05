import React from "react";

interface TooltipProps {
  point: {
    name: string;
    description: string;
    images?: string;
    url?: string;
  } | null;
  position: { x: number; y: number };
}

const Tooltip: React.FC<TooltipProps> = ({ point, position }) => {
  if (!point) return null;

  const imagesArray = point.images ? (Array.isArray(point.images) ? point.images : point.images.split(",")) : [];
  const formattedImages: string[] = imagesArray.map(img => img.startsWith("http") ? img : `http://localhost:5000${img}`);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x - 125}px`,
        top: `${position.y - 330}px`,
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "12px",
        maxWidth: "250px",
        maxHeight: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      
      {formattedImages.length > 0 ? (
        <img
          src={formattedImages[0]}
          alt="Imagen de noticia"
          style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px" }}
        />
      ) : (
        <p style={{ textAlign: "center" }}>Sin imágenes disponibles</p>
      )}

      <strong style={{ fontSize: "16px", marginBottom: "8px" }}>{point.name}</strong>
      <p style={{ fontSize: "14px", color: "#555" }}>{point.description}</p>
    </div>
  );
};

export default Tooltip;
