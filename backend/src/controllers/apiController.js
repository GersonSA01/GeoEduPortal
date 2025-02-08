const fetch = require("node-fetch");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GDELT_API_URL =
    "https://api.gdeltproject.org/api/v2/doc/doc?query=earthquake&format=json" +
    "&maxrecords=25" +
    "&timespan=7days" +
    "&lang=en" +
    "&image=only" +
    "&sort=rel" +
    "&domain=cnn.com,bbc.com,espn.com" +
    "&domaincountry=us";

const cache = {};

async function fetchCoordinates(req, res) {
    const { placeName } = req.query;
    if (!placeName) return res.status(400).json({ error: "Falta el parámetro placeName" });

    if (cache[placeName]) return res.json(cache[placeName]);

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.results.length > 0) {
            const location = {
                lat: data.results[0].geometry.location.lat,
                lon: data.results[0].geometry.location.lng,
            };

            cache[placeName] = location;
            return res.json(location);
        }
        res.status(404).json({ error: "Lugar no encontrado" });
    } catch (error) {
        console.error("Error en fetchCoordinates:", error);
        res.status(500).json({ error: "Error al obtener coordenadas" });
    }
}

async function fetchGDELTNews(req, res) {
    try {
        const response = await fetch(GDELT_API_URL);
        const data = await response.json();

        console.log("Respuesta de la API GDELT:", JSON.stringify(data, null, 2));


        if (!data.articles) return res.json([]);

        const news = await Promise.all(
            data.articles.map(async (article, index) => {
                let lat = null, lon = null;

                if (article.sourcecountry) {
                    console.log(`🔍 Buscando coordenadas para: ${article.sourcecountry}`);
                    const response = await fetch(
                        `http://localhost:5000/api/coordinates?placeName=${encodeURIComponent(article.sourcecountry)}`
                    );
                    const location = await response.json();
                    console.log("📍 Coordenadas obtenidas:", location);
                
                    if (location) {
                        lat = location.lat;
                        lon = location.lon;
                    }
                }
                

                return lat && lon
                    ? {
                        id: `gdelt-${index}`,
                        name: article.title,
                        description: article.excerpt || "Noticia",
                        latitude: lat,
                        longitude: lon,
                        type: "news",
                        url: article.url,
                        images: article.socialimage || "https://via.placeholder.com/150",
                    }
                    : null;
            })
        );

        res.json(news.filter((point) => point !== null));
    } catch (error) {
        console.error("Error en fetchGDELTNews:", error);
        res.status(500).json({ error: "Error al obtener noticias" });
    }
}

module.exports = { fetchCoordinates, fetchGDELTNews };
