# GeoEduPortal

GeoEduPortal es un portal de noticias a nivel mundial que utiliza un mapa interactivo para mostrar eventos noticiosos. Los usuarios pueden acceder a noticias en tiempo real a través de dos fuentes: una base de datos **PostgreSQL** y la API del **GDELT Project**. Además, cuenta con un sistema de registro y aprobación de administradores para garantizar la integridad del contenido. Los administradores aprueban o rechazan solicitudes de usuarios mediante un protocolo **SMTP**.

## Tecnologías

- **React**
- **TailwindCSS**
- **NextJS**
- **Node.js**
- **Express**
- **D3.js**
- **PostgreSQL**

## Repositorio en GitHub

[github.com/GersonSA01/GeoEduPortal](https://github.com/GersonSA01/GeoEduPortal)

## Resumen del Proyecto

**GeoEduPortal** es un portal de noticias interactivo que integra información geolocalizada a través de un mapa en 3D. Los usuarios pueden visualizar las noticias desde diferentes partes del mundo y filtrarlas por categorías. Los administradores tienen acceso al sistema mediante un proceso de registro y aprobación, que garantiza el control de contenido a través de un superadministrador.

### Cómo funciona

1. **Obtención de Noticias:** El portal obtiene noticias en tiempo real desde la API de **GDELT Project** y desde una base de datos **PostgreSQL**.
2. **Geolocalización:** Utiliza la API de **Google Maps** para obtener las coordenadas geográficas de las noticias y mostrar su ubicación en el mapa.
3. **Registro de Administradores:** Un administrador puede solicitar registro, pero su acceso será aprobado o rechazado por un superadministrador vía **SMTP**.

### GIFs del Sistema

- **Vista principal:** Un mapa interactivo en 3D con las noticias distribuidas geográficamente. Los usuarios pueden aplicar filtros por categoría y búsqueda.
  ![Vista principal](https://url.del.giff/vista-principal.gif)

- **Registro y Aprobación:** El administrador solicita acceso a la plataforma, el superadministrador aprueba o rechaza su solicitud.
  ![Registro y Aprobación](https://url.del.giff/registro-aprobacion.gif)

- **CRUD del Administrador:** Los administradores gestionan las noticias mediante un sistema CRUD.
  ![CRUD del Administrador](https://url.del.giff/crud-admin.gif)

## Cómo ejecutar el proyecto

Para correr el proyecto, abre dos terminales y ejecuta lo siguiente:

### Terminal 1 (Frontend)
cd frontend

npm install

npm run dev


### Terminal 2 (Backend)
cd backend

npm install

npm run dev


## Nuevo

Se ha implementado una nueva forma más robusta de registrar administradores. A continuación se proporcionan las credenciales de acceso:

**Correo:**  
gsuareza3@unemi.edu.ec

**Contraseña:**  
gsuareza3

