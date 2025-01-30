const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

const noticias = [
    // Noticias de Ecuador
    ["Migrante ecuatoriano acusado de intento de secuestro en EE. UU.", "Un migrante ecuatoriano fue acusado de intento de secuestro en Estados Unidos tras ofrecer dulces a una niña de once años. Deberá comparecer ante el tribunal el 31 de enero de 2025.", -0.1807, -78.4678, "legal", "https://www.eluniverso.com/noticias/seguridad/migrante-ecuatoriano-es-acusado-de-intento-de-secuestro-en-ee-uu-tras-ofrecer-dulces-a-nina-de-once-anos-nota/", "/uploads/migrante_ecuador_2025.jpg"],
    ["Ecuador refuerza acciones ante temporada de lluvias", "Quito implementa el 'Plan Lluvia' para enfrentar la temporada invernal, modernizando el sistema de drenaje y realizando acciones preventivas en el sistema de alcantarillado y quebradas.", -0.2299, -78.5249, "environment", "https://www.primicias.ec/noticias/lo-ultimo/quito-refuerza-acciones-enfrentar-temporada-lluvias-plan-lluvia/", "/uploads/plan_lluvia_quito_2025.jpg"],
    ["Ecuadorianos elegirán más asambleístas en 2025", "Las elecciones de 2025 en Ecuador incluirán la votación por 151 asambleístas, aumentando la representación en la Asamblea Nacional.", -0.1807, -78.4678, "politics", "https://www.elcomercio.com/actualidad/politica/elecciones-2025-ecuador-asambleistas.html", "/uploads/elecciones_ecuador_2025.jpg"],
    ["Pérdida de remesas por deportaciones masivas en EE. UU.", "Ecuador podría perder hasta $875 millones anuales en remesas debido a las deportaciones masivas anunciadas por el gobierno de Estados Unidos.", -0.1807, -78.4678, "economic", "https://www.lahora.com.ec/pais/perdida-remesas-deportaciones-masivas-eeuu/", "/uploads/remesas_ecuador_2025.jpg"],
    ["Tercera jornada de cedulación en Ecuador", "El Registro Civil de Ecuador anuncia una tercera jornada extraordinaria de cedulación para el sábado 1 de febrero de 2025.", -0.1807, -78.4678, "social", "https://www.eltelegrafo.com.ec/noticias/actualidad/44/tercera-jornada-cedulacion-ecuador", "/uploads/cedulacion_ecuador_2025.jpg"],
    
    // Noticias de Norteamérica
    ["Claudia Sheinbaum celebra empleos para repatriados mexicanos", "La mandataria mexicana celebra la creación de 50,000 empleos para repatriados mexicanos y reitera su rechazo a la nueva política migratoria de Estados Unidos.", 19.4326, -99.1332, "politics", "https://elpais.com/mexico/2025-01-29/claudia-sheinbaum-celebra-empleos-para-repatriados-mexicanos.html", "/uploads/sheinbaum_mexico_2025.jpg"],
    ["EE. UU. cancela extensión del TPS para venezolanos", "Autoridades migratorias de EE. UU. confirmaron la revocación de la extensión del Estatus de Protección Temporal para venezolanos, abriendo la puerta a más deportaciones.", 38.9072, -77.0369, "immigration", "https://www.vozdeamerica.com/a/eeuu-cancela-extension-tps-venezolanos/7161234.html", "/uploads/tps_venezuela_2025.jpg"],
    ["Trump promulga ley que autoriza detención de migrantes acusados de delitos", "El presidente Donald Trump firmó una ley que autoriza la detención de migrantes acusados de delitos, endureciendo las políticas migratorias de Estados Unidos.", 38.9072, -77.0369, "politics", "https://www.vozdeamerica.com/a/trump-promulga-ley-detencion-migrantes/7161235.html", "/uploads/trump_ley_migrantes_2025.jpg"],
    ["Colombia recibe tercer avión con deportados de EE. UU.", "Colombia recibió el tercer avión con deportados desde Estados Unidos, en medio de tensiones diplomáticas entre ambos países por las políticas migratorias.", 4.7110, -74.0721, "immigration", "https://www.vozdeamerica.com/a/colombia-recibe-tercer-avion-deportados-eeuu/7161236.html", "/uploads/deportados_colombia_2025.jpg"],
    ["Trump evalúa detener migrantes en Guantánamo", "El presidente Donald Trump está considerando la posibilidad de detener a migrantes en la base militar de Estados Unidos en la bahía de Guantánamo, Cuba.", 20.0115, -75.1320, "politics", "https://www.vozdeamerica.com/a/trump-evalua-detener-migrantes-guantanamo/7161237.html", "/uploads/guantanamo_migrantes_2025.jpg"],
    ["EE. UU. designa a la Mara Salvatrucha como organización terrorista", "El gobierno de Estados Unidos ha designado a la Mara Salvatrucha (MS-13) como una organización terrorista, intensificando los esfuerzos para combatir sus actividades criminales.", 38.9072, -77.0369, "security", "https://www.vozdeamerica.com/a/eeuu-designa-ms13-organizacion-terrorista/7161238.html", "/uploads/ms13_terrorista_2025.jpg"],
    ["Canadá y México buscan evitar aranceles de EE. UU.", "Canadá y México están implementando medidas fronterizas rápidas para evitar los aranceles del 25% que Estados Unidos planea imponer a las importaciones a partir del 1 de febrero.", 45.4215, -75.6972, "economic", "https://www.vozdeamerica.com/a/canada-mexico-evitar-aranceles-eeuu/7161239.html", "/uploads/aranceles_canada_mexico_2025.jpg"],
    ["Petro cuestiona deportaciones de EE. UU.", "El presidente colombiano Gustavo Petro ha cuestionado las deportaciones masivas de Estados Unidos, comparándolas con episodios de campos de concentración nazis.", 4.7110, -74.0721, "politics", "https://www.vozdeamerica.com/a/petro-cuestiona-deportaciones-eeuu/7161240.html", "/uploads/petro_deportaciones_2025.jpg"],
];

const stmt = db.prepare("INSERT INTO points (name, description, latitude, longitude, type, url, images) VALUES (?, ?, ?, ?, ?, ?, ?)");

noticias.forEach((noticia) => {
    stmt.run(...noticia);
});

console.log("Datos insertados correctamente en SQLite");
db.close();
