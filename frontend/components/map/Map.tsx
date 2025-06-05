"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import NewsCards from "./NewsCards";
import SearchBar from "./SearchBar";
import { fetchGDELTNews } from "../../lib/apiService"; 
import categoriesData from "../../lib/categories.json";
import Tooltip from "./Tooltip";

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
  isAuthenticated: boolean;
}

export default function Map({ width = 800, height = 600, points, editPoint, deletePoint, isAuthenticated }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null);
  const [tooltipData, setTooltipData] = useState<{ point: MapPoint | null; position: { x: number; y: number } }>({
    point: null,
    position: { x: 0, y: 0 },
  }); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState<MapPoint[]>(points);
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

  const normalizeType = (type: string) => type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const categorizeNews = (title: string): string => {
    if (!title) return "otros";
    return Object.keys(categoriesData).find(category =>
      categoriesData[category].some(keyword => new RegExp(`\\b${keyword}\\b`, "i").test(title))
    ) || "otros";
  };

  const filterPoints = () => {
    return [...points, ...gdeltPoints].filter(
      (point) =>
        (selectedType === "todos" || normalizeType(point.type) === selectedType) &&
        (point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         point.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  useEffect(() => {
    setFilteredPoints(filterPoints());
    setSelectedPointId(null);
  }, [searchTerm, points, gdeltPoints, selectedType]);

  useEffect(() => {
    async function loadGDELTNews() {
      try {
        const news = await fetchGDELTNews();
        setGdeltPoints(news.map(article => ({ ...article, type: categorizeNews(article.name) })));
      } catch (error) {
        console.error("Error al obtener noticias de GDELT:", error);
      }
    }
    loadGDELTNews();
  }, []);

  const updateVisiblePoints = (transform) => {
    if (!projectionRef.current) return;

    const scale = 600 * transform.k;
    const translateX = transform.x;
    const translateY = transform.y;

    const projection = projectionRef.current.scale(scale).translate([
      width / 2 + translateX,
      height / 2 + translateY,
    ]);

    setVisiblePoints(
      filteredPoints.filter((point) => {
        const [x, y] = projection([point.longitude, point.latitude]) || [];
        return x >= 0 && x <= width && y >= 0 && y <= height;
      })
    );
  };

  useEffect(() => {
    updateVisiblePoints({ x: 0, y: 0, k: 1 });
  }, [gdeltPoints, points]);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();
    projectionRef.current = d3.geoMercator().center([-65, -15]).scale(600).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projectionRef.current);

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    const mapGroup = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.5, 8]).on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
      updateVisiblePoints(event.transform);
    });

    svg.call(zoom as any);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data: any) => {
      mapGroup.selectAll("path").data(data.features).enter().append("path").attr("d", path as any)
        .attr("fill", "#cceeff").attr("stroke", "#333").attr("stroke-width", 0.5);

      const markers = mapGroup.selectAll("g").data(filteredPoints).enter().append("g")
        .attr("transform", (d) => `translate(${projectionRef.current!([d.longitude, d.latitude])!})`);

      markers.append("circle").attr("r", 5)
        .attr("fill", (d) => d.id === selectedPointId ? "#ff0000" : (typeColors[normalizeType(d.type)] || typeColors.default))
        .attr("stroke", "#fff").attr("stroke-width", 2).attr("cursor", "pointer")
        .on("click", (event, d) => setSelectedPointId(prevId => prevId === d.id ? null : d.id));


        markers.on("mouseover", function (event, d) {
          setTooltipData({ point: d, position: { x: event.pageX, y: event.pageY } });
        });
    
        markers.on("mouseout", function () {
          setTooltipData({ point: null, position: { x: 0, y: 0 } });
        });
    });

  }, [filteredPoints, width, height]);

  return (
    <div className="p-4 sm:p-6 lg:p-12 bg-gray-50 h-full flex flex-col items-center justify-center">
      <div className="flex w-full h-[85vh] gap-6">
        
        <div className="w-1/5 bg-white rounded-lg shadow-lg p-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedType={selectedType} setSelectedType={setSelectedType} />
        </div>
  
        <div className="w-4/5 bg-white rounded-lg shadow-lg relative">
          <svg ref={svgRef} className="w-full h-full touch-none" />
        </div>
  
        <div className="w-3/5 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
          <NewsCards 
            visiblePoints={visiblePoints} 
            editPoint={editPoint} 
            deletePoint={deletePoint} 
            isAuthenticated={isAuthenticated} 
            selectedPointId={selectedPointId} 
          />
        </div>
  
      </div>
  
      {tooltipData.point && <Tooltip point={tooltipData.point} position={tooltipData.position} />}
    </div>
  );
  
  
}
