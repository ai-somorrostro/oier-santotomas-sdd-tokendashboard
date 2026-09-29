# Proposal

## Why

El equipo de diseño y desarrollo necesita una herramienta centralizada e interactiva para comparar modelos de lenguaje de código abierto evaluados internamente. Actualmente, la información sobre precios (input/output), latencias (TTFT) y consumo de tokens está dispersa, lo que dificulta la toma rápida de decisiones.

## What Changes

Se implementará un dashboard web moderno, sin dependencias externas (HTML5, CSS y JavaScript Vanilla nativo), que cargue los datos desde `mock-data.json` y se desarrolle de forma incremental mediante tres ramas secuenciales:

- **Feature 1 (`feature1`):** Tabla interactiva con métricas clave de 10 modelos de IA, soporte de ordenación bidireccional por cualquier columna (ascendente/descendente) y filtros reactivos por nombre de modelo y modalidades de entrada/salida.
- **Feature 2 (`feature2`):** Panel superior de visualización con gráficos nativos en SVG o Canvas (comparativa de costes por token de entrada y salida entre los 10 modelos, y barras/sparklines de consumo de tokens diario y semanal).
- **Feature 3 (`feature3`):** Modal o panel lateral de detalle por modelo, abierto al hacer clic en cualquier fila de la tabla, con el desglose completo de métricas y gráficos individuales nativos de consumo.
- **Integración y Flujo Git:** Flujo estricto de Feature Branching con ramas en español (`feature1`, `feature2`, `feature3`), integración secuencial en `develop`, validación funcional por revisión directa de código y merge final en `main`. Todo el código y la carpeta `openspec/` serán versionados y subidos al repositorio remoto en GitHub.

## Capabilities

### New Capabilities
- `model-benchmark-dashboard`: Capacidades del dashboard interactivo para comparar modelos de IA, incluyendo carga de datos de prueba (`mock-data.json`), tabla ordenable y filtrable, gráficos nativos y vista de detalle extendida.

### Modified Capabilities
<!-- None -->

## Impact

- **Código:** Creación de `index.html`, `styles.css` y `app.js` en el raíz del repositorio.
- **Dependencias:** Ninguna (cero librerías externas o frameworks; sin Chart.js ni Tailwind).
- **Control de Versiones:** Ramas `develop`, `feature1`, `feature2`, `feature3` y `main` en Git.
- **Repositorio Remoto:** Sincronización completa con `origin` (`https://github.com/ai-somorrostro/oier-santotomas-sdd-tokendashboard.git`), incluyendo `openspec/`.
