"use client";

import { Globe as GlobeIcon } from "lucide-react";

export default function Head() {
  return (
    <>
      <title>
        <span>
          <GlobeIcon className="inline h-5 w-5 text-blue-500" /> GeoEduPortal
        </span>
      </title>
      <meta name="description" content="Portal educativo de geología y ciencias de la tierra" />
      <meta name="application-name" content="GeoEduPortal" />
      <meta name="keywords" content="geología, educación, ciencias de la tierra, mapas interactivos" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0055a5" />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
