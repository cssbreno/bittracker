// Configurações globais do Chart.js
if (typeof Chart !== "undefined") {
  Chart.defaults.font.family = "'VT323', monospace";
  Chart.defaults.color = "#e0e0e0";
  Chart.defaults.borderColor = "#555";
}

// =================================================================================
//  API E DADOS GLOBAIS
// =================================================================================
const RAWG_API_KEY = "92e544747b904b379eb345316a331d72"; // <-- COLOQUE SUA CHAVE DA API RAWG.IO AQUI

const gameCategories = [
  "Ação",
  "Aventura",
  "RPG",
  "Estratégia",
  "Simulação",
  "Esportes",
  "Corrida",
  "Quebra-Cabeça",
  "Luta",
  "Tiro",
  "Plataforma",
  "Sobrevivência",
  "Horror",
  "Mundo Aberto",
  "Stealth",
  "MMORPG",
  "Roguelike",
  "Metroidvania",
  "Soulslike",
  "Construção",
  "Sandbox",
  "Ritmo",
  "Visual Novel",
  "Educacional",
  "Indie",
];

const gameSubcategories = [
  "Primeira Pessoa (FPS)",
  "Terceira Pessoa (TPS)",
  "Hack and Slash",
  "Beat 'em up",
  "Point-and-Click",
  "Exploração",
  "RPG de Ação",
  "JRPG",
  "CRPG",
  "Tático",
  "RTS (Tempo Real)",
  "TBS (Turnos)",
  "Tower Defense",
  "4X",
  "Gerenciamento",
  "Vida Virtual",
  "Futebol",
  "Basquete",
  "Arcade",
  "Simulador de Corrida",
  "Puzzle-Platformer",
  "Lógica",
  "Horror Psicológico",
  "Survival Horror",
  "Crafting",
  "Battle Royale",
  "Dungeon Crawler",
  "Card Game",
  "Party Game",
];

const gamePlatforms = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "PSP",
  "PS Vita",
  "Xbox Series X/S",
  "Xbox One",
  "Xbox 360",
  "Nintendo Switch",
  "Wii U",
  "Wii",
  "Nintendo 3DS",
  "Android",
  "iOS",
  "macOS",
  "Linux",
  "Steam Deck",
];

