// Configurações globais do Chart.js
if (typeof Chart !== "undefined") {
  Chart.defaults.font.family = "'Orbitron', 'Inter', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#94a3b8";
  Chart.defaults.borderColor = "rgba(255,255,255,0.07)";
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

const rawgTagMap = {
  "first-person":        "Primeira Pessoa (FPS)",
  "third-person":        "Terceira Pessoa (TPS)",
  "hack-and-slash":      "Hack and Slash",
  "beat-em-up":          "Beat 'em up",
  "point-and-click":     "Point-and-Click",
  "exploration":         "Exploração",
  "action-rpg":          "RPG de Ação",
  "jrpg":                "JRPG",
  "crpg":                "CRPG",
  "tactical":            "Tático",
  "real-time-strategy":  "RTS (Tempo Real)",
  "turn-based-strategy": "TBS (Turnos)",
  "turn-based":          "TBS (Turnos)",
  "tower-defense":       "Tower Defense",
  "4x":                  "4X",
  "management":          "Gerenciamento",
  "life-simulation":     "Vida Virtual",
  "soccer":              "Futebol",
  "basketball":          "Basquete",
  "arcade":              "Arcade",
  "racing-simulator":    "Simulador de Corrida",
  "puzzle-platformer":   "Puzzle-Platformer",
  "psychological-horror":"Horror Psicológico",
  "survival-horror":     "Survival Horror",
  "crafting":            "Crafting",
  "battle-royale":       "Battle Royale",
  "dungeon-crawler":     "Dungeon Crawler",
  "card-game":           "Card Game",
  "party-game":          "Party Game",
};

const rawgGenreMap = {
  "action": "Ação",
  "adventure": "Aventura",
  "role-playing-games-rpg": "RPG",
  "strategy": "Estratégia",
  "simulation": "Simulação",
  "sports": "Esportes",
  "racing": "Corrida",
  "puzzle": "Quebra-Cabeça",
  "fighting": "Luta",
  "shooter": "Tiro",
  "platformer": "Plataforma",
  "survival": "Sobrevivência",
  "horror": "Horror",
  "indie": "Indie",
  "educational": "Educacional",
  "massively-multiplayer": "MMORPG",
  "rhythm": "Ritmo",
  "sandbox": "Sandbox",
  "roguelike": "Roguelike",
};

const rawgPlatformMap = {
  "pc": "PC",
  "playstation5": "PlayStation 5",
  "playstation4": "PlayStation 4",
  "playstation3": "PlayStation 3",
  "psp": "PSP",
  "ps-vita": "PS Vita",
  "xbox-series-x": "Xbox Series X/S",
  "xbox-one": "Xbox One",
  "xbox360": "Xbox 360",
  "nintendo-switch": "Nintendo Switch",
  "wii-u": "Wii U",
  "wii": "Wii",
  "nintendo-3ds": "Nintendo 3DS",
  "android": "Android",
  "ios": "iOS",
  "macos": "macOS",
  "linux": "Linux",
};

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
      fieldContainer =
        field.closest(".simple-dropdown") ||
        field.closest(".searchable-dropdown") ||
        field;
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
//  CLASSE PARA GERENCIAR SCROLL DOS MODALS
// =================================================================================
class ModalScrollManager {
  static disablePageScroll() {
    // Salva a posição atual do scroll
    this.scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    // Adiciona classes para bloquear o scroll
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");

    // Define a posição do body para manter a posição visual
    document.body.style.top = `-${this.scrollPosition}px`;
  }

  static enablePageScroll() {
    // Remove as classes que bloqueiam o scroll
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");

    // Remove o estilo top do body
    document.body.style.top = "";

    // Restaura a posição do scroll
    if (this.scrollPosition !== undefined) {
      window.scrollTo(0, this.scrollPosition);
      this.scrollPosition = undefined;
    }
  }

  static preventScrollPropagation(modalElement) {
    if (!modalElement) return;

    modalElement.addEventListener(
      "wheel",
      (e) => {
        const modalContent = modalElement.querySelector(".modal-content");
        if (!modalContent) return;

        const { scrollTop, scrollHeight, clientHeight } = modalContent;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        // Se estiver no topo e tentando rolar para cima, ou no bottom e tentando rolar para baixo
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // Previne touch scrolling no backdrop
    modalElement.addEventListener(
      "touchmove",
      (e) => {
        if (e.target === modalElement) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
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
    this.filters = { queroJogar: "", zerados: "", desistidos: "" };
    this.sortState = {
      queroJogar: { col: null, dir: 1 },
      zerados: { col: null, dir: 1 },
      desistidos: { col: null, dir: 1 },
    };
    this._pendingMoveFromId = null;
    this.viewMode = { queroJogar: "table", zerados: "table", desistidos: "table" };
    this.meta = JSON.parse(localStorage.getItem("gameTrackerMeta") || '{"goal":0,"year":' + new Date().getFullYear() + '}');
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
    this.setupModalScrollPrevention();
    this.renderMeta();
    if (typeof lucide !== "undefined") lucide.createIcons();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  setupModalScrollPrevention() {
    // Configura prevenção de scroll para todos os modais
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      ModalScrollManager.preventScrollPropagation(modal);
    });
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
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 10, family: "Orbitron" }, padding: 16, color: "#94a3b8" },
        },
      },
      animation: { duration: 800, easing: "easeOutQuart" },
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
              backgroundColor: [
                "rgba(239,68,68,0.7)",
                "rgba(245,158,11,0.7)",
                "rgba(16,185,129,0.7)",
              ],
              borderColor: "rgba(8,8,24,0.9)",
              borderWidth: 3,
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
            { label: "Nº de Jogos", data: [], backgroundColor: "rgba(16,185,129,0.6)", borderColor: "rgba(16,185,129,0.9)", borderWidth: 1, borderRadius: 4 },
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
                "rgba(239,68,68,0.7)",
                "rgba(245,158,11,0.7)",
                "rgba(139,92,246,0.7)",
                "rgba(0,212,255,0.7)",
                "rgba(100,116,139,0.7)",
              ],
              borderColor: "rgba(8,8,24,0.9)",
              borderWidth: 3,
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

    // Atualiza estatísticas dos zerados
    this.updateZeradosStats();
  }

  updateZeradosStats() {
    const totalZeradosEl = document.getElementById("totalZerados");
    const tempoMedioEl = document.getElementById("tempoMedio");

    if (totalZeradosEl) {
      totalZeradosEl.textContent = this.state.zerados.length;
    }

    if (tempoMedioEl) {
      const jogosComTempo = this.state.zerados.filter(
        (g) => g.tempoGasto && g.tempoGasto > 0
      );
      if (jogosComTempo.length > 0) {
        const tempoTotal = jogosComTempo.reduce(
          (acc, g) => acc + parseFloat(g.tempoGasto || 0),
          0
        );
        const tempoMedio = Math.round(tempoTotal / jogosComTempo.length);
        tempoMedioEl.textContent = `${tempoMedio}h`;
      } else {
        tempoMedioEl.textContent = "0h";
      }
    }
  }

  // --- Renderização ---
  renderBadge(col, value) {
    const map = {
      interesse: {
        "Baixo": ["badge-red",    "Baixo"],
        "Médio": ["badge-amber",  "Médio"],
        "Alto":  ["badge-green",  "Alto"],
      },
      status: {
        "Já Lançado": ["badge-green",  "Lançado"],
        "Em Breve":   ["badge-cyan",   "Em Breve"],
        "Sem Data":   ["badge-muted",  "Sem Data"],
      },
      motivo: {
        "Chato":     ["badge-red",    "Chato"],
        "Difícil":   ["badge-amber",  "Difícil"],
        "Bugs":      ["badge-purple", "Bugs"],
        "Sem Tempo": ["badge-cyan",   "Sem Tempo"],
        "Outro":     ["badge-muted",  "Outro"],
      },
    };
    const cfg = map[col]?.[value];
    if (!cfg) return value;
    return `<span class="badge ${cfg[0]}">${cfg[1]}</span>`;
  }

  updateTabCounts() {
    const map = {
      QueroJogar: this.state.queroJogar.length,
      Zerados:    this.state.zerados.length,
      Desistidos: this.state.desistidos.length,
    };
    Object.entries(map).forEach(([key, count]) => {
      const el = document.getElementById(`count${key}`);
      if (!el) return;
      el.textContent = count || "";
      el.style.display = count ? "" : "none";
    });
  }

  highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return String(text).replace(
      new RegExp(`(${escaped})`, "gi"),
      '<mark class="highlight">$1</mark>'
    );
  }

  parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current); current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  importFromCsv(stateKey) {
    const headerMap = {
      "Nome": "nome", "Categoria": "categoria", "Subcategoria": "subcategoria",
      "Lançamento": "dataLancamento", "Interesse": "interesse",
      "Plataformas": "plataformas", "Status": "status",
      "Tempo Estimado (h)": "tempoEstimado", "Observações": "observacoes",
      "Nota (1-5)": "nota", "Data Zerado": "dataZerei",
      "Plataforma": "plataforma", "Tempo Gasto (h)": "tempoGasto",
      "Avaliação": "avaliacao", "Motivo": "motivo",
      "Tempo Jogado (h)": "tempoGameplay",
    };

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result.replace(/^\uFEFF/, "");
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) { this.showToast("CSV vazio ou inválido.", "error"); return; }

        const headers = this.parseCsvLine(lines[0]);
        let imported = 0;

        lines.slice(1).forEach((line) => {
          if (!line.trim()) return;
          const values = this.parseCsvLine(line);
          const item = { id: Date.now().toString() + Math.random().toString(36).slice(2) };
          headers.forEach((h, i) => {
            const key = headerMap[h.trim()] || h.trim().toLowerCase();
            item[key] = values[i]?.trim() || "";
          });
          if (item.nota) item.nota = parseInt(item.nota) || 0;
          if (item.nome) { this.state[stateKey].push(item); imported++; }
        });

        this.saveData();
        this.renderTables();
        this.showToast(
          imported > 0
            ? `${imported} jogo(s) importado(s) com sucesso!`
            : "Nenhum jogo válido encontrado no CSV.",
          imported > 0 ? "success" : "error"
        );
      };
      reader.readAsText(file, "UTF-8");
    });
    input.click();
  }

  renderTables() {
    const qjCols = ["nome","categoria","dataLancamento","interesse","plataformas","status"];
    const zCols  = ["nome","categoria","nota","plataforma","tempoGasto"];
    const dCols  = ["nome","categoria","motivo","tempoGameplay","observacoes"];

    // Limpeza nuclear: remove qualquer kanban-grid que possa estar solto no DOM
    document.querySelectorAll(".kanban-grid").forEach((g) => g.remove());

    // Limpeza centralizada: oculta todos os wrappers kanban e restaura todas as table-containers
    [
      { key: "queroJogar",  containerId: "tableContainerQueroJogar",  wrapperId: "kanbanWrapperQueroJogar" },
      { key: "zerados",     containerId: "tableContainerZerados",     wrapperId: "kanbanWrapperZerados" },
      { key: "desistidos",  containerId: "tableContainerDesistidos",  wrapperId: "kanbanWrapperDesistidos" },
    ].forEach(({ key, containerId, wrapperId }) => {
      const wrapper = document.getElementById(wrapperId);
      if (wrapper) { wrapper.style.display = "none"; wrapper.innerHTML = ""; }
      const container = document.getElementById(containerId);
      if (container) { container.style.display = ""; container.style.removeProperty("display"); container.style.display = "block"; }
    });

    if (this.viewMode.queroJogar === "kanban") {
      this.renderKanban("queroJogar", "tableQueroJogar", qjCols);
    } else {
      this.renderTable("queroJogar", "tableQueroJogar", qjCols);
    }
    if (this.viewMode.zerados === "kanban") {
      this.renderKanban("zerados", "tableZerados", zCols);
    } else {
      this.renderTable("zerados", "tableZerados", zCols);
    }
    if (this.viewMode.desistidos === "kanban") {
      this.renderKanban("desistidos", "tableDesistidos", dCols);
    } else {
      this.renderTable("desistidos", "tableDesistidos", dCols);
    }

    this.updateCharts();
    this.updateTabCounts();
    this.renderMeta();
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  renderTable(stateKey, tableId, columns) {
    const table = document.getElementById(tableId);
    const tbody = table?.querySelector("tbody");
    const emptyStateEl = document.getElementById(
      `empty${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}`
    );
    if (!tbody || !emptyStateEl) return;
    tbody.innerHTML = "";

    // Filtrar dados
    const filter = (this.filters[stateKey] || "").toLowerCase();
    let data = this.state[stateKey];
    if (filter) {
      data = data.filter((item) =>
        columns.some((col) =>
          String(item[col] || "").toLowerCase().includes(filter)
        )
      );
    }

    // Ordenar dados
    const sort = this.sortState[stateKey];
    if (sort?.col) {
      data = [...data].sort((a, b) => {
        const av = a[sort.col];
        const bv = b[sort.col];
        if (av !== "" && bv !== "" && !isNaN(av) && !isNaN(bv)) {
          return (Number(av) - Number(bv)) * sort.dir;
        }
        return String(av || "").localeCompare(String(bv || "")) * sort.dir;
      });
    }

    // Pinned sempre no topo (somente queroJogar)
    if (stateKey === "queroJogar") {
      data = [...data.filter((i) => i.pinned), ...data.filter((i) => !i.pinned)];
    }

    // Atualizar indicadores de ordenação nos cabeçalhos
    table.querySelectorAll("th[data-col]").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      if (sort?.col === th.dataset.col) {
        th.classList.add(sort.dir === 1 ? "sort-asc" : "sort-desc");
      }
    });

    if (data.length === 0) {
      emptyStateEl.classList.add("visible");
      table.style.display = "none";
    } else {
      emptyStateEl.classList.remove("visible");
      table.style.display = "table";
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.dataset.id = item.id;
        const cellsHTML = columns
          .map((col) => {
            let value = item[col] || "";
            if (col === "nota") {
              const stars = "★".repeat(item.nota || 0) + "☆".repeat(5 - (item.nota || 0));
              return `<td><span class="stars">${stars}</span></td>`;
            }
            if (["interesse", "status", "motivo"].includes(col)) {
              return `<td>${this.renderBadge(col, String(value))}</td>`;
            }
            if (col === "nome" && stateKey === "queroJogar" && item.createdAt) {
              const days = Math.floor((Date.now() - item.createdAt) / 86400000);
              const cls = days >= 180 ? "old" : days >= 60 ? "medium" : "";
              const daysLabel = days === 0 ? "hoje" : `${days}d na fila`;
              const pinIcon = item.pinned ? `<i data-lucide="pin" style="width:10px;height:10px;color:var(--amber);display:inline;vertical-align:middle;margin-right:3px"></i>` : "";
              const truncated = String(value).length > 35 ? String(value).substring(0, 35) + "…" : value;
              const display = filter ? this.highlightText(truncated, filter) : truncated;
              return `<td title="${item[col] || ""}">${pinIcon}${display}<span class="queue-days ${cls}">${daysLabel}</span></td>`;
            }
            if (typeof value === "string" && value.length > 35) {
              value = value.substring(0, 35) + "…";
            }
            const display = filter ? this.highlightText(value, filter) : value;
            return `<td title="${item[col] || ""}">${display}</td>`;
          })
          .join("");
        tr.innerHTML = cellsHTML;

        const actionsCell = document.createElement("td");

        const viewBtn = document.createElement("button");
        viewBtn.className = "action-btn view";
        viewBtn.innerHTML = '<i data-lucide="eye"></i>';
        viewBtn.title = "Visualizar";
        viewBtn.addEventListener("click", () =>
          this.openViewModal(stateKey, item.id)
        );

        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit";
        editBtn.innerHTML = '<i data-lucide="square-pen"></i>';
        editBtn.title = "Editar";
        editBtn.addEventListener("click", () => {
          const modalId = `modal${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}`;
          this.openModal(modalId, item.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete";
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.title = "Excluir";
        deleteBtn.addEventListener("click", () =>
          this.deleteItem(stateKey, item.id, item.nome)
        );

        actionsCell.appendChild(viewBtn);
        actionsCell.appendChild(editBtn);

        if (stateKey === "queroJogar") {
          const pinBtn = document.createElement("button");
          pinBtn.className = `action-btn pin${item.pinned ? " pinned-active" : ""}`;
          pinBtn.innerHTML = '<i data-lucide="pin"></i>';
          pinBtn.title = item.pinned ? "Desafixar" : "Fixar no topo";
          pinBtn.addEventListener("click", () => this.pinItem(item.id));
          actionsCell.appendChild(pinBtn);

          const moveBtn = document.createElement("button");
          moveBtn.className = "action-btn move";
          moveBtn.innerHTML = '<i data-lucide="trophy"></i>';
          moveBtn.title = "Mover para Zerados";
          moveBtn.addEventListener("click", () => this.moveToZerados(item.id));
          actionsCell.appendChild(moveBtn);
        }

        actionsCell.appendChild(deleteBtn);
        tr.appendChild(actionsCell);
        tbody.appendChild(tr);
      });
    }
  }

  renderKanban(stateKey, tableId, columns) {
    const cap = stateKey.charAt(0).toUpperCase() + stateKey.slice(1);
    const wrapper = document.getElementById("kanbanWrapper" + cap);
    const container = document.getElementById("tableContainer" + cap);
    const emptyStateEl = document.getElementById("empty" + cap);
    if (!wrapper || !container || !emptyStateEl) return;

    // Esconde o table-container e mostra o wrapper kanban
    container.style.display = "none";
    wrapper.style.display = "";

    const filter = (this.filters[stateKey] || "").toLowerCase();
    let data = this.state[stateKey];
    if (filter) {
      data = data.filter((item) =>
        columns.some((col) => String(item[col] || "").toLowerCase().includes(filter))
      );
    }
    if (stateKey === "queroJogar") {
      data = [...data.filter((i) => i.pinned), ...data.filter((i) => !i.pinned)];
    }

    if (data.length === 0) {
      wrapper.innerHTML = "";
      emptyStateEl.classList.add("visible");
      return;
    }
    emptyStateEl.classList.remove("visible");

    const grid = document.createElement("div");
    grid.className = "kanban-grid";

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = `kanban-card${item.pinned ? " pinned-card" : ""}`;
      card.dataset.id = item.id;

      // Cover
      let coverHTML = "";
      if (item.coverUrl) {
        coverHTML = `<img src="${item.coverUrl}" class="cover-thumb" alt="${item.nome}" loading="lazy">`;
      } else {
        coverHTML = `<div class="cover-placeholder"><i data-lucide="gamepad-2"></i></div>`;
      }

      // Meta info
      let metaLines = [];
      if (item.categoria) metaLines.push(item.categoria);
      if (item.nota) metaLines.push("★".repeat(item.nota) + "☆".repeat(5 - item.nota));
      if (item.interesse) metaLines.push(item.interesse);
      if (item.motivo) metaLines.push(item.motivo);
      if (item.dataZerei) metaLines.push(item.dataZerei);
      if (item.tempoGasto) metaLines.push(`${item.tempoGasto}h`);
      if (item.createdAt) {
        const days = Math.floor((Date.now() - item.createdAt) / 86400000);
        metaLines.push(days === 0 ? "adicionado hoje" : `${days}d na fila`);
      }

      const modalMap = { queroJogar: "modalQueroJogar", zerados: "modalZerados", desistidos: "modalDesistidos" };
      card.innerHTML = `
        ${coverHTML}
        <div class="kanban-card-name">${item.nome || ""}</div>
        ${metaLines.length ? `<div class="kanban-card-meta">${metaLines.join(" · ")}</div>` : ""}
        <div class="kanban-card-actions"></div>
      `;

      const actionsDiv = card.querySelector(".kanban-card-actions");

      const viewBtn = document.createElement("button");
      viewBtn.className = "action-btn view";
      viewBtn.innerHTML = '<i data-lucide="eye"></i>';
      viewBtn.title = "Visualizar";
      viewBtn.addEventListener("click", () => this.openViewModal(stateKey, item.id));
      actionsDiv.appendChild(viewBtn);

      const editBtn = document.createElement("button");
      editBtn.className = "action-btn edit";
      editBtn.innerHTML = '<i data-lucide="square-pen"></i>';
      editBtn.title = "Editar";
      editBtn.addEventListener("click", () => this.openModal(modalMap[stateKey], item.id));
      actionsDiv.appendChild(editBtn);

      if (stateKey === "queroJogar") {
        const pinBtn = document.createElement("button");
        pinBtn.className = `action-btn pin${item.pinned ? " pinned-active" : ""}`;
        pinBtn.innerHTML = '<i data-lucide="pin"></i>';
        pinBtn.title = item.pinned ? "Desafixar" : "Fixar";
        pinBtn.addEventListener("click", () => this.pinItem(item.id));
        actionsDiv.appendChild(pinBtn);

        const moveBtn = document.createElement("button");
        moveBtn.className = "action-btn move";
        moveBtn.innerHTML = '<i data-lucide="trophy"></i>';
        moveBtn.title = "Mover para Zerados";
        moveBtn.addEventListener("click", () => this.moveToZerados(item.id));
        actionsDiv.appendChild(moveBtn);
      }

      const delBtn = document.createElement("button");
      delBtn.className = "action-btn delete";
      delBtn.innerHTML = '<i data-lucide="trash-2"></i>';
      delBtn.title = "Excluir";
      delBtn.addEventListener("click", () => this.deleteItem(stateKey, item.id, item.nome));
      actionsDiv.appendChild(delBtn);

      grid.appendChild(card);
    });

    wrapper.innerHTML = "";
    wrapper.appendChild(grid);
  }

  pinItem(itemId) {
    const item = this.state.queroJogar.find((g) => g.id === itemId);
    if (!item) return;
    item.pinned = !item.pinned;
    this.saveData();
    this.renderTables();
    this.showToast(item.pinned ? `"${item.nome}" fixado no topo.` : `"${item.nome}" desafixado.`);
  }

  sortearJogo() {
    const lista = this.state.queroJogar;
    if (lista.length === 0) {
      document.getElementById("sorteioCard").innerHTML = `<div class="sorteio-empty">Sua lista está vazia!<br>Adicione jogos primeiro.</div>`;
      return;
    }
    const card = document.getElementById("sorteioCard");
    card.classList.remove("spinning");
    // força reflow para reiniciar animação
    void card.offsetWidth;
    card.classList.add("spinning");

    const game = lista[Math.floor(Math.random() * lista.length)];
    const coverHTML = game.coverUrl
      ? `<img src="${game.coverUrl}" class="sorteio-cover" alt="${game.nome}">`
      : `<div class="sorteio-no-cover"><i data-lucide="gamepad-2" style="width:40px;height:40px;opacity:0.3"></i></div>`;
    const meta = [game.categoria, game.plataformas, game.tempoEstimado ? `~${game.tempoEstimado}h` : ""].filter(Boolean).join(" · ");
    card.innerHTML = `
      ${coverHTML}
      <div class="sorteio-name">${game.nome}</div>
      ${meta ? `<div class="sorteio-meta">${meta}</div>` : ""}
      ${game.interesse ? this.renderBadge("interesse", game.interesse) : ""}
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  renderMeta() {
    const input = document.getElementById("metaAnoInput");
    const fill = document.getElementById("metaProgressFill");
    const text = document.getElementById("metaProgressText");
    if (!fill || !text) return;

    if (input && !input.value && this.meta.goal) {
      input.value = this.meta.goal;
    }

    const goal = parseInt(this.meta.goal) || 0;
    const year = new Date().getFullYear();
    const done = this.state.zerados.filter((g) => {
      if (!g.dataZerei) return false;
      const d = new Date(g.dataZerei);
      return d.getFullYear() === year;
    }).length;

    if (!goal) {
      fill.style.width = "0%";
      text.textContent = "Defina sua meta de jogos para o ano";
      return;
    }

    const pct = Math.min(100, Math.round((done / goal) * 100));
    fill.style.width = pct + "%";
    fill.classList.toggle("complete", pct >= 100);
    text.textContent = `${done} / ${goal} jogos zerados em ${year} — ${pct}%`;
  }

  saveMeta() {
    const input = document.getElementById("metaAnoInput");
    const val = parseInt(input?.value) || 0;
    this.meta = { goal: val, year: new Date().getFullYear() };
    localStorage.setItem("gameTrackerMeta", JSON.stringify(this.meta));
    this.renderMeta();
    this.showToast(val ? `Meta de ${val} jogos salva!` : "Meta removida.");
  }

  openRelatorioModal() {
    const modal = document.getElementById("modalRelatorio");
    const content = document.getElementById("relatorioContent");
    if (!modal || !content) return;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    const zeradosMes = this.state.zerados.filter((g) => {
      if (!g.dataZerei) return false;
      const d = new Date(g.dataZerei);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const desistidosMes = this.state.desistidos.filter((g) => {
      if (!g.createdAt) return false;
      const d = new Date(g.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalHoras = zeradosMes.reduce((sum, g) => sum + (parseFloat(g.tempoGasto) || 0), 0);
    const notaMedia = zeradosMes.length
      ? (zeradosMes.reduce((sum, g) => sum + (parseInt(g.nota) || 0), 0) / zeradosMes.filter((g) => g.nota).length || 0).toFixed(1)
      : "—";
    const adicionados = this.state.queroJogar.filter((g) => {
      if (!g.createdAt) return false;
      const d = new Date(g.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;

    content.innerHTML = `
      <p style="text-align:center;font-family:'Orbitron',sans-serif;font-size:0.65rem;letter-spacing:2px;color:var(--text-muted);margin-bottom:14px;text-transform:uppercase">${monthNames[month]} de ${year}</p>
      <div class="relatorio-grid">
        <div class="relatorio-card">
          <div class="relatorio-card-label">Zerados</div>
          <div class="relatorio-card-value green">${zeradosMes.length}</div>
        </div>
        <div class="relatorio-card">
          <div class="relatorio-card-label">Horas jogadas</div>
          <div class="relatorio-card-value cyan">${totalHoras > 0 ? totalHoras + "h" : "—"}</div>
        </div>
        <div class="relatorio-card">
          <div class="relatorio-card-label">Nota média</div>
          <div class="relatorio-card-value amber">${notaMedia !== "NaN" ? notaMedia : "—"}</div>
        </div>
        <div class="relatorio-card">
          <div class="relatorio-card-label">Adicionados</div>
          <div class="relatorio-card-value purple">${adicionados}</div>
        </div>
      </div>
      ${zeradosMes.length > 0 ? `
        <div class="relatorio-section-title"><i data-lucide="trophy"></i>Zerados no mês</div>
        ${zeradosMes.map((g) => `
          <div class="relatorio-game-item">
            ${g.coverUrl ? `<img src="${g.coverUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;flex-shrink:0">` : ""}
            <span style="flex:1">${g.nome}</span>
            <span class="stars">${"★".repeat(g.nota || 0) + "☆".repeat(5 - (g.nota || 0))}</span>
            ${g.tempoGasto ? `<span style="color:var(--text-muted);font-size:0.72rem">${g.tempoGasto}h</span>` : ""}
          </div>`).join("")}
      ` : `<div class="relatorio-empty">Nenhum jogo zerado em ${monthNames[month]}.</div>`}
    `;

    ModalScrollManager.disablePageScroll();
    modal.style.display = "block";
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  exportAsImage() {
    if (typeof html2canvas === "undefined") {
      this.showToast("html2canvas não carregado.", "error");
      return;
    }
    const target = document.getElementById("tabZerados");
    if (!target) return;
    this.showToast("Gerando imagem...");
    html2canvas(target, {
      backgroundColor: "#04040f",
      scale: 2,
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `hall-da-fama-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      this.showToast("Imagem exportada!");
    }).catch(() => this.showToast("Erro ao gerar imagem.", "error"));
  }

  moveToZerados(itemId) {
    const item = this.state.queroJogar.find((g) => g.id === itemId);
    if (!item) return;
    this._pendingMoveFromId = itemId;
    this.openModal("modalZerados");
    setTimeout(async () => {
      const zNome = document.getElementById("zNome");
      if (zNome) {
        zNome.value = item.nome;
        zNome.dataset.coverUrl   = item.coverUrl   || "";
        zNome.dataset.rawgRating = item.rawgRating || "";

        // Se o item não tem capa, busca automaticamente no RAWG
        if (!item.coverUrl && item.nome) {
          try {
            const res = await fetch(
              `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(item.nome)}&page_size=1`
            );
            if (res.ok) {
              const data = await res.json();
              const hit = data.results?.[0];
              if (hit?.background_image) {
                zNome.dataset.coverUrl   = hit.background_image;
                zNome.dataset.rawgRating = String(hit.rating || "");
                // Salva no item de QueroJogar também para usos futuros
                item.coverUrl   = hit.background_image;
                item.rawgRating = String(hit.rating || "");
                this.saveData();
              }
            }
          } catch (_) {}
        }
      }
      if (item.categoria) {
        const zCategoriaEl = document.getElementById("zCategoria");
        if (zCategoriaEl) {
          this.updateSearchableDropdown(
            zCategoriaEl.closest(".searchable-dropdown"),
            item.categoria
          );
        }
      }
    }, 50);
  }

  // --- Modals e UI (CORRIGIDOS PARA SCROLL) ---
  openModal(modalId, itemId = null) {
    const modal = document.getElementById(modalId);
    const form = modal?.querySelector("form");
    if (!form) return;

    form.reset();
    FormValidator.clearErrors(form);

    form.querySelectorAll(".searchable-dropdown").forEach((dropdown) => {
      this.updateSearchableDropdown(dropdown, "");
    });

    form.querySelectorAll(".simple-dropdown").forEach((dropdown) => {
      const hidden = dropdown.querySelector("input[type='hidden']");
      if (hidden) this.updateSimpleDropdown(hidden.id, hidden.defaultValue || "");
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
      if (!itemId) {
        const zDataZerei = document.getElementById("zDataZerei");
        if (zDataZerei) zDataZerei.value = new Date().toISOString().split("T")[0];
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
          this.updateSearchableDropdown(el.closest(".searchable-dropdown"), value || "");
        } else if (el.type === "hidden" && el.closest(".simple-dropdown")) {
          this.updateSimpleDropdown(el.id, value || "");
        } else {
          el.value = value || "";
        }
      }
    });

    // Restaura dataset de coverUrl e rawgRating nos campos de nome (preserva ao editar)
    [
      { elId: "qjNome", coverKey: "coverUrl", ratingKey: "rawgRating" },
      { elId: "zNome",  coverKey: "coverUrl", ratingKey: "rawgRating" },
      { elId: "dNome",  coverKey: "coverUrl", ratingKey: "rawgRating" },
    ].forEach(({ elId, coverKey, ratingKey }) => {
      const el = document.getElementById(elId);
      if (el && form.contains(el)) {
        el.dataset.coverUrl  = item[coverKey]  || "";
        el.dataset.rawgRating = item[ratingKey] || "";
      }
    });

    // NOVO: Bloqueia o scroll da página
    ModalScrollManager.disablePageScroll();
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

    if (item.coverUrl) {
      const img = document.createElement("img");
      img.src = item.coverUrl;
      img.className = "cover-art";
      img.alt = item.nome || "Cover";
      contentEl.appendChild(img);
    }

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

    // Nota da comunidade (RAWG)
    if (item.rawgRating && parseFloat(item.rawgRating) > 0) {
      const pct = Math.round((parseFloat(item.rawgRating) / 5) * 100);
      const div = document.createElement("div");
      div.className = "community-rating";
      div.innerHTML = `
        <div class="community-rating-label">Nota da Comunidade (RAWG)</div>
        <div class="community-rating-bar">
          <div class="community-rating-fill" style="width:${pct}%"></div>
        </div>
        <div class="community-rating-value">${parseFloat(item.rawgRating).toFixed(1)} / 5 &nbsp;·&nbsp; ${pct}% aprovação</div>
      `;
      contentEl.appendChild(div);
    }

    // NOVO: Bloqueia o scroll da página
    ModalScrollManager.disablePageScroll();
    modal.style.display = "block";
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      ModalScrollManager.enablePageScroll();
    }
    if (modalId === "modalZerados") {
      this._pendingMoveFromId = null;
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

    // NOVO: Bloqueia o scroll da página
    ModalScrollManager.disablePageScroll();
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
      const doDelete = () => {
        this.state[stateKey] = this.state[stateKey].filter((i) => i.id !== itemId);
        this.saveData();
        this.renderTables();
        this.showToast(`"${itemName}" foi apagado.`, "error");
      };

      // Em modo kanban não há linha visível — vai direto sem animação
      if (this.viewMode[stateKey] === "kanban") {
        doDelete();
        return;
      }

      const tableId = `table${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}`;
      const row = document.querySelector(`#${tableId} tr[data-id="${itemId}"]`);
      if (row) {
        row.classList.add("row-deleting");
        // Fallback: garante execução mesmo se animationend não disparar
        let deleted = false;
        const safeDel = () => { if (!deleted) { deleted = true; doDelete(); } };
        const timer = setTimeout(safeDel, 400);
        row.addEventListener("animationend", () => { clearTimeout(timer); safeDel(); }, { once: true });
      } else {
        doDelete();
      }
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
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });

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

  fillFromRawg(inputId, game) {
    const prefix = inputId.startsWith("qj") ? "qj"
                 : inputId.startsWith("z")  ? "z"
                 : "d";

    // Categoria (gêneros)
    const mappedGenres = (game.genres || [])
      .map((g) => rawgGenreMap[g.slug])
      .filter(Boolean);

    if (mappedGenres.length > 0) {
      const categoriaId = prefix === "qj" ? "qjCategoria"
                        : prefix === "z"  ? "zCategoria"
                        : "dCategoria";
      const categoriaEl = document.getElementById(categoriaId);
      if (categoriaEl) {
        this.updateSearchableDropdown(
          categoriaEl.closest(".searchable-dropdown"),
          mappedGenres.join(", ")
        );
      }
    }

    // Subcategoria (tags) — somente no form Quero Jogar
    if (prefix === "qj") {
      const mappedTags = (game.tags || [])
        .map((t) => rawgTagMap[t.slug])
        .filter(Boolean)
        .slice(0, 3); // máximo 3 subcategorias

      if (mappedTags.length > 0) {
        const subEl = document.getElementById("qjSubcategoria");
        if (subEl) {
          this.updateSearchableDropdown(
            subEl.closest(".searchable-dropdown"),
            mappedTags.join(", ")
          );
        }
      }
    }

    // Plataformas
    const mappedPlatforms = (game.platforms || [])
      .map((p) => rawgPlatformMap[p.platform.slug])
      .filter(Boolean);

    if (mappedPlatforms.length > 0 && prefix !== "d") {
      const platformId = prefix === "qj" ? "qjPlataformas" : "zPlataforma";
      const platformEl = document.getElementById(platformId);
      if (platformEl) {
        this.updateSearchableDropdown(
          platformEl.closest(".searchable-dropdown"),
          mappedPlatforms.join(", ")
        );
      }
    }

    // Tempo estimado em horas (playtime da RAWG) — somente Quero Jogar
    if (prefix === "qj" && game.playtime > 0) {
      const tempoEl = document.getElementById("qjTempoEstimado");
      if (tempoEl) tempoEl.value = game.playtime;
    }

    // Data de lançamento — somente Quero Jogar
    if (prefix === "qj" && game.released) {
      const dataEl = document.getElementById("qjDataLancamento");
      if (dataEl) {
        const [year, month, day] = game.released.split("-");
        dataEl.value = `${day}/${month}/${year}`;
      }
    }

    // Status — somente Quero Jogar
    if (prefix === "qj") {
      let status = "Já Lançado";
      if (game.tba) {
        status = "Sem Data";
      } else if (game.released && new Date(game.released) > new Date()) {
        status = "Em Breve";
      }
      this.updateSimpleDropdown("qjStatus", status);
    }
  }

  createSimpleDropdown(containerId, options, hiddenInputId, defaultValue = "", placeholder = "Selecione...") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const defaultLabel = options.find((o) => o.value === defaultValue)?.label || "";

    container.innerHTML = `
      <div class="simple-dropdown" data-placeholder="${placeholder}" data-input-id="${hiddenInputId}">
        <input type="hidden" id="${hiddenInputId}" value="${defaultValue}">
        <button type="button" class="simple-dropdown-btn">
          <span class="simple-dropdown-label${!defaultValue ? " is-placeholder" : ""}">${defaultLabel || placeholder}</span>
          <i data-lucide="chevron-down"></i>
        </button>
        <div class="simple-dropdown-panel">
          ${options
            .map(
              (opt) => `
            <div class="simple-dropdown-option${opt.value === defaultValue ? " is-selected" : ""}"
                 data-value="${opt.value}" data-label="${opt.label}">
              ${opt.icon ? `<i data-lucide="${opt.icon}"></i>` : ""}
              ${opt.label}
            </div>`
            )
            .join("")}
        </div>
      </div>`;

    const dropdown = container.querySelector(".simple-dropdown");
    const btn = dropdown.querySelector(".simple-dropdown-btn");
    const panel = dropdown.querySelector(".simple-dropdown-panel");
    const hidden = dropdown.querySelector("input[type='hidden']");
    const labelEl = dropdown.querySelector(".simple-dropdown-label");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      document.querySelectorAll(".simple-dropdown.open").forEach((d) => d.classList.remove("open"));
      if (!isOpen) dropdown.classList.add("open");
    });

    panel.querySelectorAll(".simple-dropdown-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        hidden.value = opt.dataset.value;
        labelEl.textContent = opt.dataset.label;
        labelEl.classList.remove("is-placeholder");
        panel.querySelectorAll(".simple-dropdown-option").forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        dropdown.classList.remove("open", "error");
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
    });

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  updateSimpleDropdown(hiddenInputId, value) {
    const hidden = document.getElementById(hiddenInputId);
    if (!hidden) return;
    const dropdown = hidden.closest(".simple-dropdown");
    if (!dropdown) return;

    const labelEl = dropdown.querySelector(".simple-dropdown-label");
    const placeholder = dropdown.dataset.placeholder || "Selecione...";
    hidden.value = value || "";

    if (value) {
      const opt = dropdown.querySelector(`.simple-dropdown-option[data-value="${value}"]`);
      labelEl.textContent = opt?.dataset.label || value;
      labelEl.classList.remove("is-placeholder");
      dropdown.querySelectorAll(".simple-dropdown-option").forEach((o) => o.classList.remove("is-selected"));
      opt?.classList.add("is-selected");
    } else {
      labelEl.textContent = placeholder;
      labelEl.classList.add("is-placeholder");
      dropdown.querySelectorAll(".simple-dropdown-option").forEach((o) => o.classList.remove("is-selected"));
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

    // Dropdowns simples (Interesse, Status, Motivo)
    this.createSimpleDropdown(
      "qjInteresse-container",
      [
        { value: "Baixo",  label: "Baixo" },
        { value: "Médio",  label: "Médio" },
        { value: "Alto",   label: "Alto" },
      ],
      "qjInteresse",
      "Médio",
      "Selecione o nível..."
    );

    this.createSimpleDropdown(
      "qjStatus-container",
      [
        { value: "Já Lançado", label: "Já Lançado" },
        { value: "Em Breve",   label: "Em Breve" },
        { value: "Sem Data",   label: "Sem Data" },
      ],
      "qjStatus",
      "Já Lançado",
      "Selecione o status..."
    );

    this.createSimpleDropdown(
      "dMotivo-container",
      [
        { value: "Chato",     label: "Chato / Entediante" },
        { value: "Difícil",   label: "Muito Difícil" },
        { value: "Bugs",      label: "Bugs / Problemas" },
        { value: "Sem Tempo", label: "Falta de Tempo" },
        { value: "Outro",     label: "Outro" },
      ],
      "dMotivo",
      "",
      "Selecione o motivo..."
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
              input.dataset.coverUrl = game.background_image || "";
              input.dataset.rawgRating = game.rating || "";
              autocompleteContainer.innerHTML = "";
              this.fillFromRawg(input.id, game);
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

    // Busca/filtro + botão X para limpar
    [
      { inputId: "searchQueroJogar", clearId: "clearQueroJogar", stateKey: "queroJogar" },
      { inputId: "searchZerados",    clearId: "clearZerados",    stateKey: "zerados" },
      { inputId: "searchDesistidos", clearId: "clearDesistidos", stateKey: "desistidos" },
    ].forEach(({ inputId, clearId, stateKey }) => {
      const input = document.getElementById(inputId);
      const clearBtn = document.getElementById(clearId);
      input?.addEventListener("input", (e) => {
        this.filters[stateKey] = e.target.value;
        clearBtn?.classList.toggle("visible", !!e.target.value);
        this.renderTables();
      });
      clearBtn?.addEventListener("click", () => {
        if (input) input.value = "";
        this.filters[stateKey] = "";
        clearBtn.classList.remove("visible");
        this.renderTables();
        input?.focus();
      });
    });

    // Ordenação por coluna
    document.querySelectorAll("th[data-col]").forEach((th) => {
      th.addEventListener("click", () => {
        const tableId = th.closest("table").id;
        const raw = tableId.replace("table", "");
        const stateKey = raw.charAt(0).toLowerCase() + raw.slice(1);
        const col = th.dataset.col;
        const sort = this.sortState[stateKey];
        if (sort.col === col) {
          sort.dir = sort.dir * -1;
        } else {
          sort.col = col;
          sort.dir = 1;
        }
        this.renderTables();
      });
    });

    // Import CSV
    document.getElementById("importQueroJogarBtn")?.addEventListener("click", () => this.importFromCsv("queroJogar"));
    document.getElementById("importZeradosBtn")?.addEventListener("click", () => this.importFromCsv("zerados"));
    document.getElementById("importDesistidosBtn")?.addEventListener("click", () => this.importFromCsv("desistidos"));

    // Toggle Kanban/Tabela
    [
      { btnId: "toggleViewQueroJogar", key: "queroJogar" },
      { btnId: "toggleViewZerados",    key: "zerados" },
      { btnId: "toggleViewDesistidos", key: "desistidos" },
    ].forEach(({ btnId, key }) => {
      document.getElementById(btnId)?.addEventListener("click", () => {
        this.viewMode[key] = this.viewMode[key] === "table" ? "kanban" : "table";
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.toggle("kanban-active", this.viewMode[key] === "kanban");
        this.renderTables();
      });
    });

    // Sortear jogo
    document.getElementById("sortearBtn")?.addEventListener("click", () => {
      this.sortearJogo();
      const modal = document.getElementById("modalSorteio");
      if (modal) {
        ModalScrollManager.disablePageScroll();
        modal.style.display = "block";
      }
    });
    document.getElementById("sortearNovamenteBtn")?.addEventListener("click", () => this.sortearJogo());

    // Meta anual
    document.getElementById("metaSaveBtn")?.addEventListener("click", () => this.saveMeta());
    document.getElementById("metaAnoInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.saveMeta();
    });

    // Relatório mensal
    document.getElementById("relatorioBtn")?.addEventListener("click", () => this.openRelatorioModal());

    // Exportar como imagem
    document.getElementById("exportImageBtn")?.addEventListener("click", () => this.exportAsImage());

    // Atalho N — abre modal de adição da aba ativa
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (document.querySelector(".modal[style*='block']")) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        const map = {
          tabQueroJogar: "modalQueroJogar",
          tabZerados: "modalZerados",
          tabDesistidos: "modalDesistidos",
        };
        const modalId = map[this.currentTab];
        if (modalId) this.openModal(modalId);
      }
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
        const qjNomeEl = document.getElementById("qjNome");
        const existing = id ? this.state.queroJogar.find((g) => g.id === id) : null;
        const gameData = {
          id: id || Date.now().toString(),
          nome: qjNomeEl?.value.trim(),
          coverUrl: qjNomeEl?.dataset.coverUrl || existing?.coverUrl || "",
          rawgRating: qjNomeEl?.dataset.rawgRating || existing?.rawgRating || "",
          categoria: document.getElementById("qjCategoria")?.value,
          subcategoria: document.getElementById("qjSubcategoria")?.value,
          dataLancamento: document.getElementById("qjDataLancamento")?.value,
          interesse: document.getElementById("qjInteresse")?.value,
          plataformas: document.getElementById("qjPlataformas")?.value,
          status: document.getElementById("qjStatus")?.value,
          tempoEstimado: document.getElementById("qjTempoEstimado")?.value,
          observacoes: document.getElementById("qjObservacoes")?.value.trim(),
          createdAt: existing?.createdAt || Date.now(),
          pinned: existing?.pinned || false,
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
      const zNomeEl = document.getElementById("zNome");
      const existingZ = id ? this.state.zerados.find((g) => g.id === id) : null;
      const originQJ = this._pendingMoveFromId
        ? this.state.queroJogar.find((g) => g.id === this._pendingMoveFromId)
        : null;
      const gameData = {
        id: id || Date.now().toString(),
        nome: zNomeEl?.value.trim(),
        coverUrl: zNomeEl?.dataset.coverUrl || existingZ?.coverUrl || originQJ?.coverUrl || "",
        rawgRating: zNomeEl?.dataset.rawgRating || existingZ?.rawgRating || originQJ?.rawgRating || "",
        categoria: document.getElementById("zCategoria")?.value,
        nota: rating ? parseInt(rating.value) : 0,
        dataZerei: document.getElementById("zDataZerei")?.value,
        plataforma: document.getElementById("zPlataforma")?.value,
        tempoGasto: document.getElementById("zTempoGasto")?.value,
        avaliacao: document.getElementById("zAvaliacao")?.value.trim(),
      };

      const isNew = !id;

      if (id) {
        const index = this.state.zerados.findIndex((g) => g.id === id);
        if (index > -1) this.state.zerados[index] = gameData;
      } else {
        this.state.zerados.push(gameData);
      }

      if (this._pendingMoveFromId) {
        this.state.queroJogar = this.state.queroJogar.filter(
          (g) => g.id !== this._pendingMoveFromId
        );
        this._pendingMoveFromId = null;
      }

      this.saveData();
      this.renderTables();
      this.closeModal("modalZerados");
      this.showToast(`"${gameData.nome}" foi salvo!`);

      if (isNew && typeof confetti === "function") {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#eab308", "#16a34a", "#22c55e", "#facc15"],
        });
      }
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
        const dNomeEl = document.getElementById("dNome");
        const existingD = id ? this.state.desistidos.find((g) => g.id === id) : null;
        const gameData = {
          id: id || Date.now().toString(),
          nome: dNomeEl?.value.trim(),
          coverUrl: dNomeEl?.dataset.coverUrl || existingD?.coverUrl || "",
          rawgRating: dNomeEl?.dataset.rawgRating || existingD?.rawgRating || "",
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
