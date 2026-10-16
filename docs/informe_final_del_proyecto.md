# SIEMPRE CERCA: PLATAFORMA WEB COLABORATIVA DE GEOLOCALIZACIÓN PARA LA BÚSQUEDA ACELERADA DE PERSONAS Y MASCOTAS DESAPARECIDAS

**Facultad de Ingeniería**  
**Carrera de Ingeniería de Sistemas e Informática**  
**Universidad Tecnológica del Perú (UTP)**  

* **Integrantes:**
  * Willian Zdenko Jorkaef Torres Paredes
  * David Alexander Sáenz Desposorio
  * Yoshi Mochizaki Guimaray Eduardo Mariano
* **Docente:** Mg. Ing. Tapia Jacinto Victor Hugo  
* **Ubicación y Fecha:** Chimbote, Perú 2026  

---

## ÍNDICE
1. [Título del Proyecto y Justificación](#1-título-del-proyecto-y-justificación)
2. [Resumen y Descripción del Problema](#2-resumen-y-descripción-del-problema)
3. [Implementación y Funcionalidad](#3-implementación-y-funcionalidad)
4. [Metodología de Gestión del Proyecto: ScrumBan](#4-metodología-de-gestión-del-proyecto-scrumban)
5. [Fundamentación de la Solución](#5-fundamentación-de-la-solución)
6. [Alcance](#6-alcance)
7. [Capturas del Prototipo](#7-capturas-del-prototipo)

---

## 1. TÍTULO DEL PROYECTO Y JUSTIFICACIÓN

### Título
**“SIEMPRE CERCA: PLATAFORMA WEB COLABORATIVA DE GEOLOCALIZACIÓN PARA LA BÚSQUEDA ACELERADA DE PERSONAS Y MASCOTAS DESAPARECIDAS”**

### Justificación del título
El nombre comercial **«Siempre Cerca»** sintetiza el propósito central del sistema: reducir la brecha espacio-temporal entre la comunidad y la persona o mascota extraviada, garantizando que el canal de auxilio y la red de respuesta comunitaria estén permanentemente al alcance del usuario desde el navegador de su computadora, tableta o celular, sin necesidad de instalar nada.

El título técnico que acompaña a la marca refleja los tres ejes de la propuesta:
1. La naturaleza colaborativa de la plataforma.
2. La incorporación de geolocalización (mapa interactivo y alertas por cercanía).
3. La aceleración de la búsqueda mediante la publicación y moderación rápida de alertas.

Se eligió el formato web porque es accesible desde cualquier dispositivo con navegador, se comparte con un simple enlace por WhatsApp o redes sociales, y reduce el costo y el tiempo de desarrollo para un equipo de tres personas.

---

## 2. RESUMEN Y DESCRIPCIÓN DEL PROBLEMA

### Contexto del problema
En los últimos años, la desaparición de personas y el extravío de mascotas se han consolidado como problemáticas sociales de alto impacto emocional y de seguridad pública en nuestras comunidades. Según estadísticas de autoridades competentes, las primeras 24 a 48 horas representan el rango temporal crítico —conocido como **«las horas doradas»**— para lograr un hallazgo exitoso.

Sin embargo, los mecanismos de difusión actuales operan de manera desarticulada y pasiva:
* **Alertas estatales tradicionales:** presentan procesos burocráticos que retrasan la emisión inmediata de avisos.
* **Afiches impresos y redes sociales:** generan una dispersión ineficiente de la información: carecen de geolocalización exacta, no permiten el rastreo en tiempo real, pierden vigencia rápidamente en el feed y no ofrecen mecanismos para validar la veracidad.

### Impacto actual de la problemática
* **Pérdida de tiempo crítico:** reportes que circulan tarde o alejados de la zona de extravío.
* **Saturación por fake news:** falta de moderación que provoca proliferación de datos falsos.
* **Falta de coordinación comunitaria:** esfuerzos duplicados e ineficiencia en el rastreo en campo.
* **Ausencia de métricas y trazabilidad:** imposibilidad de medir tiempos de respuesta o identificar patrones.

### Comparativo: Canales tradicionales vs. Siempre Cerca

| Criterio | Afiches / Redes Sociales | Siempre Cerca |
| :--- | :--- | :--- |
| **Alcance geográfico** | Genérico, sin filtro por cercanía real | Radio de proximidad configurable (geocercas) |
| **Velocidad de difusión** | Depende de compartidos manuales | Notificación push automática en segundos |
| **Verificación de datos** | Nula o informal | Filtro inicial + validación con GPS y foto |
| **Vigencia de la alerta** | Se pierde en el feed en horas | Persiste activa hasta el cierre del caso |
| **Coordinación de búsqueda**| Inexistente, esfuerzos duplicados | Cuadrantes revisados y roles definidos |

### Solución propuesta y ventajas
La aplicación web **Siempre Cerca** propone una transformación tecnológica convirtiendo la difusión pasiva en una red activa de respuesta en tiempo real mediante:
* **Inmediatez y precisión geográfica:** uso de GPS, mapas interactivos y alertas inteligentes a usuarios cercanos.
* **Trazabilidad y validación de datos:** mecanismos de verificación inicial y módulo de avistamientos provisto de coordenadas GPS y foto en vivo.
* **Organización eficiente:** mapas de calor y control de cuadrillas de búsqueda.
* **Centralización:** unificación de historiales y actualización de estados (*En búsqueda* / *Localizado*).

---

## 3. IMPLEMENTACIÓN Y FUNCIONALIDAD

### Levantamiento de requerimientos

#### Requerimientos Funcionales (RF)
* **RF01 - Registro y Autenticación:** Permitir el registro de usuarios mediante validación de identidad.
* **RF02 - Registro del Caso:** Permitir la creación de un perfil detallado (fotos, rasgos, vestimenta, fecha/hora y ubicación).
* **RF03 - Generación de Alerta Geolocalizada:** Emitir notificaciones push instantáneas a usuarios activos dentro del radio geográfico establecido.
* **RF04 - Mapa Interactivo:** Interfaz con visualización de marcadores y mapas de calor.
* **RF05 - Reporte de Avistamientos:** Envío de avisos con fotografía, coordenadas GPS automáticas y comentarios.
* **RF06 - Módulo de Coordinación:** Puntos de encuentro y marcado de cuadrantes inspeccionados.

#### Requerimientos No Funcionales (RNF)
* **RNF01 - Disponibilidad:** Garantizar 99.5% de disponibilidad.
* **RNF02 - Tiempo de Respuesta:** Notificaciones push entregadas en menos de 5 segundos.
* **RNF03 - Seguridad y Privacidad:** Encriptación de datos sensibles y cumplimiento de normativas de protección de datos.
* **RNF04 - Usabilidad:** Interfaz intuitiva (UI/UX) optimizada para situaciones de emergencia.
* **RNF05 - Escalabilidad:** Soporte para picos de concurrencia durante alertas masivas.

### Historias de Usuario
1. **Historia 1 (Dueño / Usuario Nuevo):** Como familiar/dueño, quiero registrarme rápidamente y crear la ficha del caso con fotos y posición exacta, para emitir la alerta sin perder minutos vitales.
2. **Historia 2 (Dueño / Usuario Existente):** Como usuario registrado, quiero gestionar mi caso, recibir alertas directas de avistamientos y cambiar el estado a "Localizado", para mantener a la comunidad informada.
3. **Historia 3 (Colaborador / Ciudadano Voluntario):** Como ciudadano, quiero recibir alertas por cercanía y enviar reportes fotográficos de avistamientos con un toque, para aportar datos verificados.
4. **Historia 4 (Administrador / Moderador):** Como moderador, quiero revisar reportes sospechosos y desactivar publicaciones falsas, para garantizar la confiabilidad de la información.

### Roles
* **Usuario Familiar / Dueño:** Emisor y gestor de la alerta.
* **Usuario Colaborador / Voluntario:** Comunidad activa que reporta avistamientos y revisa zonas.
* **Administrador / Moderador:** Validador de reportes y asegurador de la calidad de información.

### Definición de la Organización
Se adopta un modelo de organización **Ágil** (Alta Autonomía + Alta Alineación), donde el equipo de 3 integrantes toma decisiones rápidas manteniendo como eje común el *Product Backlog* priorizado.

#### Escalamiento (Modelo Squad):
* **Squad:** Un único equipo multifuncional de 3 integrantes.
* **Tribu / Chapter / Guild:** Definidos dentro del documento como referencias para la escalabilidad futura del proyecto.

### Planning Poker
Las estimaciones de esfuerzo se realizaron mediante Planning Poker en la ceremonia de refinamiento, utilizando la escala Fibonacci modificada (`0, ½, 1, 2, 3, 5, 8, 13, 21, ∞, ?, 🍸`).

### Product Backlog

| ID | Historia / Requerimiento | Prioridad | Puntos | Sprint |
| :--- | :--- | :---: | :---: | :---: |
| **PB01** | Registro de usuarios e inicio de sesión seguro | Alta | 3 | Sprint 1 |
| **PB02** | Módulo de creación y publicación de ficha de búsqueda | Alta | 5 | Sprint 1 |
| **PB03** | Integración del mapa interactivo con marcadores | Alta | 8 | Sprint 2 |
| **PB04** | Sistema de notificaciones push por geocercas (*Geofencing*) | Alta | 8 | Sprint 2 |
| **PB05** | Módulo de envío/recepción de avistamientos (Fotos + GPS) | Alta | 5 | Sprint 2 |
| **PB06** | Panel de moderación de seguridad y filtro anti-falsas alertas | Media | 5 | Sprint 3 |
| **PB07** | Módulo de organización de brigadas y marcado de cuadrantes | Media | 8 | Sprint 3 |
| **PB08** | Historial, actualización de estados e indicadores | Baja | 3 | Sprint 4 |

* **Total del Backlog:** 45 Puntos de Historia (8 semanas / 4 Sprints).

---

## 4. METODOLOGÍA DE GESTIÓN DEL PROYECTO: SCRUMBAN

Se seleccionó **ScrumBan** al ser un marco híbrido que aporta la previsibilidad de Scrum (Sprints de 2 semanas) y el control de flujo visual de Kanban (límites WIP).

### Estructura del Tablero ScrumBan

| Columna del Tablero | Límite WIP | Criterio de la Columna |
| :--- | :---: | :--- |
| **Backlog del Sprint** | — | Historias comprometidas para el Sprint activo. |
| **Por Hacer (To Do)** | 5 | Tareas desglosadas listas para iniciar. |
| **En Progreso (In Progress)** | 3 | Máximo una tarea activa por integrante. |
| **En Revisión / Testing** | 3 | Code review cruzado y pruebas funcionales. |
| **Hecho (Done)** | — | Tarea aceptada e integrada según la DoD. |

### Planificación de Sprints
* **Sprint 1 (S1-S2):** Base conceptual, autenticación (PB01) y creación de fichas (PB02).
* **Sprint 2 (S3-S4):** Lógica geoespacial, mapa (PB03), geocercas (PB04) y avistamientos (PB05).
* **Sprint 3 (S5-S6):** Panel de moderación (PB06) y organización de cuadrantes (PB07).
* **Sprint 4 (S7-S8):** Historial, métricas comunitarias (PB08) y estabilización final.

---

## 5. FUNDAMENTACIÓN DE LA SOLUCIÓN

### Stack Tecnológico
* **Frontend:** HTML5, CSS3, JavaScript / React (Web Responsiva).
* **Mapas:** Leaflet + OpenStreetMap.
* **Backend:** Node.js + Express.
* **Base de Datos:** PostgreSQL (con PostGIS o consultas Haversine).
* **Control de Versiones:** Git / GitHub (GitFlow).

---

## 6. ALCANCE

* **Alcance Geográfico:** Piloto inicial en **Chimbote y Nuevo Chimbote** (Provincia del Santa, Áncash). Proyección posterior a nivel provincial, regional y nacional.
* **Alcance Funcional:** Registro, publicaciones, mapa interactivo, avistamientos, cuadrillas y panel admin. *(Excluye pagos, app nativa, SMS pagados y reemplazo de denuncias policiales).*
* **Avance Esperado:**
  * Sprint 1: 17.8% (8 pts)
  * Sprint 2: 64.4% (29 pts)
  * Sprint 3: 93.3% (42 pts)
  * Sprint 4: 100% (45 pts)

---

## 7. CAPTURAS DEL PROTOTIPO

Las imágenes de la interfaz web y móvil del sistema se encuentran referenciadas en la documentación de diseño del proyecto en los prototipos interactivos.