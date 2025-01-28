import React, { useEffect, useRef } from "react";
import Globe from "globe.gl";

const InteractiveGlobe: React.FC = () => {
  const globeRef = useRef(null);

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg") // Nueva textura con agua azul
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png") // Relieve
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png") // Fondo
      .showAtmosphere(true) // Mostrar la atmósfera
      .atmosphereColor("#87CEEB") // Color de la atmósfera
      .atmosphereAltitude(0.2) // Altura de la atmósfera
      .onGlobeClick(({ lat, lng }) => {
        console.log(`Latitud: ${lat}, Longitud: ${lng}`);
      });

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 1.2;

    // Cargar GeoJSON para los países
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((res) => res.json())
      .then((countries) => {
        globe
          .polygonsData(countries.features || []) 
          .polygonCapColor(() => "rgba(34, 139, 34, 0.8)") 
          .polygonSideColor(() => "rgba(0, 100, 0, 0.5)") 
          .polygonStrokeColor(() => "#FFFFFF") 
          .polygonLabel(({ properties }) =>
            properties?.name ? `<b>${properties.name}</b>` : "Desconocido"
          ); 
      })
      .catch((err) => console.error("Error al cargar GeoJSON:", err));
  }, []);

  return (
    <div
      ref={globeRef}
      style={{ width: "100%", height: "100vh", background: "#000080" }} 
    />
  );
};

export default InteractiveGlobe;
