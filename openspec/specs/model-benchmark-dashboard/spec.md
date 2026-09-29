# model-benchmark-dashboard Specification

## Purpose

Proporciona un dashboard interactivo completo para la comparación visual, ordenación, filtrado y análisis detallado de modelos de lenguaje de inteligencia artificial utilizando datos de prueba locales y tecnologías web nativas.

## Requirements

### Requirement: Carga y Renderizado de Datos de Modelos
El sistema SHALL cargar los datos de los modelos desde el archivo `mock-data.json` mediante la API estándar `fetch` y renderizar una tabla con los 10 modelos y sus métricas principales (nombre, precio por token de entrada y salida, latencia TTFT, modalidades y consumo de tokens).

#### Scenario: Carga inicial de datos
- **WHEN** el usuario carga la aplicación en el navegador
- **THEN** la aplicación solicita `mock-data.json`, procesa los 10 registros y los muestra en la tabla comparativa sin errores

### Requirement: Ordenación Interactiva por Columnas
El sistema SHALL permitir ordenar la tabla por cualquier columna al hacer clic en su cabecera correspondiente, alternando de manera cíclica entre orden ascendente y descendente, e indicando visualmente el estado de ordenación.

#### Scenario: Alternar orden ascendente y descendente
- **WHEN** el usuario hace clic en la cabecera de una columna (ej. TTFT o Precio de Entrada)
- **THEN** las filas de la tabla se reordenan según los valores de esa columna en orden ascendente; al hacer clic nuevamente se invierte el orden a descendente

### Requirement: Filtrado Dinámico de Modelos
El sistema SHALL proporcionar controles interactivos para filtrar las filas visibles de la tabla en tiempo real por el nombre del modelo y por las modalidades de entrada y salida.

#### Scenario: Filtrado reactivo por nombre
- **WHEN** el usuario escribe en el campo de búsqueda por nombre
- **THEN** la tabla muestra únicamente los modelos cuyo nombre coincida con el texto ingresado, sin distinguir mayúsculas de minúsculas

#### Scenario: Filtrado por modalidad
- **WHEN** el usuario selecciona una modalidad de entrada o salida específica en los selectores
- **THEN** la tabla filtra y muestra solo los modelos que satisfacen las modalidades seleccionadas

### Requirement: Visualizaciones y Gráficas Nativas
El sistema SHALL presentar una sección visual con gráficos implementados exclusivamente mediante Canvas API o elementos SVG nativos (sin librerías externas), comparando precios de entrada y salida de los 10 modelos y mostrando el consumo de tokens a nivel diario y semanal.

#### Scenario: Comparativa de precios de entrada y salida
- **WHEN** se visualiza la sección de gráficas
- **THEN** se renderiza un gráfico de barras nativo que compara los costes de input y output por token de los 10 modelos

#### Scenario: Representación del consumo de tokens
- **WHEN** se cargan los datos de uso del equipo
- **THEN** se representan métricas y gráficos de barras/sparklines con el consumo de tokens de entrada y salida a nivel diario y semanal

### Requirement: Vista de Detalle Extendido por Modelo
El sistema SHALL permitir abrir una vista de detalle (modal o panel lateral emergente) al hacer clic en cualquier fila de la tabla, mostrando todas las métricas en formato extendido y gráficas nativas individuales específicas del modelo seleccionado.

#### Scenario: Apertura del modal al hacer clic en una fila
- **WHEN** el usuario hace clic en una fila de la tabla de modelos
- **THEN** se abre el panel de detalle con el nombre del modelo, métricas completas y su gráfica individual correspondiente

#### Scenario: Cierre de la vista de detalle
- **WHEN** el usuario pulsa el botón de cierre, la tecla Escape o hace clic fuera del contenido modal
- **THEN** la vista de detalle se cierra y vuelve a la vista principal de la tabla

### Requirement: Flujo de Ramas y Sincronización en Git
El repositorio SHALL mantener la separación secuencial de ramas en español (`develop`, `feature1`, `feature2`, `feature3` y `main`), registrar commits atómicos y sincronizar todas las ramas y la carpeta `openspec/` con el repositorio remoto en GitHub.

#### Scenario: Integración secuencial en develop
- **WHEN** se completa cada feature (`feature1`, `feature2`, `feature3`)
- **THEN** se fusiona de manera limpia en la rama `develop` antes de iniciar la siguiente rama
