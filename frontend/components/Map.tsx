"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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
}

export default function Map({ width = 800, height = 600, points }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState(points);

  useEffect(() => {
    setFilteredPoints(
      points.filter(
        (point) =>
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, points]);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const projection = d3
      .geoMercator()
      .center([-65, -15])
      .scale(600)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const mapGroup = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((data: any) => {
      // Dibujar el mapa
      mapGroup
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", "#cceeff")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);

      // Dibujar los marcadores
      const markers = mapGroup
        .selectAll("g")
        .data(filteredPoints)
        .enter()
        .append("g")
        .attr(
          "transform",
          (d) => `translate(${projection([d.longitude, d.latitude])!})`
        );

      markers
        .append("circle")
        .attr("r", 6)
        .attr("fill", (d) => {
          switch (d.type) {
            case "research":
              return "#e63946";
            case "mining":
              return "#2a9d8f";
            case "volcanic":
              return "#ee9b00";
            default:
              return "#457b9d";
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer");

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
          const imagesArray = d.images ? d.images.split(",") : [];

          const carousel =
            imagesArray.length > 1
              ? `<div style="display: flex; width: 120px; height: 80px; overflow: hidden; margin-bottom: 8px;">
                  <div style="display: flex; animation: slide ${
                    imagesArray.length * 3
                  }s infinite linear; width: ${
                120 * imagesArray.length
              }px;">
                    ${imagesArray
                      .map(
                        (img) =>
                          `<img src="http://localhost:5000${img}" alt="Imagen" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;" />`
                      )
                      .join("")}
                  </div>
                </div>
                <style>
                  @keyframes slide {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-${
                      120 * imagesArray.length
                    }px); }
                  }
                </style>`
              : imagesArray.length === 1
              ? `<div style="display: flex; width: 120px; height: 80px; overflow: hidden; margin-bottom: 8px;">
                  <img src="http://localhost:5000${imagesArray[0]}" alt="Imagen" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;" />
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
    });
  }, [filteredPoints, width, height]);

  return (
    <div className="p-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <div className="mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Buscar puntos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
        />
      </div>
      <div className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}




/* CODIGO CON API */

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// interface MapPoint {
//   id: string;
//   name: string;
//   description: string;
//   latitude: number;
//   longitude: number;
//   type: string;
//   url?: string;
//   images?: string;
// }

// interface MapProps {
//   width?: number;
//   height?: number;
//   points?: MapPoint[]; // Ahora es opcional porque los datos vienen de la API
// }

// export default function Map({ width = 800, height = 600 }: MapProps) {
//   const svgRef = useRef<SVGSVGElement>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [points, setPoints] = useState<MapPoint[]>([]);
//   const [filteredPoints, setFilteredPoints] = useState<MapPoint[]>([]);

//   // Función para transformar los datos de la API a la interfaz `MapPoint`
//   const transformArticlesToMapPoints = (articles: any[]): MapPoint[] => {
//     return articles.map((article, index) => ({
//       id: index.toString(),
//       name: article.title,
//       description: article.description || "No description available",
//       latitude: Math.random() * 180 - 90, // Coordenadas aleatorias
//       longitude: Math.random() * 360 - 180, // Coordenadas aleatorias
//       type: "news", // Etiqueta genérica para diferenciar puntos
//       url: article.url,
//       images: article.urlToImage ? article.urlToImage : "",
//     }));
//   };

//   // Cargar datos desde la API de News API
//   useEffect(() => {
//     const fetchNews = async () => {
//       const apiKey = "233f763fe44047268d721c97dc2bfa5d"; // Reemplaza con tu clave API
//       const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

//       try {
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.status === "ok") {
//           const transformedPoints = transformArticlesToMapPoints(data.articles);
//           setPoints(transformedPoints);
//           setFilteredPoints(transformedPoints);
//         }
//       } catch (error) {
//         console.error("Error fetching news:", error);
//       }
//     };

//     fetchNews();
//   }, []);

//   // Filtrar puntos según el término de búsqueda
//   useEffect(() => {
//     setFilteredPoints(
//       points.filter(
//         (point) =>
//           point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           point.type.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//   }, [searchTerm, points]);

//   // Dibujar el mapa y los marcadores
//   useEffect(() => {
//     if (!svgRef.current) return;

//     d3.select(svgRef.current).selectAll("*").remove();

//     const projection = d3
//       .geoMercator()
//       .center([-65, -15])
//       .scale(600)
//       .translate([width / 2, height / 2]);

//     const path = d3.geoPath().projection(projection);

//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height);

//     const mapGroup = svg.append("g");

//     const zoom = d3
//       .zoom()
//       .scaleExtent([0.5, 8])
//       .on("zoom", (event) => {
//         mapGroup.attr("transform", event.transform);
//       });

//     svg.call(zoom as any);

//     d3.json(
//       "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
//     ).then((data: any) => {
//       // Dibujar el mapa
//       mapGroup
//         .selectAll("path")
//         .data(data.features)
//         .enter()
//         .append("path")
//         .attr("d", path as any)
//         .attr("fill", "#cceeff")
//         .attr("stroke", "#333")
//         .attr("stroke-width", 0.5);

//       // Dibujar los marcadores
//       const markers = mapGroup
//         .selectAll("g")
//         .data(filteredPoints)
//         .enter()
//         .append("g")
//         .attr(
//           "transform",
//           (d) => `translate(${projection([d.longitude, d.latitude])!})`
//         );

//       markers
//         .append("circle")
//         .attr("r", 6)
//         .attr("fill", "#457b9d")
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 2)
//         .attr("cursor", "pointer");

//       const tooltip = d3
//         .select("body")
//         .append("div")
//         .style("position", "absolute")
//         .style("background", "white")
//         .style("border", "1px solid #ccc")
//         .style("border-radius", "4px")
//         .style("padding", "8px")
//         .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
//         .style("pointer-events", "auto")
//         .style("visibility", "hidden");

//       markers
//         .on("mouseover", function (event, d) {
//           const imagesArray = d.images ? [d.images] : [];

//           const carousel =
//             imagesArray.length > 0
//               ? `<div style="display: flex; flex-direction: column; align-items: center;">
//                   <img src="${imagesArray[0]}" alt="Imagen" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
//                 </div>`
//               : "<p style='text-align: center;'>Sin imágenes disponibles</p>";

//           tooltip
//             .style("visibility", "visible")
//             .style("left", `${event.pageX + 10}px`)
//             .style("top", `${event.pageY + 10}px`)
//             .html(`
//               <div style="max-width: 250px; padding: 12px; background: #ffffff; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
//                 ${carousel}
//                 <strong style="font-size: 16px; margin-bottom: 8px;">${d.name}</strong>
//                 <p style="font-size: 14px; color: #555;">${d.description}</p>
//                 ${
//                   d.url
//                     ? `<a href="${d.url}" target="_blank" style="color: #007bff; text-decoration: underline;">Leer más</a>`
//                     : ""
//                 }
//               </div>
//             `);
//         })
//         .on("mouseout", () => tooltip.style("visibility", "hidden"));
//     });
//   }, [filteredPoints, width, height]);

//   return (
//     <div className="p-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
//       <div className="mb-6 w-full max-w-md">
//         <input
//           type="text"
//           placeholder="Buscar puntos..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full p-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
//         />
//       </div>
//       <div className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
//         <svg ref={svgRef} className="w-full h-full" />
//       </div>
//     </div>
//   );
// }
