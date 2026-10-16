# Siempre Cerca

Red comunitaria que reduce el tiempo de respuesta ante el extravío de una persona o mascota en **Lima, Perú**. Proyecto universitario — Avance 1.

## ¿Qué es?

- Publicar alertas de personas o mascotas perdidas
- Ver un mapa con los casos activos cerca de ti
- Reportar avistamientos y unirse a búsquedas en equipo
- Comunidad local con sistema de notificaciones

> ⚠️ **No sustituye a la Policía Nacional (105)** ni a otros servicios de emergencia.

## Cómo ejecutar

Los módulos ES **no funcionan** abriendo `index.html` con doble clic (`file://`). Necesitas un servidor local:

### Opción A — VS Code Live Server (recomendado)
1. Instala la extensión **Live Server** en VS Code
2. Clic derecho en `index.html` → *Open with Live Server*

### Opción B — npx serve
```bash
npx serve .
```
Abre `http://localhost:3000` en el navegador.

### Opción C — Python
```bash
python -m http.server 8080
```
Abre `http://localhost:8080`.

## Estructura de carpetas

```
siempre-cerca/
├── index.html              # SPA única; el router inyecta el contenido en #app
├── css/
│   ├── tokens.css          # Variables de color, tipografía y sombras
│   ├── base.css            # Reset, tipografía y contenedor principal
│   ├── components.css      # Botones, inputs, chips, nav, logo, avatar
│   ├── auth.css            # Bienvenida, registro, login y recuperación
│   ├── home.css            # Mapa, filtros y hoja inferior de casos
│   ├── create-case.css     # Crear alerta (4 pasos)
│   ├── case-review.css     # Revisión de la alerta
│   ├── case-detail.css     # Detalle del caso
│   ├── case-actions.css    # Avistamiento y caso resuelto
│   ├── sidebar.css         # Menú de usuario en la barra lateral
│   ├── admin.css           # Panel de administración: estructura y tarjetas
│   ├── admin-tables.css    # Panel de administración: tablas, filtros y detalle
│   ├── community.css       # Comunidad, voluntarios y notificaciones
│   ├── profile.css         # Perfil y sub-pantallas
│   └── responsive.css      # Tablet (≥768px) y laptop (≥1100px)
├── js/
│   ├── app.js              # Punto de entrada: inicializa estado y router
│   ├── router.js           # Enrutador SPA por hash con importación dinámica
│   ├── state.js            # Estado global: sesión, ubicación, listeners
│   ├── config.js           # Constantes: USE_API, coordenadas Lima, storage keys
│   ├── services/           # Interfaz usada por las pantallas (auth, cases, …)
│   ├── adapters/
│   │   ├── local/          # Implementación con localStorage (Avance 1)
│   │   └── http/           # Stubs vacíos para la API (Avance 2)
│   ├── data/seed.js        # Datos de ejemplo en Lima (se puede borrar)
│   ├── screens/            # Un archivo JS por pantalla: render() + mount()
│   ├── ui/                 # Componentes: nav, icons, map, toast, modal
│   └── utils/              # validators, mask, format, image, geo, crypto
├── assets/                 # Imágenes y recursos estáticos
├── server/                 # Vacío (se llena en Avance 2 con Express)
├── docs/                   # Documentación del equipo
└── design_reference/       # Prototipo CSS y capturas de pantalla
```

## Documentación del equipo

- [`docs/PROYECTO.md`](docs/PROYECTO.md) — Alcance, rutas y estructura
- [`docs/DISENO.md`](docs/DISENO.md) — Sistema de diseño y responsivo
- [`docs/DATOS.md`](docs/DATOS.md) — Cómo se guardan los datos hoy y en Avance 2
- [`docs/CONVENCIONES.md`](docs/CONVENCIONES.md) — Organización y normas de código
- [`docs/LOCALIZACION_PERU.md`](docs/LOCALIZACION_PERU.md) — Mapa, teléfonos y emergencias
- [`docs/GUIA_DEL_EQUIPO.md`](docs/GUIA_DEL_EQUIPO.md) — Guía práctica para el equipo

## Tecnologías

| Herramienta | Uso |
|---|---|
| HTML5 + CSS3 + ES Modules | Stack principal, sin frameworks ni compilación |
| Leaflet + OpenStreetMap | Mapa interactivo gratuito |
| Nominatim | Búsqueda de direcciones (gratuito, con moderación) |
| `navigator.geolocation` | Ubicación del usuario |
| `localStorage` | Datos locales en Avance 1 |
| MongoDB Atlas (Avance 2) | Base de datos en la nube (plan gratuito) |

## Estado del proyecto

Ver [`docs/ESTADO.md`](docs/ESTADO.md) para el avance pantalla por pantalla.
