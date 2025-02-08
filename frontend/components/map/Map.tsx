"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import NewsCards from "./NewsCards";
import SearchBar from "./SearchBar"
import { fetchGDELTNews } from "../../lib/apiService"; 

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia"; 
  url?: string;
  images?: string;
}

interface MapProps {
  width?: number;
  height?: number;
  points: MapPoint[];
  editPoint: (point: MapPoint) => void;
  deletePoint: (id: string) => void;
  isAuthenticated : boolean;  

}

export default function Map({ width = 800, height = 600, points, editPoint, deletePoint, isAuthenticated   }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState(points);
  const [visiblePoints, setVisiblePoints] = useState<MapPoint[]>(points);
  const [gdeltPoints, setGdeltPoints] = useState<MapPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null); 
  const [selectedType, setSelectedType] = useState<string | "todos">("todos");

  const typeColors: Record<string, string> = {
    salud: "#2ecc71",
    politica: "#e74c3c",
    seguridad: "#f1c40f",
    accidente: "#3498db",
    conflicto: "#9b59b6",
    clima: "#1abc9c",
    tecnologia: "#050042",
    default: "#aabf93",
  };

  const normalizeType = (type: string) => {
    return type
      .toLowerCase()
      .normalize("NFD") 
      .replace(/[\u0300-\u036f]/g, ""); 
  };


  const CATEGORIES = {
    "salud": ["hospital", "médico", "virus", "pandemia", "vacuna", "covid", "salud"],
    "politica": ["gobierno", "presidente", "elección", "congreso", "ley", "partido"],
    "seguridad": ["policía", "crimen", "delito", "robo", "asesinato", "secuestro", "violencia"],
    "accidente": ["choque", "colisión", "derrumbe", "explosión", "accidente", "incendio"],
    "conflicto": ["guerra", "protesta", "manifestación", "ataque", "terrorismo", "conflicto"],
    "clima": ["huracán", "tormenta", "terremoto", "inundación", "frío", "calor", "desastre"],
    "tecnologia": ["IA", "inteligencia artificial", "robot", "ciberseguridad", "redes", "smartphone"],
  };
  
  function categorizeNews(title: string): "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia" | "otros" {
    if (!title) return "otros";
  
    for (let category in CATEGORIES) {
      for (let keyword of CATEGORIES[category]) {
        const regex = new RegExp(`\\b${keyword}\\b`, "i"); 
        if (regex.test(title)) {
          return category as "salud" | "politica" | "seguridad" | "accidente" | "conflicto" | "clima" | "tecnologia";
        }
      }
    }
  
    return "otros"; 
  }
  


  

  useEffect(() => {
    const filtered = [...points, ...gdeltPoints].filter(
      (point) =>
        (selectedType === "todos" || normalizeType(point.type) === selectedType) &&
        (point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         point.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPoints(filtered);
    setSelectedPointId(null);
  }, [searchTerm, points, gdeltPoints, selectedType]);
  
  useEffect(() => {
    async function loadGDELTNews() {
      try {
        const news = await fetchGDELTNews();
        console.log("Noticias GDELT recibidas:", news);
  
        // 🔥 CATEGORIZAR AUTOMÁTICAMENTE LAS NOTICIAS
        const categorizedNews = news.map(article => ({
          ...article,
          type: categorizeNews(article.name),  // Usa la función para asignar tipo
        }));
  
        setGdeltPoints(categorizedNews);
      } catch (error) {
        console.error("Error al obtener noticias de GDELT:", error);
      }
    }
    
    loadGDELTNews();
  }, []);
  
  
  
  useEffect(() => {
    console.log("Estado actualizado - gdeltPoints:", gdeltPoints);
  }, [gdeltPoints]);
  
  

  
  useEffect(() => {
    setFilteredPoints([...points, ...gdeltPoints].filter(
      (point) =>
        (selectedType === "todos" || normalizeType(point.type) === selectedType) &&
        (point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         point.type.toLowerCase().includes(searchTerm.toLowerCase()))
    ));
    setSelectedPointId(null);
  }, [searchTerm, points, gdeltPoints, selectedType]);
  
  

  const updateVisiblePoints = (transform) => {
    if (!projectionRef.current) return;
  
    const scale = 600 * transform.k;
    const translateX = transform.x;
    const translateY = transform.y;
  
    const projection = projectionRef.current.scale(scale).translate([
      width / 2 + translateX,
      height / 2 + translateY,
    ]);
  
    const visible = filteredPoints.filter((point) => {
      const [x, y] = projection([point.longitude, point.latitude]) || [];
  
      console.log(`🗺 Punto ${point.name} -> X: ${x}, Y: ${y}, Zoom: ${transform.k}, Translate: (${translateX}, ${translateY})`);
  
      return x >= 0 && x <= width && y >= 0 && y <= height;
    });
  
    setVisiblePoints(visible);
  };
  
  
  
  
  useEffect(() => {
    updateVisiblePoints({ x: 0, y: 0, k: 1 }); 
  }, [gdeltPoints, points]);
  
  

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();
    projectionRef.current = d3
      .geoMercator()
      .center([-65, -15])
      .scale(600) 
      .translate([
        width / 2, 
        height / 2
      ]);
  
  

    const path = d3.geoPath().projection(projectionRef.current);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const mapGroup = svg.append("g");

    const zoom = d3.zoom().scaleExtent([0.5, 8]).on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
      updateVisiblePoints(event.transform); 
    });

    svg.call(zoom as any);

    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((data: any) => {
      mapGroup
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", "#cceeff")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);

        const markers = mapGroup
        .selectAll("g")
        .data(filteredPoints)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${projectionRef.current!([d.longitude, d.latitude])!})`);




      
      markers
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d) =>
          d.id === selectedPointId ? "#ff0000" : (typeColors[normalizeType(d.type)] || typeColors.default)
        )
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("click", (event, d) => {
          setSelectedPointId(d.id);
          console.log(`🔵 Noticia seleccionada: ${d.name}`);
        });
        
const tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("padding", "8px")
  .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
  .style("pointer-events", "auto")
  .style("visibility", "hidden");

  

markers
  .on("mouseover", function (event, d) {
    const imagesArray = d.images ? (Array.isArray(d.images) ? d.images : d.images.split(",")) : [];

    const formattedImages = imagesArray.map(img => 
      img.startsWith("http") ? img : `http://localhost:5000${img}`
    );
    
    const carousel =
      formattedImages.length > 1
        ? `<div style="display: flex; width: 120px; height: 80px; overflow: hidden; margin-bottom: 8px;">
            <div style="display: flex; animation: slide ${formattedImages.length * 3}s infinite linear; width: ${120 * formattedImages.length}px;">
              ${formattedImages
                .map(
                  (img) =>
                    `<img src="${img}" alt="Imagen" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;" />`
                )
                .join("")}
            </div>
          </div>
          <style>
            @keyframes slide {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${120 * formattedImages.length}px); }
            }
          </style>`
        : formattedImages.length === 1
        ? `<div style="display: flex; width: 120px; height: 80px; overflow: hidden; margin-bottom: 8px;">
            <img src="${formattedImages[0]}" alt="Imagen de noticia" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
          </div>`
        : "<p style='text-align: center;'>Sin imágenes disponibles</p>";
    
    tooltip
      .style("visibility", "visible")
      .style("left", `${event.pageX - 125}px`)
      .style("top", `${event.pageY - 315}px`)
      .html(`
        <div style="max-width: 250px; max-height: 300px; padding: 12px; background: #ffffff; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
          ${carousel}
          <strong style="font-size: 16px; margin-bottom: 8px;">${d.name}</strong>
          <p style="font-size: 14px; color: #555;">${d.description}</p>
          ${
            d.url
              ? `<a href="${d.url}" target="_blank" style="color: #007bff; text-decoration: underline;">Ver más</a>`
              : ""
          }
        </div>
      `);
  })
  .on("mouseout", function (event) {
    const target = event.relatedTarget;
    if (!tooltip.node()?.contains(target)) {
      tooltip.style("visibility", "hidden");
    }
  });

tooltip.on("mouseleave", function () {
  tooltip.style("visibility", "hidden");
});


      updateVisiblePoints({ x: 0, y: 0, k: 1 }); 
    });

        
  }, [filteredPoints, width, height]);

  return (
    <div className="p-4 sm:p-6 lg:p-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
    
  
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mt-8">
      <SearchBar
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  selectedType={selectedType}
  setSelectedType={setSelectedType}
/>
      </div>


      <div className="flex flex-col md:flex-row w-full max-w-7xl gap-6 h-[80vh]">
  
        <div className="w-full md:w-1/2 h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <svg ref={svgRef} className="w-full h-full touch-none" />
        </div>
  
        <div className="w-full md:w-1/2 h-full overflow-y-auto">
          <NewsCards 
            visiblePoints={visiblePoints} 
            editPoint={editPoint} 
            deletePoint={deletePoint} 
            isAuthenticated={isAuthenticated}  
            selectedPointId={selectedPointId}
          />
        </div>
  
      </div>
    </div>
  );
  
}


