import React, { useEffect, useRef } from "react";
import Globe from "globe.gl";

const InteractiveGlobe: React.FC = () => {
  const globeRef = useRef(null);

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg") // Textura sin color
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png") // Relieve
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png") // Fondo

      .onGlobeClick(({ lat, lng }) => {
        console.log(`Latitud: ${lat}, Longitud: ${lng}`);
      });

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 1.2;

  }, []);

  return (
    <div
      ref={globeRef}
      style={{ width: "100%", height: "100vh" }} 
    />
  );
};

export default InteractiveGlobe;
