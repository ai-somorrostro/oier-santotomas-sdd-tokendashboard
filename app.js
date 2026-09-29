/**
 * AI Model Benchmark Dashboard
 * Vanilla JavaScript (Zero external dependencies)
 * Feature 1: Carga, Tabla, Ordenación y Filtros
 */

(function () {
  'use strict';

  // Estado de la aplicación
  const state = {
    allModels: [],
    filteredModels: [],
    searchTerm: '',
    selectedInputModality: 'all',
    selectedOutputModality: 'all',
    sortColumn: null,
    sortDirection: 'asc' // 'asc' | 'desc'
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
    // KPIs
    kpiTotalModels: document.getElementById('kpi-total-models'),
    kpiAvgTtft: document.getElementById('kpi-avg-ttft'),
    kpiFastestModel: document.getElementById('kpi-fastest-model'),
    kpiFastestTtft: document.getElementById('kpi-fastest-ttft'),
    kpiTotalTokensWeek: document.getElementById('kpi-total-tokens-week')
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
      state.allModels = data.map(model => ({
        ...model,
        totalTokensDay: model.inputTokensDay + model.outputTokensDay,
        totalTokensWeek: model.inputTokensWeek + model.outputTokensWeek,
        inputPricePer1M: model.inputPricePerToken * 1000000,
        outputPricePer1M: model.outputPricePerToken * 1000000
      }));

      // Renderizar KPIs globales
      renderKpis(state.allModels);

      // Configurar listeners de interacción
      setupEventListeners();

      // Aplicar filtros iniciales y renderizar tabla
      applyFiltersAndSort();

      console.log('Datos cargados exitosamente:', state.allModels.length, 'modelos.');
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
          // Si ya está ordenando por esta columna, alterna dirección
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          // Nueva columna, ordenar ascendente por defecto
          state.sortColumn = column;
          state.sortDirection = 'asc';
        }

        updateSortHeadersVisual();
        applyFiltersAndSort();
      });
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

        // Manejo especial de columnas calculadas o numéricas
        if (typeof valA === 'string') {
          const comp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
          return state.sortDirection === 'asc' ? comp : -comp;
        } else {
          // Numérico
          if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    state.filteredModels = result;
    renderTable(state.filteredModels);
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

      // Formateo de precios por 1M
      const inputPrice1M = `$${(model.inputPricePerToken * 1000000).toFixed(2)}`;
      const outputPrice1M = `$${(model.outputPricePerToken * 1000000).toFixed(2)}`;

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
    renderTable
  };
})();
