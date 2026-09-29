# Tasks

## 1. Preparación de la Rama Base en Develop

- [x] 1.1 Configurar la rama `develop` asegurando `README.md` y `mock-data.json`, y verificar el estado limpio del repositorio con `git status`
- [x] 1.2 Inicializar la estructura base de archivos (`index.html`, `styles.css`, `app.js`) y verificar que no se añadan dependencias externas

## 2. Feature 1 – Ordenación y Filtros (Rama `feature1`)

- [x] 2.1 Crear la rama `feature1` a partir de `develop` y verificar con `git branch`
- [x] 2.2 Implementar la carga asíncrona de `mock-data.json` y el renderizado inicial de la tabla con los 10 modelos y formato de métricas, verificando la estructura de datos en el código
- [x] 2.3 Implementar la ordenación interactiva bidireccional por columnas (ascendente / descendente al hacer clic en cabeceras), verificando la lógica de ordenación numérica y alfabética en `app.js`
- [x] 2.4 Implementar los filtros dinámicos (búsqueda en tiempo real por nombre de modelo y selectores de modalidad de entrada y salida), verificando la función de filtrado combinado en el código
- [x] 2.5 Realizar commit en `feature1`, hacer merge a la rama `develop` y verificar el historial limpio con `git log`

## 3. Feature 2 – Gráficas y Visualizaciones (Rama `feature2`)

- [x] 3.1 Crear la rama `feature2` a partir de `develop` actualizado y verificar con `git branch`
- [x] 3.2 Desarrollar el gráfico de barras nativo en SVG para comparar precios de token de entrada y salida de los 10 modelos, verificando los cálculos matemáticos de escala y dimensiones en el código
- [x] 3.3 Desarrollar las visualizaciones nativas de consumo de tokens (diario y semanal) con barras y sparklines en SVG, verificando los elementos y datos generados
- [ ] 3.4 Realizar commit en `feature2`, hacer merge a la rama `develop` y verificar la integración en `develop` con `git log`

## 4. Feature 3 – Vista de Detalle (Rama `feature3`)

- [ ] 4.1 Crear la rama `feature3` a partir de `develop` actualizado y verificar con `git branch`
- [ ] 4.2 Desarrollar el modal de detalle accesible activado al pulsar cualquier fila de la tabla (con soporte para tecla Escape, botón de cierre y clic fuera), verificando los listeners de eventos en el código
- [ ] 4.3 Implementar el panel de métricas extendidas y la gráfica individual SVG de consumo para el modelo seleccionado, verificando la reactividad en el código
- [ ] 4.4 Realizar commit en `feature3`, hacer merge a la rama `develop` y verificar la integración en `develop` con `git log`

## 5. Validación de Código, Integración en Main y Subida a GitHub

- [ ] 5.1 En la rama `develop`, realizar una auditoría estática exhaustiva de código (`index.html`, `styles.css`, `app.js`) comprobando sintaxis, selectores del DOM y manejo de errores sin ejecutar Chrome
- [ ] 5.2 Fusionar la rama `develop` en `main` y verificar la integridad de las ramas con `git branch` y `git log`
- [ ] 5.3 Asegurar que la carpeta `openspec/` y todos los archivos del proyecto estén versionados y realizar push de las ramas al repositorio remoto de GitHub (`origin`)
