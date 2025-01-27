"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const projection = d3.geoMercator()
      .center([-65, -15])
      .scale(600)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    const mapGroup = svg.append("g");

    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });

    svg.call(zoom as any);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((data: any) => {
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
          .data(points)
          .enter()
          .append("g")
          .attr("transform", (d) => `translate(${projection([d.longitude, d.latitude])!})`);

        markers
          .append("circle")
          .attr("r", 6)
          .attr("fill", (d) => {
            switch (d.type) {
              case "research":
                return "#e63946"; // Rojo para investigación
              case "mining":
                return "#2a9d8f"; // Verde para minería
              case "volcanic":
                return "#ee9b00"; // Naranja para volcánico
              default:
                return "#457b9d"; // Azul para otros
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
          .style("pointer-events", "none")
          .style("visibility", "hidden");

        markers
        .on("mouseover", function (event, d) {
          const imagesArray = d.images ? d.images.split(",") : [];
        
          const carousel = imagesArray.length
            ? `<div style="
                  display: flex;
                  width: 120px;
                  height: 80px;
                  overflow: hidden;
                  margin-bottom: 8px;
                  margin-left: 50px;
                ">
                <div style="
                  display: flex;
                  animation: slide 6s infinite;
                ">
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
                  25% { transform: translateX(-120px); }
                  50% { transform: translateX(-240px); }
                  75% { transform: translateX(-360px); }
                  100% { transform: translateX(0); }
                }
              </style>`
            : "<p style='text-align: center;'>Sin imágenes disponibles</p>";
        
          tooltip
            .style("visibility", "visible")
            .style("left", `${event.pageX - 125}px`)
            .style("top", `${event.pageY - 275}px`) 
            .html(`
              <div style="
                  max-width: 250px;
                  max-height: 300px;
                  overflow: hidden;
                  padding: 12px;
                  background: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                ">
                ${carousel}
                <strong style="display: block; font-size: 16px; margin-bottom: 8px; color: #333;">${d.name}</strong>
                <p style="font-size: 14px; color: #555; overflow: auto; max-height: 100px; line-height: 1.4;">
                  ${d.description}
                </p>
              </div>
            `);

            d3.select(this).select("circle").transition().duration(200).attr("r", 8);
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            d3.select(this).select("circle").transition().duration(200).attr("r", 6);
          })
          .on("click", function (event, d) {
            if (d.url) {
              window.open(d.url, "_blank");
            }
          });
      });
  }, [points, width, height]);

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
