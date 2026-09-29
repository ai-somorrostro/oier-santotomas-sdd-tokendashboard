/**
 * AI Model Benchmark Dashboard
 * Vanilla JavaScript (Zero external dependencies)
 * Feature 1: Carga, Tabla, Ordenación y Filtros
 * Feature 2: Visualizaciones y Gráficas Nativas SVG
 * Feature 3: Vista de Detalle Extendido con Modal y Gráficas Individuales
 */

(function () {
  'use strict';

  // Espacio de nombres SVG
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Estado de la aplicación
  const state = {
    allModels: [],
    filteredModels: [],
    searchTerm: '',
    selectedInputModality: 'all',
    selectedOutputModality: 'all',
    sortColumn: null,
    sortDirection: 'asc', // 'asc' | 'desc'
    selectedModel: null
  };

  // Referencias a elementos del DOM
  const elements = {
    tableBody: document.getElementById('models-table-body'),
    tableHeaders: document.querySelectorAll('#benchmark-table th.sortable'),
    searchInput: document.getElementById('filter-search-name'),
    inputModalitySelect: document.getElementById('filter-input-modality'),
    outputModalitySelect: document.getElementById('filter-output-modality'),
    resetBtn: document.getElementById('btn-reset-filters'),
    noResultsMsg: document.getElementById('no-results-message'),
    // Gráficas SVG
    priceChartSvg: document.getElementById('price-bar-chart'),
    usageChartSvg: document.getElementById('usage-bar-chart'),
    // KPIs
    kpiTotalModels: document.getElementById('kpi-total-models'),
    kpiAvgTtft: document.getElementById('kpi-avg-ttft'),
    kpiFastestModel: document.getElementById('kpi-fastest-model'),
    kpiFastestTtft: document.getElementById('kpi-fastest-ttft'),
    kpiTotalTokensWeek: document.getElementById('kpi-total-tokens-week'),
    // Feature 3: Modal de detalle
    detailModal: document.getElementById('detail-modal'),
    modalTitle: document.getElementById('modal-model-title'),
    modalBody: document.getElementById('modal-model-body'),
    modalCloseBtn: document.getElementById('modal-close-btn')
  };

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  async function initApp() {
    try {
      const response = await fetch('mock-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Enriquecer datos con cálculos derivados
      state.allModels = data.map(model => {
        const totalTokensDay = model.inputTokensDay + model.outputTokensDay;
        const totalTokensWeek = model.inputTokensWeek + model.outputTokensWeek;
        const dailyCost = (model.inputTokensDay * model.inputPricePerToken) + (model.outputTokensDay * model.outputPricePerToken);
        const weeklyCost = (model.inputTokensWeek * model.inputPricePerToken) + (model.outputTokensWeek * model.outputPricePerToken);
        
        return {
          ...model,
          totalTokensDay,
          totalTokensWeek,
          dailyCost,
          weeklyCost,
          inputPricePer1M: model.inputPricePerToken * 1000000,
          outputPricePer1M: model.outputPricePerToken * 1000000
        };
      });

      // Renderizar KPIs globales
      renderKpis(state.allModels);

      // Configurar listeners de interacción
      setupEventListeners();

      // Aplicar filtros iniciales, renderizar tabla y gráficas
      applyFiltersAndSort();

      console.log('Dashboard cargado exitosamente:', state.allModels.length, 'modelos.');
    } catch (error) {
      console.error('Error cargando mock-data.json:', error);
      if (elements.tableBody) {
        elements.tableBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; color: var(--color-danger); padding: 2rem;">
              Error al cargar los datos de los modelos (${error.message}). Por favor verifica mock-data.json.
            </td>
          </tr>
        `;
      }
    }
  }

  // Renderizar KPIs globales
  function renderKpis(models) {
    if (!models || models.length === 0) return;

    if (elements.kpiTotalModels) elements.kpiTotalModels.textContent = models.length;

    const totalTtft = models.reduce((acc, m) => acc + m.ttft_ms, 0);
    const avgTtft = Math.round(totalTtft / models.length);
    if (elements.kpiAvgTtft) elements.kpiAvgTtft.textContent = `${avgTtft} ms`;

    // Modelo más rápido (menor TTFT)
    const fastest = [...models].sort((a, b) => a.ttft_ms - b.ttft_ms)[0];
    if (fastest) {
      if (elements.kpiFastestModel) elements.kpiFastestModel.textContent = fastest.name;
      if (elements.kpiFastestTtft) elements.kpiFastestTtft.textContent = `${fastest.ttft_ms} ms TTFT`;
    }

    // Total tokens semana
    const totalWeeklyTokens = models.reduce((acc, m) => acc + m.totalTokensWeek, 0);
    if (elements.kpiTotalTokensWeek) elements.kpiTotalTokensWeek.textContent = formatCompactNumber(totalWeeklyTokens);
  }

  // Configurar listeners
  function setupEventListeners() {
    // Filtro de texto (reactivo en tiempo real)
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Filtros de modalidad
    if (elements.inputModalitySelect) {
      elements.inputModalitySelect.addEventListener('change', (e) => {
        state.selectedInputModality = e.target.value;
        applyFiltersAndSort();
      });
    }

    if (elements.outputModalitySelect) {
      elements.outputModalitySelect.addEventListener('change', (e) => {
        state.selectedOutputModality = e.target.value;
        applyFiltersAndSort();
      });
    }

    // Botón de restablecer filtros
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', () => {
        state.searchTerm = '';
        state.selectedInputModality = 'all';
        state.selectedOutputModality = 'all';
        state.sortColumn = null;
        state.sortDirection = 'asc';

        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.inputModalitySelect) elements.inputModalitySelect.value = 'all';
        if (elements.outputModalitySelect) elements.outputModalitySelect.value = 'all';

        updateSortHeadersVisual();
        applyFiltersAndSort();
      });
    }

    // Ordenación por cabeceras de columnas
    elements.tableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const column = th.getAttribute('data-column');
        if (!column) return;

        if (state.sortColumn === column) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = column;
          state.sortDirection = 'asc';
        }

        updateSortHeadersVisual();
        applyFiltersAndSort();
      });
    });

    // Feature 3: Apertura de modal al hacer clic en fila de la tabla
    if (elements.tableBody) {
      elements.tableBody.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const modelName = tr.getAttribute('data-model-name');
        const model = state.allModels.find(m => m.name === modelName);
        if (model) {
          openDetailModal(model);
        }
      });
    }

    // Feature 3: Cierre de modal por botón
    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener('click', () => {
        closeDetailModal();
      });
    }

    // Feature 3: Cierre de modal al hacer clic fuera (en el backdrop)
    if (elements.detailModal) {
      elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) {
          closeDetailModal();
        }
      });
    }

    // Feature 3: Cierre de modal con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.detailModal && !elements.detailModal.classList.contains('hidden')) {
        closeDetailModal();
      }
    });
  }

  // Actualizar indicadores visuales de ordenación en las cabeceras
  function updateSortHeadersVisual() {
    elements.tableHeaders.forEach(th => {
      const col = th.getAttribute('data-column');
      const indicator = th.querySelector('.sort-indicator');

      th.classList.remove('sorted-asc', 'sorted-desc');

      if (col === state.sortColumn) {
        if (state.sortDirection === 'asc') {
          th.classList.add('sorted-asc');
          if (indicator) indicator.textContent = '▲';
        } else {
          th.classList.add('sorted-desc');
          if (indicator) indicator.textContent = '▼';
        }
      } else {
        if (indicator) indicator.textContent = '↕';
      }
    });
  }

  // Filtrado y ordenación combinados
  function applyFiltersAndSort() {
    let result = [...state.allModels];

    // 1. Filtrar por término de búsqueda (nombre)
    if (state.searchTerm.trim() !== '') {
      const term = state.searchTerm.toLowerCase().trim();
      result = result.filter(m => m.name.toLowerCase().includes(term));
    }

    // 2. Filtrar por modalidad de entrada
    if (state.selectedInputModality !== 'all') {
      result = result.filter(m => m.inputModality === state.selectedInputModality);
    }

    // 3. Filtrar por modalidad de salida
    if (state.selectedOutputModality !== 'all') {
      result = result.filter(m => m.outputModality === state.selectedOutputModality);
    }

    // 4. Ordenación
    if (state.sortColumn) {
      result.sort((a, b) => {
        let valA = a[state.sortColumn];
        let valB = b[state.sortColumn];

        if (typeof valA === 'string') {
          const comp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
          return state.sortDirection === 'asc' ? comp : -comp;
        } else {
          if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    state.filteredModels = result;
    renderTable(state.filteredModels);
    renderCharts(state.filteredModels.length > 0 ? state.filteredModels : state.allModels);
  }

  // Renderizar filas de la tabla
  function renderTable(models) {
    if (!elements.tableBody) return;

    elements.tableBody.innerHTML = '';

    if (models.length === 0) {
      if (elements.noResultsMsg) elements.noResultsMsg.classList.remove('hidden');
      return;
    }

    if (elements.noResultsMsg) elements.noResultsMsg.classList.add('hidden');

    models.forEach(model => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-model-name', model.name);
      tr.setAttribute('title', 'Haz clic para ver métricas y gráficas extendidas');

      // Formateo de precios por 1M
      const inputPrice1M = `$${model.inputPricePer1M.toFixed(2)}`;
      const outputPrice1M = `$${model.outputPricePer1M.toFixed(2)}`;

      // TTFT color badge
      let ttftClass = 'ttft-medium';
      if (model.ttft_ms < 250) ttftClass = 'ttft-fast';
      else if (model.ttft_ms > 400) ttftClass = 'ttft-slow';

      // Modality badge styling
      const isInputMultimodal = model.inputModality.includes('Image');

      tr.innerHTML = `
        <td>
          <div class="model-name-cell">
            <span>${escapeHtml(model.name)}</span>
          </div>
        </td>
        <td class="text-right">
          <span style="font-family: monospace; font-weight: 600;">${inputPrice1M}</span>
        </td>
        <td class="text-right">
          <span style="font-family: monospace; font-weight: 600;">${outputPrice1M}</span>
        </td>
        <td class="text-right ttft-cell ${ttftClass}">
          ${model.ttft_ms} ms
        </td>
        <td>
          <span class="modality-badge ${isInputMultimodal ? 'multimodal' : ''}">
            ${escapeHtml(model.inputModality)}
          </span>
        </td>
        <td>
          <span class="modality-badge">
            ${escapeHtml(model.outputModality)}
          </span>
        </td>
        <td class="text-right">
          ${formatCompactNumber(model.inputTokensDay)}
        </td>
        <td class="text-right">
          ${formatCompactNumber(model.outputTokensDay)}
        </td>
        <td class="text-right" style="font-weight: 600; color: var(--color-primary);">
          ${formatCompactNumber(model.totalTokensWeek)}
        </td>
      `;

      elements.tableBody.appendChild(tr);
    });
  }

  // ============================================================
  // Feature 2: Renderizado de Gráficas Nativas en SVG
  // ============================================================

  function renderCharts(models) {
    if (!models || models.length === 0) return;
    renderPriceChart(models);
    renderUsageChart(models);
  }

  // Gráfica 1: Precios de Entrada y Salida (Bar Chart agrupado SVG)
  function renderPriceChart(models) {
    const svg = elements.priceChartSvg;
    if (!svg) return;
    svg.innerHTML = '';

    const width = 720;
    const height = 280;
    const padding = { top: 25, right: 20, bottom: 65, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxValRaw = Math.max(...models.map(m => Math.max(m.inputPricePer1M, m.outputPricePer1M)));
    const maxVal = Math.max(0.5, Math.ceil(maxValRaw * 1.15 * 10) / 10);

    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const val = (maxVal / ticks) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;

      const line = createSvgElement('line', {
        x1: padding.left,
        y1: y,
        x2: padding.left + chartW,
        y2: y,
        stroke: 'var(--border-subtle)',
        'stroke-width': '1',
        'stroke-dasharray': i === 0 ? 'none' : '3 3'
      });
      svg.appendChild(line);

      const text = createSvgElement('text', {
        x: padding.left - 8,
        y: y + 4,
        fill: 'var(--text-dim)',
        'font-size': '11',
        'text-anchor': 'end',
        'font-family': 'monospace'
      });
      text.textContent = `$${val.toFixed(2)}`;
      svg.appendChild(text);
    }

    const count = models.length;
    const bandW = chartW / count;
    const barW = Math.max(6, Math.min(18, (bandW - 12) / 2));
    const barGap = 3;

    models.forEach((model, idx) => {
      const groupCenterX = padding.left + (idx * bandW) + (bandW / 2);
      const inputBarX = groupCenterX - barW - (barGap / 2);
      const outputBarX = groupCenterX + (barGap / 2);

      const inputH = Math.max(2, (model.inputPricePer1M / maxVal) * chartH);
      const outputH = Math.max(2, (model.outputPricePer1M / maxVal) * chartH);

      const inputY = padding.top + chartH - inputH;
      const outputY = padding.top + chartH - outputH;

      // Barra Input
      const rectIn = createSvgElement('rect', {
        x: inputBarX,
        y: inputY,
        width: barW,
        height: inputH,
        rx: 3,
        fill: 'var(--color-input-chart)',
        class: 'chart-bar-hover'
      });
      const titleIn = createSvgElement('title');
      titleIn.textContent = `${model.name} (Entrada): $${model.inputPricePer1M.toFixed(2)} / 1M tokens`;
      rectIn.appendChild(titleIn);
      svg.appendChild(rectIn);

      // Barra Output
      const rectOut = createSvgElement('rect', {
        x: outputBarX,
        y: outputY,
        width: barW,
        height: outputH,
        rx: 3,
        fill: 'var(--color-output-chart)',
        class: 'chart-bar-hover'
      });
      const titleOut = createSvgElement('title');
      titleOut.textContent = `${model.name} (Salida): $${model.outputPricePer1M.toFixed(2)} / 1M tokens`;
      rectOut.appendChild(titleOut);
      svg.appendChild(rectOut);

      // Etiqueta del modelo en el eje X
      const labelText = createSvgElement('text', {
        x: groupCenterX,
        y: padding.top + chartH + 18,
        fill: 'var(--text-muted)',
        'font-size': count > 8 ? '9.5' : '11',
        'text-anchor': 'end',
        transform: `rotate(-35, ${groupCenterX}, ${padding.top + chartH + 18})`
      });
      labelText.textContent = shortenModelName(model.name);
      svg.appendChild(labelText);
    });
  }

  // Gráfica 2: Consumo de Tokens Diario vs Semanal (Bar Chart SVG)
  function renderUsageChart(models) {
    const svg = elements.usageChartSvg;
    if (!svg) return;
    svg.innerHTML = '';

    const width = 720;
    const height = 280;
    const padding = { top: 25, right: 20, bottom: 65, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxValRaw = Math.max(...models.map(m => m.totalTokensWeek));
    const maxVal = Math.ceil(maxValRaw * 1.15 / 5000000) * 5000000;

    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const val = (maxVal / ticks) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;

      const line = createSvgElement('line', {
        x1: padding.left,
        y1: y,
        x2: padding.left + chartW,
        y2: y,
        stroke: 'var(--border-subtle)',
        'stroke-width': '1',
        'stroke-dasharray': i === 0 ? 'none' : '3 3'
      });
      svg.appendChild(line);

      const text = createSvgElement('text', {
        x: padding.left - 8,
        y: y + 4,
        fill: 'var(--text-dim)',
        'font-size': '11',
        'text-anchor': 'end',
        'font-family': 'monospace'
      });
      text.textContent = formatCompactNumber(val);
      svg.appendChild(text);
    }

    const count = models.length;
    const bandW = chartW / count;
    const barW = Math.max(6, Math.min(18, (bandW - 12) / 2));
    const barGap = 3;

    models.forEach((model, idx) => {
      const groupCenterX = padding.left + (idx * bandW) + (bandW / 2);
      const dailyBarX = groupCenterX - barW - (barGap / 2);
      const weeklyBarX = groupCenterX + (barGap / 2);

      const dailyH = Math.max(2, (model.totalTokensDay / maxVal) * chartH);
      const weeklyH = Math.max(2, (model.totalTokensWeek / maxVal) * chartH);

      const dailyY = padding.top + chartH - dailyH;
      const weeklyY = padding.top + chartH - weeklyH;

      // Barra Diario
      const rectDaily = createSvgElement('rect', {
        x: dailyBarX,
        y: dailyY,
        width: barW,
        height: dailyH,
        rx: 3,
        fill: 'var(--color-daily-chart)',
        class: 'chart-bar-hover'
      });
      const titleDaily = createSvgElement('title');
      titleDaily.textContent = `${model.name}\nConsumo Diario: ${formatCompactNumber(model.totalTokensDay)} tokens (${model.totalTokensDay.toLocaleString()} tokens)`;
      rectDaily.appendChild(titleDaily);
      svg.appendChild(rectDaily);

      // Barra Semanal
      const rectWeekly = createSvgElement('rect', {
        x: weeklyBarX,
        y: weeklyY,
        width: barW,
        height: weeklyH,
        rx: 3,
        fill: 'var(--color-weekly-chart)',
        class: 'chart-bar-hover'
      });
      const titleWeekly = createSvgElement('title');
      titleWeekly.textContent = `${model.name}\nConsumo Semanal: ${formatCompactNumber(model.totalTokensWeek)} tokens (${model.totalTokensWeek.toLocaleString()} tokens)`;
      rectWeekly.appendChild(titleWeekly);
      svg.appendChild(rectWeekly);

      // Etiqueta del modelo en el eje X
      const labelText = createSvgElement('text', {
        x: groupCenterX,
        y: padding.top + chartH + 18,
        fill: 'var(--text-muted)',
        'font-size': count > 8 ? '9.5' : '11',
        'text-anchor': 'end',
        transform: `rotate(-35, ${groupCenterX}, ${padding.top + chartH + 18})`
      });
      labelText.textContent = shortenModelName(model.name);
      svg.appendChild(labelText);
    });
  }

  // ============================================================
  // Feature 3: Vista de Detalle Extendido (Modal y Gráficas Nativas)
  // ============================================================

  function openDetailModal(model) {
    if (!elements.detailModal || !elements.modalTitle || !elements.modalBody) return;

    state.selectedModel = model;
    elements.modalTitle.textContent = model.name;

    const priceRatio = (model.outputPricePerToken / model.inputPricePerToken).toFixed(1);
    const speedRating = model.ttft_ms < 250 ? 'Excelente (Ultra Rápido)' : (model.ttft_ms <= 400 ? 'Bueno (Estándar)' : 'Alto (Razonamiento / Complejo)');

    elements.modalBody.innerHTML = `
      <div class="detail-metrics-grid">
        <div class="detail-metric-card">
          <div class="label">Precio Entrada (Input)</div>
          <div class="val" style="color: var(--color-primary);">$${model.inputPricePer1M.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal;">/ 1M</span></div>
          <div class="raw-val">$${model.inputPricePerToken.toFixed(8)} por token</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Precio Salida (Output)</div>
          <div class="val" style="color: var(--color-output-chart);">$${model.outputPricePer1M.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal;">/ 1M</span></div>
          <div class="raw-val">$${model.outputPricePerToken.toFixed(8)} por token (${priceRatio}x ratio)</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Latencia (TTFT)</div>
          <div class="val">${model.ttft_ms} ms</div>
          <div class="raw-val" style="color: ${model.ttft_ms < 250 ? 'var(--color-success)' : (model.ttft_ms > 400 ? 'var(--color-danger)' : 'var(--color-warning)')}; font-weight: 600;">${speedRating}</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Modalidades de Soporte</div>
          <div class="val" style="font-size: 1.05rem;">In: ${escapeHtml(model.inputModality)}</div>
          <div class="raw-val">Out: ${escapeHtml(model.outputModality)}</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Consumo Diario del Equipo</div>
          <div class="val" style="color: var(--color-daily-chart);">${formatCompactNumber(model.totalTokensDay)} tokens</div>
          <div class="raw-val">In: ${model.inputTokensDay.toLocaleString()} | Out: ${model.outputTokensDay.toLocaleString()}</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Consumo Semanal del Equipo</div>
          <div class="val" style="color: var(--color-weekly-chart);">${formatCompactNumber(model.totalTokensWeek)} tokens</div>
          <div class="raw-val">In: ${model.inputTokensWeek.toLocaleString()} | Out: ${model.outputTokensWeek.toLocaleString()}</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Coste Estimado Diario</div>
          <div class="val">$${model.dailyCost.toFixed(2)}</div>
          <div class="raw-val">Basado en consumo real del día</div>
        </div>

        <div class="detail-metric-card">
          <div class="label">Coste Estimado Semanal</div>
          <div class="val" style="color: var(--color-warning);">$${model.weeklyCost.toFixed(2)}</div>
          <div class="raw-val">Basado en consumo real semanal</div>
        </div>
      </div>

      <div class="modal-chart-box">
        <h4>Desglose de Consumo Individual: Entrada vs Salida (Diario y Semanal)</h4>
        <div class="chart-legend" style="margin-bottom: 0.75rem;">
          <span class="legend-item"><span class="legend-dot color-input"></span> Entrada</span>
          <span class="legend-item"><span class="legend-dot color-output"></span> Salida</span>
        </div>
        <div class="chart-canvas-container">
          <svg id="modal-individual-chart" class="native-svg-chart" viewBox="0 0 680 200" preserveAspectRatio="xMidYMid meet" aria-label="Gráfica individual de consumo del modelo"></svg>
        </div>
      </div>
    `;

    // Renderizar la gráfica específica del modelo en el modal
    renderModalModelChart(model);

    // Mostrar modal y bloquear scroll de fondo
    elements.detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    if (!elements.detailModal) return;
    elements.detailModal.classList.add('hidden');
    document.body.style.overflow = '';
    state.selectedModel = null;
  }

  // Gráfica nativa individual específica del modelo seleccionado
  function renderModalModelChart(model) {
    const svg = document.getElementById('modal-individual-chart');
    if (!svg) return;
    svg.innerHTML = '';

    const width = 680;
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Métricas a comparar para este modelo
    const items = [
      { label: 'Diario In', tokens: model.inputTokensDay, color: 'var(--color-input-chart)' },
      { label: 'Diario Out', tokens: model.outputTokensDay, color: 'var(--color-output-chart)' },
      { label: 'Semanal In', tokens: model.inputTokensWeek, color: 'var(--color-input-chart)' },
      { label: 'Semanal Out', tokens: model.outputTokensWeek, color: 'var(--color-output-chart)' }
    ];

    const maxTokens = Math.max(...items.map(i => i.tokens));
    const maxVal = Math.ceil(maxTokens * 1.15 / 1000000) * 1000000;

    // Eje Y y líneas de cuadrícula
    const ticks = 3;
    for (let i = 0; i <= ticks; i++) {
      const val = (maxVal / ticks) * i;
      const y = padding.top + chartH - (val / maxVal) * chartH;

      const line = createSvgElement('line', {
        x1: padding.left,
        y1: y,
        x2: padding.left + chartW,
        y2: y,
        stroke: 'var(--border-subtle)',
        'stroke-width': '1',
        'stroke-dasharray': i === 0 ? 'none' : '3 3'
      });
      svg.appendChild(line);

      const text = createSvgElement('text', {
        x: padding.left - 8,
        y: y + 4,
        fill: 'var(--text-dim)',
        'font-size': '10.5',
        'text-anchor': 'end',
        'font-family': 'monospace'
      });
      text.textContent = formatCompactNumber(val);
      svg.appendChild(text);
    }

    // Dibujar barras individuales
    const count = items.length;
    const bandW = chartW / count;
    const barW = Math.min(60, bandW - 30);

    items.forEach((item, idx) => {
      const barX = padding.left + (idx * bandW) + (bandW - barW) / 2;
      const barH = Math.max(3, (item.tokens / maxVal) * chartH);
      const barY = padding.top + chartH - barH;

      const rect = createSvgElement('rect', {
        x: barX,
        y: barY,
        width: barW,
        height: barH,
        rx: 4,
        fill: item.color,
        class: 'chart-bar-hover'
      });
      const title = createSvgElement('title');
      title.textContent = `${item.label}: ${item.tokens.toLocaleString()} tokens (${formatCompactNumber(item.tokens)})`;
      rect.appendChild(title);
      svg.appendChild(rect);

      // Texto de valor arriba de la barra
      const valText = createSvgElement('text', {
        x: barX + barW / 2,
        y: barY - 6,
        fill: 'var(--text-main)',
        'font-size': '11',
        'font-weight': '600',
        'text-anchor': 'middle'
      });
      valText.textContent = formatCompactNumber(item.tokens);
      svg.appendChild(valText);

      // Etiqueta debajo del eje X
      const labelText = createSvgElement('text', {
        x: barX + barW / 2,
        y: padding.top + chartH + 20,
        fill: 'var(--text-muted)',
        'font-size': '11',
        'text-anchor': 'middle'
      });
      labelText.textContent = item.label;
      svg.appendChild(labelText);
    });
  }

  // Ayudante para crear elementos SVG
  function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  }

  function shortenModelName(name) {
    if (!name) return '';
    return name
      .replace('DeepSeek', 'DS')
      .replace('Mistral', 'Mistral')
      .replace('Small', 'Sm');
  }

  // Utilidades auxiliares
  function formatCompactNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Exponer estado y funciones al objeto global para testing/inspección
  window._benchmarkApp = {
    state,
    applyFiltersAndSort,
    renderTable,
    renderCharts,
    openDetailModal,
    closeDetailModal
  };
})();
