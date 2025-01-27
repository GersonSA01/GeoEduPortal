const axios = require("axios");
const db = require("./db"); // Importa la base de datos configurada

// Configuración de la API
const API_URL = "https://newsdata.io/api/1/latest";
const API_KEY = "pub_667321b222b1a26ef545242eaf97ccc7ea228";

// Función para consumir la API y almacenar datos
async function fetchAndStoreArticles() {
  try {
    console.log("Iniciando la obtención de artículos desde la API...");
    
    // Consumir la API
    const response = await axios.get(API_URL, {
      params: {
        country: "ec", // Noticias de Ecuador
        apikey: API_KEY,
      },
    });

    // Verificar si hay resultados
    if (!response.data.results || response.data.results.length === 0) {
      console.log("No se encontraron artículos.");
      return;
    }

    // Extraer los primeros 25 artículos
    const articles = response.data.results.slice(0, 25);

    // Almacenar los artículos en la base de datos
    db.serialize(() => {
      articles.forEach((article) => {
        const {
          title,         // Título de la noticia
          description,   // Descripción de la noticia
          link,          // URL de la noticia
          image_url,     // URL de la imagen
        } = article;

        // Inserción en la tabla `points`
        db.run(
          `
          INSERT INTO points (name, description, latitude, longitude, type, url, images)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            title || "Sin título",           // Si no hay título, usar "Sin título"
            description || "Sin descripción", // Si no hay descripción, usar "Sin descripción"
            0.0,                              // Latitude predeterminada
            0.0,                              // Longitude predeterminada
            "noticia",                        // Tipo de punto (noticia)
            link || "",                       // URL de la noticia
            image_url || "",                  // URL de la imagen
          ],
          (err) => {
            if (err) {
              console.error("Error al insertar el artículo:", err.message);
            } else {
              console.log(`Artículo "${title}" insertado correctamente.`);
            }
          }
        );
      });
    });

    console.log("¡Artículos almacenados correctamente!");
  } catch (error) {
    console.error("Error al consumir la API:", error.message);
  }
}

// Ejecutar la función para consumir la API e insertar datos
fetchAndStoreArticles();
