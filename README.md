# GeoEduPortal

GeoEduPortal es un portal de noticias a nivel mundial que utiliza un mapa interactivo para mostrar eventos noticiosos. Los usuarios pueden acceder a noticias en tiempo real a través de dos fuentes: una base de datos PostgreSQL y la API del GDELT Project. Además, cuenta con un sistema de registro y aprobación de administradores para garantizar la integridad del contenido. Los administradores aprueban o rechazan solicitudes de usuarios mediante un protocolo SMTP.

## Tecnologías

- **Frontend:** React, TailwindCSS, Next.js, D3.js
- **Backend:** Node.js, Express
- **Base de datos:** PostgreSQL
- **APIs utilizadas:**
  - [GDELT Project](https://www.gdeltproject.org/) para obtener noticias globales
  - [Google Maps API](https://developers.google.com/maps/documentation) para mostrar ubicaciones

## Repositorio en GitHub

[GitHub - GeoEduPortal](https://github.com/GersonSA01/GeoEduPortal)

## Resumen del Proyecto

GeoEduPortal es un portal de noticias interactivo que integra información geolocalizada a través de un mapa en 3D. Los usuarios pueden visualizar las noticias desde diferentes partes del mundo y filtrarlas por categorías. Los administradores tienen acceso al sistema mediante un proceso de registro y aprobación, que garantiza el control de contenido a través de un superadministrador.

### Cómo funciona

1. **Obtención de Noticias:** El portal obtiene noticias en tiempo real desde la API de GDELT Project y desde una base de datos PostgreSQL.
2. **Geolocalización:** Utiliza la API de Google Maps para obtener las coordenadas geográficas de las noticias y mostrar su ubicación en el mapa.
3. **Registro de Administradores:** Un administrador puede solicitar registro, pero su acceso será aprobado o rechazado por un superadministrador vía SMTP.

## Configuración de Variables de Entorno

Para configurar el entorno, debes crear un archivo `.env` en la raíz del backend y agregar las siguientes variables:

```plaintext
PORT=5000
JWT_SECRET=supersecretkey
DATABASE_URL=postgres://user:password@host:port/database
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
APPROVE_URL=http://localhost:5000/api/auth/approve
```

### **Configuración del Envio de Correos (SMTP con Gmail)**

Para que el sistema pueda enviar correos, necesitas configurar una **contraseña de aplicación** en tu cuenta de Google.

1. Ve a [tu cuenta de Google](https://myaccount.google.com/).
2. En el menú lateral, selecciona **Seguridad**.
3. Activa la **verificación en dos pasos** si aún no lo has hecho.
4. Después de activarla, regresa a la sección **Seguridad** y busca **Contraseñas de aplicaciones**.
5. Crea una nueva contraseña de aplicación, seleccionando **Correo** y **Otro (personalizado)**.
6. Copia la contraseña generada y úsala en la variable `EMAIL_PASS` de tu archivo `.env`.

## 🏗Cómo ejecutar el proyecto

Para correr el proyecto, abre dos terminales y ejecuta lo siguiente:

### Terminal 1 (Frontend)

```bash
cd frontend
npm install
npm run dev
```

### Terminal 2 (Backend)

```bash
cd backend
npm install
npm run dev
```


