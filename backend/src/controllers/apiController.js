const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const { countries } = require("countries-list");
const cities = require("all-the-cities");

const GDELT_API_URL =
    "https://api.gdeltproject.org/api/v2/doc/doc?query=news&format=json" +
    "&maxrecords=20" +
    "&timespan=1days" +
    "&lang=es" +
    "&image=only" +
    "&sort=date" +
    "&mode=artlist" +
    "&sourcecountry=all" +
    "&domain=bbc.com,cnn.com,elpais.com,clarin.com,eluniversal.com,milenio.com";

const cache = {};
const newsCache = {}; 
const CACHE_EXPIRATION_TIME = 60 * 60 * 2000; 

function isNewsCached(articleId) {
    if (newsCache[articleId]) {
        const { timestamp } = newsCache[articleId];
        const currentTime = Date.now();
        return currentTime - timestamp < CACHE_EXPIRATION_TIME;
    }
    return false;
}

function cacheNews(articleId, newsData) {
    newsCache[articleId] = { timestamp: Date.now(), data: newsData };
}

function extractLocationFromTitle(title, sourceCountry) {
    if (!title) return { city: null, country: null };

    let detectedCountry = null;
    let detectedCity = null;

    for (let countryCode in countries) {
        const countryName = countries[countryCode].name;
        const regex = new RegExp(`\\b${countryName}\\b`, "i");
        if (regex.test(title)) {
            detectedCountry = countryName;
            break;
        }
    }

    for (let city of cities) {
        if (city.name.length <= 3) continue;

        const regex = new RegExp(`\\b${city.name}\\b`, "i");
        if (regex.test(title)) {
            if (!detectedCountry || city.country === detectedCountry) {
                detectedCity = city.name;
                detectedCountry = countries[city.country]?.name || detectedCountry;
                break;
            }
        }
    }

    return { city: detectedCity, country: detectedCountry || sourceCountry };
}

async function fetchCoordinates(placeName) {
    if (!placeName) return null;
    if (cache[placeName]) return cache[placeName];

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status !== "OK") {
            console.error(`Google Maps no encontró coordenadas para: ${placeName}`);
            return null;
        }

        if (data.results.length > 0) {
            const location = {
                lat: data.results[0].geometry.location.lat,
                lon: data.results[0].geometry.location.lng,
            };
            cache[placeName] = location;
            return location;
        }
    } catch (error) {
        console.error("Error en fetchCoordinates:", error);
    }
    return null;
}

function addRandomOffset(lat, lon, offset = 3) {
    return {
        lat: lat + (Math.random() * offset - offset / 2),
        lon: lon + (Math.random() * offset - offset / 2),
    };
}

async function fetchGDELTNews(req, res) {
    try {
        const response = await fetch(GDELT_API_URL);
        const data = await response.json();

        if (!data.articles) return res.json([]);

        const news = await Promise.all(
            data.articles.map(async (article, index) => {
                const articleId = article.url; 

                if (isNewsCached(articleId)) {
                    return newsCache[articleId].data;
                }

                let lat = null, lon = null;
                let { city, country } = extractLocationFromTitle(article.title, article.sourcecountry);

                if (city) {
                    const cityData = cities.find(c => c.name === city);
                    if (cityData) {
                        lat = cityData.lat;
                        lon = cityData.lon;
                    } else {
                        const location = await fetchCoordinates(city);
                        if (location) {
                            lat = location.lat;
                            lon = location.lon;
                        }
                    }
                }

                if (!lat && country) {
                    const location = await fetchCoordinates(country);
                    if (location) {
                        lat = location.lat;
                        lon = location.lon;
                    }
                }

                if (!lat && article.sourcecountry) {
                    const location = await fetchCoordinates(article.sourcecountry);
                    if (location) {
                        lat = location.lat;
                        lon = location.lon;
                    }
                }

                if (!lat || !lon) {
                    console.warn(`⚠️ No se encontraron coordenadas para: ${article.title}`);
                } else {
                    const newCoords = addRandomOffset(lat, lon, 2);
                    lat = newCoords.lat;
                    lon = newCoords.lon;
                }

                const newsData = lat && lon
                    ? {
                        id: `gdelt-${index}`,
                        name: article.title || "Sin título",
                        description: article.excerpt || "Noticia sin descripción",
                        latitude: lat,
                        longitude: lon,
                        type: "news",
                        url: article.url,
                        images: article.socialimage || "https://via.placeholder.com/150",
                    }
                    : null;

                cacheNews(articleId, newsData);
                return newsData;
            })
        );

        res.json(news.filter((point) => point !== null));
    } catch (error) {
        console.error("Error en fetchGDELTNews:", error);
        res.status(500).json({ error: "Error al obtener noticias" });
    }
}

module.exports = { fetchCoordinates, fetchGDELTNews };