// =================================================================================
//  CLASSE DE VALIDAÇÃO DE FORMULÁRIOS
// =================================================================================
class FormValidator {
  static validateForm(formId, rules) {
    const form = document.getElementById(formId);
    let isValid = true;
    this.clearErrors(form);

    for (const [fieldId, fieldRules] of Object.entries(rules)) {
      const field = document.getElementById(fieldId);
      if (!field && fieldId !== "rating") continue; // Tratamento especial para rating

      let fieldValue;
      if (fieldId === "rating") {
        fieldValue = form.querySelector('input[name="rating"]:checked')?.value;
      } else if (field.classList.contains("searchable-dropdown-hidden-input")) {
        fieldValue = field.value.trim();
      } else {
        fieldValue = field.value.trim();
      }

      for (const rule of fieldRules) {
        if (!this.validateField(field, fieldValue, rule, fieldId)) {
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }

  static validateField(field, value, rule, fieldId) {
    let isValid = true;
    let errorMessage = "";

    switch (rule.type) {
      case "required":
        if (!value || value === "") {
          isValid = false;
          errorMessage = rule.message || "Este campo é obrigatório";
        }
        break;
      case "minLength":
        if (value && value.length < rule.value) {
          isValid = false;
          errorMessage = rule.message || `Mínimo de ${rule.value} caracteres`;
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage, fieldId);
    }
    return isValid;
  }

  static showFieldError(field, message, fieldId) {
    const errorId = fieldId + "-error";
    const errorElement = document.getElementById(errorId);

    let fieldContainer = field;
    if (fieldId === "rating") {
      fieldContainer = document.querySelector(".star-rating");
    } else {
      fieldContainer = field.closest(".searchable-dropdown") || field;
    }

    fieldContainer?.classList.add("error");

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  static clearErrors(form) {
    form
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
    form
      .querySelectorAll(".field-error.show")
      .forEach((el) => el.classList.remove("show"));
  }
}

// =================================================================================
//  CLASSE PRINCIPAL: GameManager
// =================================================================================
class GameManager {
  constructor() {
    this.state = {
      queroJogar: [],
      zerados: [],
      desistidos: [],
    };
    this.charts = { interesse: null, nota: null, motivo: null };
    this.currentTab = "tabQueroJogar";
    this.apiDebounceTimer = null;
    this.init();
  }

  init() {
    this.loadData();
    this.createCharts();
    this.setupSearchableDropdowns();
    this.renderTables();
    this.switchTab("tabQueroJogar");
    this.bindEvents();
    this.addFadeInAnimation();
  }

  // --- Persistência e Animações ---
  saveData() {
    try {
      localStorage.setItem("gameTrackerState", JSON.stringify(this.state));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }

  loadData() {
    try {
      const savedData = localStorage.getItem("gameTrackerState");
      if (savedData) this.state = JSON.parse(savedData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.state = { queroJogar: [], zerados: [], desistidos: [] };
    }
  }

  addFadeInAnimation() {
    const elements = document.querySelectorAll(
      ".section-title, .pixel-btn, .table-container"
    );
    elements.forEach((el, index) => {
      setTimeout(() => el.classList.add("fade-in"), index * 100);
    });
  }

  // --- Gráficos ---
  createCharts() {
    if (typeof Chart === "undefined") return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 14 } } } },
      animation: { duration: 1000, easing: "easeOutQuart" },
    };

    const interesseCtx = document
      .getElementById("interesseChart")
      ?.getContext("2d");
    if (interesseCtx) {
      this.charts.interesse = new Chart(interesseCtx, {
        type: "doughnut",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ["#be123c", "#eab308", "#16a34a"],
              borderColor: "#2c2c2c",
              borderWidth: 4,
            },
          ],
        },
        options: commonOptions,
      });
    }

    const notaCtx = document.getElementById("notaChart")?.getContext("2d");
    if (notaCtx) {
      this.charts.nota = new Chart(notaCtx, {
        type: "bar",
        data: {
          labels: ["★", "★★", "★★★", "★★★★", "★★★★★"],
          datasets: [
            { label: "Nº de Jogos", data: [], backgroundColor: "#16a34a" },
          ],
        },
        options: {
          ...commonOptions,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      });
    }

    const motivoCtx = document.getElementById("motivoChart")?.getContext("2d");
    if (motivoCtx) {
      this.charts.motivo = new Chart(motivoCtx, {
        type: "pie",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [
                "#be123c",
                "#9f1239",
                "#881337",
                "#7f1d1d",
                "#6b21a8",
              ],
              borderColor: "#2c2c2c",
              borderWidth: 4,
            },
          ],
        },
        options: {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            legend: { labels: { font: { size: 12 } } },
          },
        },
      });
    }
  }

  updateCharts() {
    if (this.charts.interesse) {
      const interesseCount = this.state.queroJogar.reduce(
        (acc, game) => {
          acc[game.interesse] = (acc[game.interesse] || 0) + 1;
          return acc;
        },
        { Baixo: 0, Médio: 0, Alto: 0 }
      );
      this.charts.interesse.data.labels = Object.keys(interesseCount);
      this.charts.interesse.data.datasets[0].data =
        Object.values(interesseCount);
      this.charts.interesse.update();
    }
    if (this.charts.nota) {
      const notaCount = this.state.zerados.reduce(
        (acc, game) => {
          if (game.nota) acc[game.nota - 1]++;
          return acc;
        },
        [0, 0, 0, 0, 0]
      );
      this.charts.nota.data.datasets[0].data = notaCount;
      this.charts.nota.update();
    }
    if (this.charts.motivo) {
      const motivoCount = this.state.desistidos.reduce((acc, game) => {
        acc[game.motivo] = (acc[game.motivo] || 0) + 1;
        return acc;
      }, {});
      this.charts.motivo.data.labels = Object.keys(motivoCount);
      this.charts.motivo.data.datasets[0].data = Object.values(motivoCount);
      this.charts.motivo.update();
    }
  }

  // --- Renderização ---
  renderTables() {
    this.renderTable("queroJogar", "tableQueroJogar", [
      "nome",
      "categoria",
      "dataLancamento",
      "interesse",
      "plataformas",
      "status",
    ]);
    this.renderTable("zerados", "tableZerados", [
      "nome",
      "categoria",
      "nota",
      "plataforma",
      "tempoGasto",
    ]);
    this.renderTable("desistidos", "tableDesistidos", [
      "nome",
      "categoria",
      "motivo",
      "tempoGameplay",
      "observacoes",
    ]);
    this.updateCharts();
  }

  renderTable(stateKey, tableId, columns) {
    const table = document.getElementById(tableId);
    const tbody = table?.querySelector("tbody");
    const emptyStateEl = document.getElementById(
      `empty${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}`
    );
    if (!tbody || !emptyStateEl) return;
    tbody.innerHTML = "";
    if (this.state[stateKey].length === 0) {
      emptyStateEl.style.display = "block";
      table.style.display = "none";
    } else {
      emptyStateEl.style.display = "none";
      table.style.display = "table";
      this.state[stateKey].forEach((item, index) => {
        const tr = document.createElement("tr");
        const cellsHTML = columns
          .map((col) => {
            let value = item[col] || "";
            if (col === "nota") {
              return `<td class="text-yellow-400 text-2xl">${
                "★".repeat(item.nota || 0) + "☆".repeat(5 - (item.nota || 0))
              }</td>`;
            }
            if (typeof value === "string" && value.length > 30) {
              value = value.substring(0, 30) + "...";
            }
            return `<td title="${item[col] || ""}">${value}</td>`;
          })
          .join("");
        tr.innerHTML = cellsHTML;
        const actionsCell = document.createElement("td");

        const viewBtn = document.createElement("button");
        viewBtn.className = "action-btn view";
        viewBtn.innerHTML = "👁️";
        viewBtn.title = "Visualizar";
        viewBtn.addEventListener("click", () =>
          this.openViewModal(stateKey, item.id)
        );

        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit";
        editBtn.innerHTML = "✏️";
        editBtn.title = "Editar";
        editBtn.addEventListener("click", () => {
          const modalId = `modal${
            stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
          }`;
          this.openModal(modalId, item.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.title = "Excluir";
        deleteBtn.addEventListener("click", () =>
          this.deleteItem(stateKey, item.id, item.nome)
        );

        actionsCell.appendChild(viewBtn);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        tr.appendChild(actionsCell);
        tbody.appendChild(tr);
      });
    }
  }

  // --- Modals e UI ---
  openModal(modalId, itemId = null) {
    const modal = document.getElementById(modalId);
    const form = modal?.querySelector("form");
    if (!form) return;

    form.reset();
    FormValidator.clearErrors(form);

    form.querySelectorAll(".searchable-dropdown").forEach((dropdown) => {
      this.updateSearchableDropdown(dropdown, "");
    });

    const hiddenInput = form.querySelector('input[type="hidden"]');
    if (hiddenInput) hiddenInput.value = itemId || "";

    let item = {};
    if (itemId) {
      if (modalId === "modalQueroJogar")
        item = this.state.queroJogar.find((g) => g.id === itemId);
      if (modalId === "modalZerados")
        item = this.state.zerados.find((g) => g.id === itemId);
      if (modalId === "modalDesistidos")
        item = this.state.desistidos.find((g) => g.id === itemId);
    }

    Object.keys(item).forEach((key) => {
      const el =
        form.querySelector(
          `#${form.id.replace("form", "").toLowerCase().charAt(0)}j${
            key.charAt(0).toUpperCase() + key.slice(1)
          }`
        ) ||
        form.querySelector(
          `#${form.id.replace("form", "").toLowerCase().charAt(0)}${
            key.charAt(0).toUpperCase() + key.slice(1)
          }`
        );
      if (el) {
        if (el.classList.contains("searchable-dropdown-hidden-input")) {
          this.updateSearchableDropdown(
            el.closest(".searchable-dropdown"),
            item[key]
          );
        } else {
          el.value = item[key] || "";
        }
      }
    });

    if (modalId === "modalZerados") {
      const checkedStar = form.querySelector('input[name="rating"]:checked');
      if (checkedStar) checkedStar.checked = false;
      if (item.nota) {
        const starInput = form.querySelector(
          `input[name="rating"][value="${item.nota}"]`
        );
        if (starInput) starInput.checked = true;
      }
    }

    Object.entries({
      qjNome: item.nome,
      zNome: item.nome,
      dNome: item.nome,
      qjCategoria: item.categoria,
      zCategoria: item.categoria,
      dCategoria: item.categoria,
      qjSubcategoria: item.subcategoria,
      qjPlataformas: item.plataformas,
      zPlataforma: item.plataforma,
      qjDataLancamento: item.dataLancamento,
      zDataZerei: item.dataZerei,
      qjInteresse: item.interesse,
      qjStatus: item.status,
      qjTempoEstimado: item.tempoEstimado,
      zTempoGasto: item.tempoGasto,
      dTempoGameplay: item.tempoGameplay,
      qjObservacoes: item.observacoes,
      zAvaliacao: item.avaliacao,
      dObservacoes: item.observacoes,
      dMotivo: item.motivo,
    }).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) {
        if (el.classList.contains("searchable-dropdown-hidden-input")) {
          this.updateSearchableDropdown(
            el.closest(".searchable-dropdown"),
            value || ""
          );
        } else {
          el.value = value || "";
        }
      }
    });

    document.documentElement.classList.add("modal-open");
    modal.style.display = "block";
  }

  openViewModal(stateKey, itemId) {
    const modal = document.getElementById("modalView");
    const contentEl = document.getElementById("viewContent");
    if (!modal || !contentEl) return;

    const item = this.state[stateKey].find((i) => i.id === itemId);
    if (!item) {
      console.error("Item não encontrado para visualização:", itemId);
      return;
    }

    const labels = {
      nome: "Nome",
      categoria: "Categoria",
      subcategoria: "Subcategoria",
      dataLancamento: "Data de Lançamento",
      interesse: "Interesse",
      plataformas: "Plataformas",
      status: "Status",
      tempoEstimado: "Tempo Estimado (h)",
      observacoes: "Observações",
      nota: "Nota",
      plataforma: "Plataforma",
      tempoGasto: "Tempo Gasto (h)",
      dataZerei: "Data em que zerei",
      avaliacao: "Avaliação",
      motivo: "Motivo da Desistência",
      tempoGameplay: "Tempo de Gameplay (h)",
    };

    contentEl.innerHTML = "";

    for (const key in item) {
      if (Object.hasOwnProperty.call(item, key) && labels[key] && item[key]) {
        const p = document.createElement("p");
        let value = item[key];

        if (key === "nota") {
          value = "★".repeat(value || 0) + "☆".repeat(5 - (value || 0));
        }

        p.innerHTML = `<strong>${labels[key]}:</strong> <span>${value}</span>`;
        contentEl.appendChild(p);
      }
    }

    document.documentElement.classList.add("modal-open");
    modal.style.display = "block";
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.documentElement.classList.remove("modal-open");
    }
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast pixel-border toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  }

  showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    const messageEl = document.getElementById("confirmMessage");
    if (!modal || !messageEl) return;
    messageEl.textContent = message;

    document.documentElement.classList.add("modal-open");
    modal.style.display = "block";

    const yesBtn = document.getElementById("confirmBtnYes");
    const noBtn = document.getElementById("confirmBtnNo");
    const handleYes = () => {
      onConfirm();
      cleanup();
    };
    const handleNo = () => cleanup();
    const cleanup = () => {
      this.closeModal("confirmModal");
      yesBtn?.removeEventListener("click", handleYes);
      noBtn?.removeEventListener("click", handleNo);
    };
    yesBtn?.addEventListener("click", handleYes, { once: true });
    noBtn?.addEventListener("click", handleNo, { once: true });
  }

  // --- CRUD ---
  deleteItem(stateKey, itemId, itemName) {
    this.showConfirmModal(`Tem certeza que quer apagar "${itemName}"?`, () => {
      this.state[stateKey] = this.state[stateKey].filter(
        (item) => item.id !== itemId
      );
      this.saveData();
      this.renderTables();
      this.showToast(`"${itemName}" foi apagado.`, "error");
    });
  }

  getValidationRules() {
    return {
      queroJogar: {
        qjNome: [{ type: "required" }],
        qjInteresse: [{ type: "required" }],
      },
      zerados: {
        zNome: [{ type: "required" }],
        rating: [{ type: "required", message: "A nota é obrigatória." }],
      },
      desistidos: {
        dNome: [{ type: "required" }],
        dMotivo: [{ type: "required" }],
      },
    };
  }

  // --- Navegação ---
  switchTab(targetId) {
    if (this.currentTab === targetId) return;
    const currentTabContent = document.getElementById(this.currentTab);
    const targetTabContent = document.getElementById(targetId);
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .getElementById(`tabBtn${targetId.replace("tab", "")}`)
      ?.classList.add("active");
    if (currentTabContent) currentTabContent.classList.remove("active");
    if (targetTabContent) targetTabContent.classList.add("active");
    this.currentTab = targetId;
    setTimeout(() => this.updateCharts(), 100);
  }

  // --- Exportação ---
  exportToCsv(data, filename, headers) {
    if (!data || data.length === 0) {
      this.showToast("Não há dados para exportar.", "error");
      return;
    }

    const headerKeys = Object.keys(headers);
    const headerTitles = Object.values(headers);

    const escapeCsvCell = (cell) => {
      if (cell === null || cell === undefined) {
        return "";
      }
      const strCell = String(cell);
      if (
        strCell.includes(",") ||
        strCell.includes('"') ||
        strCell.includes("\n")
      ) {
        return `"${strCell.replace(/"/g, '""')}"`;
      }
      return strCell;
    };

    const csvRows = [
      headerTitles.join(","),
      ...data.map((row) =>
        headerKeys.map((key) => escapeCsvCell(row[key])).join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // --- Dropdown com Pesquisa e API ---
  createSearchableDropdown(
    containerId,
    options,
    placeholder,
    hiddenInputId,
    isMultiSelect = true
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const inputType = isMultiSelect ? "checkbox" : "radio";
    const inputName = `${hiddenInputId}-options`;

    container.innerHTML = `
      <div class="searchable-dropdown">
        <input type="hidden" id="${hiddenInputId}" class="searchable-dropdown-hidden-input">
        <div class="searchable-dropdown-display" tabindex="0">
          <span class="placeholder">${placeholder}</span>
        </div>
        <div class="searchable-dropdown-options">
          <input type="text" class="searchable-dropdown-search" placeholder="Pesquisar...">
          <ul>
            ${options
              .map(
                (opt) =>
                  `<li><label><input type="${inputType}" name="${inputName}" value="${opt}">${opt}</label></li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    `;

    const dropdown = container.querySelector(".searchable-dropdown");
    const display = dropdown.querySelector(".searchable-dropdown-display");
    const optionsPanel = dropdown.querySelector(".searchable-dropdown-options");
    const searchInput = dropdown.querySelector(".searchable-dropdown-search");
    const hiddenInput = dropdown.querySelector(
      ".searchable-dropdown-hidden-input"
    );
    const inputs = dropdown.querySelectorAll(`input[type="${inputType}"]`);
    const placeholderEl = display.querySelector(".placeholder");

    display.addEventListener("click", () => {
      const isVisible = optionsPanel.style.display === "block";
      document
        .querySelectorAll(".searchable-dropdown-options")
        .forEach((p) => (p.style.display = "none"));
      optionsPanel.style.display = isVisible ? "none" : "block";
    });

    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();
      dropdown
        .querySelectorAll(".searchable-dropdown-options li")
        .forEach((li) => {
          li.classList.toggle(
            "hidden",
            !li.textContent.toLowerCase().includes(filter)
          );
        });
    });

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        const selected = Array.from(inputs)
          .filter((i) => i.checked)
          .map((i) => i.value);
        this.updateSearchableDropdown(dropdown, selected.join(", "));
        if (!isMultiSelect) {
          optionsPanel.style.display = "none";
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) optionsPanel.style.display = "none";
    });
  }

  updateSearchableDropdown(dropdownElement, valueString) {
    const display = dropdownElement.querySelector(
      ".searchable-dropdown-display"
    );
    const hiddenInput = dropdownElement.querySelector(
      ".searchable-dropdown-hidden-input"
    );
    const placeholderEl = display.querySelector(".placeholder");
    const inputs = dropdownElement.querySelectorAll(
      `input[type="checkbox"], input[type="radio"]`
    );

    hiddenInput.value = valueString;
    const selectedValues = valueString ? valueString.split(", ") : [];

    inputs.forEach((input) => {
      input.checked = selectedValues.includes(input.value);
    });

    display.querySelectorAll(".item-tag").forEach((tag) => tag.remove());
    if (selectedValues.length > 0) {
      placeholderEl.style.display = "none";
      selectedValues.forEach((val) => {
        const tag = document.createElement("span");
        tag.className = "item-tag";
        tag.textContent = val;
        display.appendChild(tag);
      });
    } else {
      placeholderEl.style.display = "block";
    }
  }

  setupSearchableDropdowns() {
    this.createSearchableDropdown(
      "qjCategoria-container",
      gameCategories,
      "Selecione as categorias",
      "qjCategoria"
    );
    this.createSearchableDropdown(
      "qjSubcategoria-container",
      gameSubcategories,
      "Selecione as subcategorias",
      "qjSubcategoria"
    );
    this.createSearchableDropdown(
      "qjPlataformas-container",
      gamePlatforms,
      "Selecione as plataformas",
      "qjPlataformas"
    );

    this.createSearchableDropdown(
      "zCategoria-container",
      gameCategories,
      "Selecione as categorias",
      "zCategoria"
    );
    this.createSearchableDropdown(
      "zPlataforma-container",
      gamePlatforms,
      "Selecione as plataformas",
      "zPlataforma"
    );

    this.createSearchableDropdown(
      "dCategoria-container",
      gameCategories,
      "Selecione as categorias",
      "dCategoria"
    );
  }

  searchGamesAPI(event) {
    const input = event.target;
    const query = input.value.trim();
    const autocompleteContainer = input.parentElement.querySelector(
      ".autocomplete-results"
    );

    clearTimeout(this.apiDebounceTimer);
    autocompleteContainer.innerHTML = "";
    if (query.length < 3) return;
    autocompleteContainer.innerHTML = `<div class="loading">Buscando...</div>`;

    this.apiDebounceTimer = setTimeout(async () => {
      if (!RAWG_API_KEY || RAWG_API_KEY === "SUA_CHAVE_API_AQUI") {
        autocompleteContainer.innerHTML = `<div>Configure a chave da API!</div>`;
        return;
      }
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(
            query
          )}&page_size=5`
        );
        const data = await response.json();
        autocompleteContainer.innerHTML = "";
        if (data.results?.length > 0) {
          data.results.forEach((game) => {
            const div = document.createElement("div");
            div.textContent = game.name;
            div.addEventListener("click", () => {
              input.value = game.name;
              autocompleteContainer.innerHTML = "";
            });
            autocompleteContainer.appendChild(div);
          });
        } else {
          autocompleteContainer.innerHTML = `<div>Nenhum resultado.</div>`;
        }
      } catch (error) {
        autocompleteContainer.innerHTML = `<div>Erro ao buscar.</div>`;
      }
    }, 500);
  }

  // --- Event Listeners (COMPLETO) ---
  bindEvents() {
    // Abas
    document
      .getElementById("tabBtnQueroJogar")
      ?.addEventListener("click", () => this.switchTab("tabQueroJogar"));
    document
      .getElementById("tabBtnZerados")
      ?.addEventListener("click", () => this.switchTab("tabZerados"));
    document
      .getElementById("tabBtnDesistidos")
      ?.addEventListener("click", () => this.switchTab("tabDesistidos"));

    // Abrir Modals
    document
      .getElementById("addQueroJogarBtn")
      ?.addEventListener("click", () => this.openModal("modalQueroJogar"));
    document
      .getElementById("addZeradoBtn")
      ?.addEventListener("click", () => this.openModal("modalZerados"));
    document
      .getElementById("addDesistidoBtn")
      ?.addEventListener("click", () => this.openModal("modalDesistidos"));

    // Fechar Modals
    document.querySelectorAll(".modal-cancel-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.closeModal(e.target.closest(".modal").id)
      );
    });
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) this.closeModal(e.target.id);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal[style*='block']");
        if (openModal) this.closeModal(openModal.id);
      }
    });

    // Event Listeners para os botões de exportação
    document
      .getElementById("exportQueroJogarBtn")
      ?.addEventListener("click", () => {
        const headers = {
          nome: "Nome",
          categoria: "Categoria",
          subcategoria: "Subcategoria",
          dataLancamento: "Lançamento",
          interesse: "Interesse",
          plataformas: "Plataformas",
          status: "Status",
          tempoEstimado: "Tempo Estimado (h)",
          observacoes: "Observações",
        };
        this.exportToCsv(
          this.state.queroJogar,
          "lista_de_desejos.csv",
          headers
        );
      });
    document
      .getElementById("exportZeradosBtn")
      ?.addEventListener("click", () => {
        const headers = {
          nome: "Nome",
          categoria: "Categoria",
          nota: "Nota (1-5)",
          dataZerei: "Data Zerado",
          plataforma: "Plataforma",
          tempoGasto: "Tempo Gasto (h)",
          avaliacao: "Avaliação",
        };
        this.exportToCsv(this.state.zerados, "jogos_zerados.csv", headers);
      });
    document
      .getElementById("exportDesistidosBtn")
      ?.addEventListener("click", () => {
        const headers = {
          nome: "Nome",
          categoria: "Categoria",
          motivo: "Motivo",
          tempoGameplay: "Tempo Jogado (h)",
          observacoes: "Observações",
        };
        this.exportToCsv(
          this.state.desistidos,
          "jogos_desistidos.csv",
          headers
        );
      });

    // Autocomplete da API
    ["qjNome", "zNome", "dNome"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", (e) => this.searchGamesAPI(e));
        const autocompleteContainer = input.parentElement.querySelector(
          ".autocomplete-results"
        );
        document.addEventListener("click", (event) => {
          if (
            !input.contains(event.target) &&
            !autocompleteContainer.contains(event.target)
          ) {
            autocompleteContainer.innerHTML = "";
          }
        });
      }
    });

    // Submissão dos Formulários
    document
      .getElementById("formQueroJogar")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (
          !FormValidator.validateForm(
            "formQueroJogar",
            this.getValidationRules().queroJogar
          )
        )
          return;

        const id = document.getElementById("queroJogarId")?.value;
        const gameData = {
          id: id || Date.now().toString(),
          nome: document.getElementById("qjNome")?.value.trim(),
          categoria: document.getElementById("qjCategoria")?.value,
          subcategoria: document.getElementById("qjSubcategoria")?.value,
          dataLancamento: document.getElementById("qjDataLancamento")?.value,
          interesse: document.getElementById("qjInteresse")?.value,
          plataformas: document.getElementById("qjPlataformas")?.value,
          status: document.getElementById("qjStatus")?.value,
          tempoEstimado: document.getElementById("qjTempoEstimado")?.value,
          observacoes: document.getElementById("qjObservacoes")?.value.trim(),
        };

        if (id) {
          const index = this.state.queroJogar.findIndex((g) => g.id === id);
          if (index > -1) this.state.queroJogar[index] = gameData;
        } else {
          this.state.queroJogar.push(gameData);
        }

        this.saveData();
        this.renderTables();
        this.closeModal("modalQueroJogar");
        this.showToast(`"${gameData.nome}" foi salvo!`);
      });

    document.getElementById("formZerados")?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        !FormValidator.validateForm(
          "formZerados",
          this.getValidationRules().zerados
        )
      )
        return;

      const id = document.getElementById("zeradoId")?.value;
      const rating = e.target.querySelector('input[name="rating"]:checked');
      const gameData = {
        id: id || Date.now().toString(),
        nome: document.getElementById("zNome")?.value.trim(),
        categoria: document.getElementById("zCategoria")?.value,
        nota: rating ? parseInt(rating.value) : 0,
        dataZerei: document.getElementById("zDataZerei")?.value,
        plataforma: document.getElementById("zPlataforma")?.value,
        tempoGasto: document.getElementById("zTempoGasto")?.value,
        avaliacao: document.getElementById("zAvaliacao")?.value.trim(),
      };

      if (id) {
        const index = this.state.zerados.findIndex((g) => g.id === id);
        if (index > -1) this.state.zerados[index] = gameData;
      } else {
        this.state.zerados.push(gameData);
      }

      this.saveData();
      this.renderTables();
      this.closeModal("modalZerados");
      this.showToast(`"${gameData.nome}" foi salvo!`);
    });

    document
      .getElementById("formDesistidos")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (
          !FormValidator.validateForm(
            "formDesistidos",
            this.getValidationRules().desistidos
          )
        )
          return;

        const id = document.getElementById("desistidoId")?.value;
        const gameData = {
          id: id || Date.now().toString(),
          nome: document.getElementById("dNome")?.value.trim(),
          categoria: document.getElementById("dCategoria")?.value,
          motivo: document.getElementById("dMotivo")?.value,
          tempoGameplay: document.getElementById("dTempoGameplay")?.value,
          observacoes: document.getElementById("dObservacoes")?.value.trim(),
        };

        if (id) {
          const index = this.state.desistidos.findIndex((g) => g.id === id);
          if (index > -1) this.state.desistidos[index] = gameData;
        } else {
          this.state.desistidos.push(gameData);
        }

        this.saveData();
        this.renderTables();
        this.closeModal("modalDesistidos");
        this.showToast(`"${gameData.nome}" foi salvo!`);
      });
  }
}

// =================================================================================
//  INICIALIZAÇÃO
// =================================================================================
document.addEventListener("DOMContentLoaded", () => {
  new GameManager();
});
