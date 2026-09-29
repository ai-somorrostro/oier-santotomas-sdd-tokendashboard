# Design

## Context

El proyecto requiere un dashboard web para comparar 10 modelos de IA a partir de `mock-data.json`. Las restricciones arquitectónicas exigen JavaScript Vanilla nativo, HTML5 semántico y CSS moderno sin dependencias externas (cero frameworks y librerías). Además, el desarrollo debe respetar un flujo estricto de Git Feature Branching (`feature1`, `feature2`, `feature3` sobre `develop`), con validación funcional realizada mediante inspección rigurosa de código fuente (sin lanzar navegadores automatizados) y sincronización total del repositorio con GitHub.

## Goals / Non-Goals

**Goals:**
- Implementar una arquitectura ligera, modular y mantenible con tres archivos principales: `index.html`, `styles.css` y `app.js`.
- Gestión de estado local reactiva para filtros combinados (texto y modalidades) y ordenación multidireccional de columnas.
- Renderizado de visualizaciones mediante **SVG nativo** (`<svg>` con `viewBox` responsive), permitiendo gráficos nítidos y tooltips interactivos sin librerías externas.
- Vista de detalle extendida en modal accesible (cierre con botón, tecla `Escape` o clic en backdrop, desglose de métricas y gráfico individual).
- Formato claro de métricas monetarias (mostrando coste por token y coste proyectado por millón de tokens `$/1M` para facilitar la comprensión).
- Cumplimiento del flujo de Git: commits atómicos en ramas en español, merges secuenciales en `develop` y merge final en `main`.

**Non-Goals:**
- No se utilizarán librerías externas (ni Tailwind, ni Bootstrap, ni Chart.js, ni D3.js).
- No se crearán pruebas automatizadas end-to-end con Chrome ni navegadores headless.
- No se requiere persistencia en base de datos ni backend dinámico (carga de datos exclusivamente desde `mock-data.json`).

## Decisions

### 1. Motor de Gráficas: SVG Nativo sobre Canvas
* **Decisión:** Usar elementos SVG vectoriales nativos para las gráficas comparativas y de detalle.
* **Justificación:** SVG se integra de manera natural en el árbol DOM, responde fluidamente al diseño responsive mediante `viewBox`, y permite aplicar estilos CSS, animaciones de entrada y pseudo-clases `:hover` para mostrar tooltips informativos con mucha mayor facilidad y nitidez que un Canvas 2D sin librerías.

### 2. Estructura Modular de JavaScript (`app.js`)
* **Decisión:** Organizar el código JavaScript en módulos de responsabilidad única:
  - `dataService`: Carga de `mock-data.json` y preparación de datos.
  - `stateManager`: Almacenamiento del estado global (criterio de ordenación actual, término de búsqueda, filtros de modalidad y modelo activo).
  - `tableRenderer`: Renderizado dinámico de filas y cabeceras con indicadores de orden (`▲` / `▼`).
  - `chartRenderer`: Generación dinámica de elementos SVG para barras de precios y sparklines de consumo.
  - `modalController`: Apertura, actualización de contenido y cierre del modal de detalle.

### 3. Normalización y Formato de Métricas
* **Decisión:** Calcular y formatear los costes tanto en valor por token exacto como en coste por millón de tokens (`$/1M tokens`), ya que los valores decimales pequeños (ej. `0.00000023`) son difíciles de comparar a simple vista. Los consumos de tokens se formatearán con separadores de miles y sufijos (ej. `4.2M tokens`).

### 4. Estrategia de Ramas en Git
* **Decisión:** Respetar la nomenclatura y orden secuencial:
  - `develop` como rama de integración.
  - `feature1`: Estructura base + tabla + ordenación y filtros.
  - `feature2`: Sección visual con comparativa de precios y consumo SVG.
  - `feature3`: Modal de detalle extendido con gráficas individuales.
  - Validación completa por revisión de código en `develop` antes del merge a `main`.

## Risks / Trade-offs

- **Cálculo manual de escalas SVG:** Al no usar Chart.js, el cálculo de alturas relativas, coordenadas `x`, `y` y ejes debe hacerse matemáticamente en JS. *Mitigación:* Se implementará una función auxiliar matemática reutilizable (`normalizeScale(value, min, max, targetHeight)`).
- **Validación sin navegador Chrome:** Dado que no se abrirá Chrome para inspección visual, la verificación dependerá de una exhaustiva comprobación estática del código, coherencia de selectores DOM y validación de tipos de datos. *Mitigación:* Escribir código defensivo, validar nulos y comprobar el flujo completo de eventos en `app.js`.
