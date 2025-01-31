"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

interface CoordinatePickerProps {
  onSave: (latitude: string, longitude: string) => void;
  onClose: () => void;
}

export default function CoordinatePicker({ onSave, onClose }: CoordinatePickerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement | null>(null);
  const pinRef = useRef<SVGCircleElement | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const projection = d3.geoMercator()
      .center([-65, -15])
      .scale(600)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    svg.selectAll("*").remove();

    const mapGroup = svg.append("g");
    mapGroupRef.current = mapGroup.node();

    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((data: any) => {
        mapGroup
          .selectAll("path")
          .data(data.features)
          .join("path") 
          .attr("d", path as any)
          .attr("fill", "#cceeff")
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5);

        svg.on("click", function (event: MouseEvent) {
          const [x, y] = d3.pointer(event, svg.node()); 
          const transform = d3.zoomTransform(mapGroupRef.current!); 

          const coords = projection.invert(transform.invert([x, y]) as [number, number]);
          if (coords) {
            setSelectedCoordinates({ lat: coords[1], lon: coords[0] });

            if (pinRef.current) {
              d3.select(pinRef.current)
                .attr("cx", x)
                .attr("cy", y)
                .style("display", "block"); 
            }
          }
        });
      });

    svg.append("circle")
      .attr("r", 8)
      .attr("fill", "red")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("display", "none") 
      .attr("class", "pin")
      .attr("pointer-events", "none") 
      .each(function () {
        pinRef.current = this;
      });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-[850px]">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Coordenadas</h2>
        <svg ref={svgRef} className="w-full h-96 border rounded-md"></svg>
        {selectedCoordinates && (
          <p className="mt-4">
            Coordenadas seleccionadas: <strong>Lat:</strong> {selectedCoordinates.lat.toFixed(6)}{" "}
            <strong>Lon:</strong> {selectedCoordinates.lon.toFixed(6)}
          </p>
        )}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
  className={`px-4 py-2 rounded-md ${
    selectedCoordinates
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
  disabled={!selectedCoordinates}
  onClick={() => {
    if (selectedCoordinates) {
      onSave(
        selectedCoordinates.lat.toFixed(6),
        selectedCoordinates.lon.toFixed(6)
      );
    }
  }}
>
  Guardar
</button>

        </div>
      </div>
    </div>
  );
}
