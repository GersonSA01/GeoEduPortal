"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import NewsCards from "./NewsCards";
import SearchBar from "./SearchBar"

interface MapPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
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



  const fetchCoordinates = async (placeName: string) => {
    const cachedData = localStorage.getItem(`coords_${placeName}`);
    if (cachedData) {
      console.log(`📌 Usando coordenadas en caché para: ${placeName}`);
      return JSON.parse(cachedData);
    }
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=AIzaSyBLQegowHjIpKl5KE4MgtFNUsA3EvoyN_E`
      );
      const data = await response.json();
  
      if (data.results.length > 0) {
        const location = {
          lat: data.results[0].geometry.location.lat,
          lon: data.results[0].geometry.location.lng,
        };
  
        // Guardar en caché por si se vuelve a consultar
        localStorage.setItem(`coords_${placeName}`, JSON.stringify(location));
        console.log(`✅ Coordenadas guardadas en caché para: ${placeName}`);
  
        return location;
      }
    } catch (error) {
      console.error("❌ Error en Geocoding:", error);
    }
  
    return null;
  };
  

  const addRandomOffset = (lat: number, lon: number) => {
    const offset = 2; 
    return {
      lat: lat + (Math.random() * offset - offset / 2), 
      lon: lon + (Math.random() * offset - offset / 2),
    };
  };
  useEffect(() => {
    const GDELT_API_URL =
      "https://api.gdeltproject.org/api/v2/doc/doc?query=earthquake&format=json" +
      "&maxrecords=25" +
      "&timespan=7days" +
      "&lang=en" +
      "&image=only" +
      "&sort=rel" +
      "&domain=cnn.com,bbc.com" +
      "&domaincountry=us";
  
    const fetchGDELTNews = async () => {
      const cacheKey = "gdelt_news_cache";
      const cacheTimeKey = "gdelt_news_time";
      const cacheDuration = 30 * 60 * 1000; // 30 minutos
  
      // ⚡ Verificar si hay datos en caché y no han expirado
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < cacheDuration) {
        console.log("📌 Usando datos en caché de GDELT");
        setGdeltPoints(JSON.parse(cachedData));
        return;
      }
  
      try {
        const response = await fetch(GDELT_API_URL);
        const data = await response.json();
  
        console.log("✅ GDELT API Response:", data);
  
        if (!data.articles) {
          console.error("❌ No articles found in response.");
          return;
        }
  
        // 🚀 Obtener coordenadas para cada noticia basada en `sourcecountry`
        const gdeltData: MapPoint[] = await Promise.all(
          data.articles.map(async (article: any, index: number) => {
            let lat = null;
            let lon = null;
  
            if (article.sourcecountry) {
              console.log(`🔍 Buscando coordenadas para: ${article.sourcecountry}`);
              const location = await fetchCoordinates(article.sourcecountry);
              if (location) {
                const newCoords = addRandomOffset(location.lat, location.lon); 
                lat = newCoords.lat;
                lon = newCoords.lon;
              }
            }
  
            return lat && lon
              ? {
                  id: `gdelt-${index}`,
                  name: article.title,
                  description: article.excerpt || "Noticia relacionada con terremotos",
                  latitude: lat,
                  longitude: lon,
                  type: "news",
                  url: article.url,
                  images:
                    article.socialimage && article.socialimage.startsWith("http")
                      ? article.socialimage
                      : "https://via.placeholder.com/150",
                }
              : null;
          })
        );
  
        // Filtrar artículos sin coordenadas
        const filteredGdeltData = gdeltData.filter((point) => point !== null);
        console.log("🗺️ Puntos de GDELT con coordenadas:", filteredGdeltData);
  
        setGdeltPoints(filteredGdeltData);
  
        // Guardar en caché
        localStorage.setItem(cacheKey, JSON.stringify(filteredGdeltData));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
  
      } catch (error) {
        console.error("❌ Error fetching GDELT data:", error);
      }
    };
  
    fetchGDELTNews();
  }, []);
  
  
  
  

  useEffect(() => {
    setFilteredPoints(
      [...points, ...gdeltPoints].filter(
        (point) =>
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setSelectedPointId(null); // 🔹 Resetear selección si cambia la búsqueda
  }, [searchTerm, points, gdeltPoints]);
  

  const updateVisiblePoints = (transform) => {
    if (!projectionRef.current) return;

    const scale = 600 * transform.k; 
    const translateX = transform.x;
    const translateY = transform.y;

    const projection = projectionRef.current.scale(scale).translate([width / 2 + translateX, height / 2 + translateY]);

    const visible = filteredPoints.filter((point) => {
      const [x, y] = projection([point.longitude, point.latitude]) || [];
      return x >= 0 && x <= width && y >= 0 && y <= height;
    });

    setVisiblePoints(visible);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    projectionRef.current = d3
      .geoMercator()
      .center([-65, -15])
      .scale(600)
      .translate([width / 2, height / 2]);

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
        .attr("fill", (d) => (d.id === selectedPointId ? "#ff0000" : "#457b9d")) // 🔹 Resaltar si está seleccionado
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
      .style("top", `${event.pageY - 275}px`)
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
    <div className="p-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />


      <div className="flex w-full max-w-8xl gap-18">
        <div className="w-2/3 relative h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
        <NewsCards visiblePoints={visiblePoints} editPoint={editPoint} deletePoint={deletePoint} isAuthenticated={isAuthenticated}  selectedPointId={selectedPointId}/>
      </div>
    </div>
  );
}


