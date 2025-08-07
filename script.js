// Configurações globais do Chart.js
if (typeof Chart !== "undefined") {
  Chart.defaults.font.family = "'VT323', monospace";
  Chart.defaults.color = "#e0e0e0";
  Chart.defaults.borderColor = "#555";
}

// --- Gerenciamento de Estado ---
class GameManager {
  constructor() {
    this.state = {
      queroJogar: [],
      zerados: [],
      desistidos: [],
    };
    this.interesseChart = null;
    this.notaChart = null;
    this.motivoChart = null;
    this.init();
  }

  init() {
    this.createCharts();
    this.renderTables();
    this.switchTab("tabQueroJogar");
    this.bindEvents();
  }

  // --- Funções de Gráficos ---
  createCharts() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not loaded");
      return;
    }

    const interesseCtx = document
      .getElementById("interesseChart")
      ?.getContext("2d");
    if (interesseCtx) {
      this.interesseChart = new Chart(interesseCtx, {
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
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    }

    const notaCtx = document.getElementById("notaChart")?.getContext("2d");
    if (notaCtx) {
      this.notaChart = new Chart(notaCtx, {
        type: "bar",
        data: {
          labels: ["★", "★★", "★★★", "★★★★", "★★★★★"],
          datasets: [
            {
              label: "Nº de Jogos",
              data: [],
              backgroundColor: "#16a34a",
              borderColor: "#22c55e",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    const motivoCtx = document.getElementById("motivoChart")?.getContext("2d");
    if (motivoCtx) {
      this.motivoChart = new Chart(motivoCtx, {
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
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: {
                  size: 12,
                },
              },
            },
          },
        },
      });
    }
  }

  updateCharts() {
    // Gráfico de interesse
    if (this.interesseChart) {
      const interesseCount = this.state.queroJogar.reduce(
        (acc, game) => {
          acc[game.interesse] = (acc[game.interesse] || 0) + 1;
          return acc;
        },
        { Baixo: 0, Médio: 0, Alto: 0 }
      );

      this.interesseChart.data.labels = Object.keys(interesseCount);
      this.interesseChart.data.datasets[0].data = Object.values(interesseCount);
      this.interesseChart.update();
    }

    // Gráfico de notas
    if (this.notaChart) {
      const notaCount = this.state.zerados.reduce(
        (acc, game) => {
          if (game.nota) acc[game.nota - 1]++;
          return acc;
        },
        [0, 0, 0, 0, 0]
      );

      this.notaChart.data.datasets[0].data = notaCount;
      this.notaChart.update();
    }

    // Estatísticas
    const totalZerados = this.state.zerados.length;
    const totalZeradosEl = document.getElementById("totalZerados");
    if (totalZeradosEl) totalZeradosEl.textContent = totalZerados;

    const totalHoras = this.state.zerados.reduce(
      (sum, game) => sum + (parseInt(game.tempoGasto) || 0),
      0
    );
    const tempoMedioEl = document.getElementById("tempoMedio");
    if (tempoMedioEl) {
      tempoMedioEl.textContent =
        totalZerados > 0 ? `${(totalHoras / totalZerados).toFixed(1)}h` : "0h";
    }

    // Gráfico de motivos de desistência
    if (this.motivoChart) {
      const motivoCount = this.state.desistidos.reduce((acc, game) => {
        acc[game.motivo] = (acc[game.motivo] || 0) + 1;
        return acc;
      }, {});

      this.motivoChart.data.labels = Object.keys(motivoCount);
      this.motivoChart.data.datasets[0].data = Object.values(motivoCount);
      this.motivoChart.update();
    }
  }

  // --- Funções de Renderização ---
  renderTables() {
    this.renderTable(
      "queroJogar",
      "tableQueroJogar",
      [
        "nome",
        "categoria",
        "dataLancamento",
        "interesse",
        "plataformas",
        "status",
      ],
      "cyan"
    );
    this.renderTable(
      "zerados",
      "tableZerados",
      ["nome", "categoria", "nota", "plataforma", "tempoGasto"],
      "green"
    );
    this.renderTable(
      "desistidos",
      "tableDesistidos",
      ["nome", "categoria", "motivo", "tempoGameplay", "observacoes"],
      "red"
    );
    this.updateCharts();
  }

  renderTable(stateKey, tableId, columns, themeColor) {
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

      this.state[stateKey].forEach((item) => {
        const tr = document.createElement("tr");

        const cellsHTML = columns
          .map((col) => {
            let value = item[col] || "";
            if (col === "nota") {
              return `<td class="text-yellow-400 text-2xl">${
                "★".repeat(item.nota || 0) + "☆".repeat(5 - (item.nota || 0))
              }</td>`;
            }
            return `<td>${value}</td>`;
          })
          .join("");

        tr.innerHTML = cellsHTML;

        // Célula de ações
        const actionsCell = document.createElement("td");
        actionsCell.innerHTML = `
          <button class="action-btn edit" onclick="gameManager.openModal('modal${
            stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
          }', '${item.id}')" title="Editar">
            ✏️
          </button>
          <button class="action-btn delete" onclick="gameManager.deleteItem('${stateKey}', '${
          item.id
        }', '${item.nome}')" title="Excluir">
            🗑️
          </button>
        `;
        tr.appendChild(actionsCell);

        tbody.appendChild(tr);
      });
    }
  }

  // --- Gerenciamento de Modals ---
  openModal(modalId, itemId = null) {
    const modal = document.getElementById(modalId);
    const form = modal?.querySelector("form");
    if (!form) return;

    form.reset();

    // Define o ID do item (para edição)
    const hiddenInput = form.querySelector('input[type="hidden"]');
    if (hiddenInput) hiddenInput.value = itemId || "";

    if (modalId === "modalQueroJogar") {
      const item = itemId
        ? this.state.queroJogar.find((g) => g.id === itemId)
        : {};
      const fields = {
        qjNome: item.nome || "",
        qjCategoria: item.categoria || "",
        qjSubcategoria: item.subcategoria || "",
        qjDataLancamento: item.dataLancamento || "",
        qjInteresse: item.interesse || "Médio",
        qjPlataformas: item.plataformas || "",
        qjStatus: item.status || "Já Lançado",
        qjTempoEstimado: item.tempoEstimado || "",
        qjObservacoes: item.observacoes || "",
      };

      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      });
    } else if (modalId === "modalZerados") {
      const item = itemId
        ? this.state.zerados.find((g) => g.id === itemId)
        : {};
      const fields = {
        zNome: item.nome || "",
        zCategoria: item.categoria || "",
        zDataZerei: item.dataZerei || "",
        zPlataforma: item.plataforma || "",
        zTempoGasto: item.tempoGasto || "",
        zAvaliacao: item.avaliacao || "",
      };

      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      });

      // Limpar seleção de estrelas
      const checkedStar = form.querySelector('input[name="rating"]:checked');
      if (checkedStar) checkedStar.checked = false;

      // Definir nota se existir
      if (item.nota) {
        const starInput = form.querySelector(
          `input[name="rating"][value="${item.nota}"]`
        );
        if (starInput) starInput.checked = true;
      }
    } else if (modalId === "modalDesistidos") {
      const item = itemId
        ? this.state.desistidos.find((g) => g.id === itemId)
        : {};
      const fields = {
        dNome: item.nome || "",
        dCategoria: item.categoria || "",
        dMotivo: item.motivo || "Chato",
        dTempoGameplay: item.tempoGameplay || "",
        dObservacoes: item.observacoes || "",
      };

      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      });
    }

    modal.style.display = "block";
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
  }

  // --- Componentes de UI ---
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
    modal.style.display = "block";

    const yesBtn = document.getElementById("confirmBtnYes");
    const noBtn = document.getElementById("confirmBtnNo");

    const handleYes = () => {
      onConfirm();
      cleanup();
    };
    const handleNo = () => cleanup();

    const cleanup = () => {
      modal.style.display = "none";
      yesBtn?.removeEventListener("click", handleYes);
      noBtn?.removeEventListener("click", handleNo);
    };

    yesBtn?.addEventListener("click", handleYes);
    noBtn?.addEventListener("click", handleNo);
  }

  // --- CRUD Operations ---
  deleteItem(stateKey, itemId, itemName) {
    this.showConfirmModal(`Tem certeza que quer apagar "${itemName}"?`, () => {
      this.state[stateKey] = this.state[stateKey].filter(
        (item) => item.id !== itemId
      );
      this.renderTables();
      this.showToast(`"${itemName}" foi apagado.`, "error");
    });
  }

  // --- Navegação por Abas ---
  switchTab(targetId) {
    const tabs = document.querySelectorAll(".tab-content");
    const tabBtns = document.querySelectorAll(".tab-btn");

    tabs.forEach((tab) => {
      tab.style.display = tab.id === targetId ? "block" : "none";
    });

    tabBtns.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.id === `tabBtn${targetId.replace("tab", "")}`
      );
    });
  }

  // --- Exportação CSV ---
  exportToCsv(data, filename, headers) {
    if (!data || data.length === 0) {
      this.showToast("Não há dados para exportar.", "error");
      return;
    }

    const csvRows = [headers.join(",")];
    for (const item of data) {
      const values = headers.map(
        (header) => `"${(item[header] || "").toString().replace(/"/g, '""')}"`
      );
      csvRows.push(values.join(","));
    }

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast(`${filename} exportado!`);
  }

  // --- Event Listeners ---
  bindEvents() {
    // Navegação entre abas
    document
      .getElementById("tabBtnQueroJogar")
      ?.addEventListener("click", () => this.switchTab("tabQueroJogar"));
    document
      .getElementById("tabBtnZerados")
      ?.addEventListener("click", () => this.switchTab("tabZerados"));
    document
      .getElementById("tabBtnDesistidos")
      ?.addEventListener("click", () => this.switchTab("tabDesistidos"));

    // Botões de adicionar
    document
      .getElementById("addQueroJogarBtn")
      ?.addEventListener("click", () => this.openModal("modalQueroJogar"));
    document
      .getElementById("addZeradoBtn")
      ?.addEventListener("click", () => this.openModal("modalZerados"));
    document
      .getElementById("addDesistidoBtn")
      ?.addEventListener("click", () => this.openModal("modalDesistidos"));

    // Formulários
    document
      .getElementById("formQueroJogar")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("queroJogarId")?.value;
        const gameData = {
          id: id || Date.now().toString(),
          nome: document.getElementById("qjNome")?.value || "",
          categoria: document.getElementById("qjCategoria")?.value || "",
          subcategoria: document.getElementById("qjSubcategoria")?.value || "",
          dataLancamento:
            document.getElementById("qjDataLancamento")?.value || "",
          interesse: document.getElementById("qjInteresse")?.value || "Médio",
          plataformas: document.getElementById("qjPlataformas")?.value || "",
          status: document.getElementById("qjStatus")?.value || "Já Lançado",
          tempoEstimado:
            document.getElementById("qjTempoEstimado")?.value || "",
          observacoes: document.getElementById("qjObservacoes")?.value || "",
        };

        if (id) {
          const index = this.state.queroJogar.findIndex((g) => g.id === id);
          this.state.queroJogar[index] = gameData;
        } else {
          this.state.queroJogar.push(gameData);
        }

        this.renderTables();
        this.closeModal("modalQueroJogar");
        this.showToast(`"${gameData.nome}" foi salvo!`);
      });

    document.getElementById("formZerados")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("zeradoId")?.value;
      const rating = e.target.querySelector('input[name="rating"]:checked');
      const gameData = {
        id: id || Date.now().toString(),
        nome: document.getElementById("zNome")?.value || "",
        categoria: document.getElementById("zCategoria")?.value || "",
        nota: rating ? parseInt(rating.value) : 0,
        dataZerei: document.getElementById("zDataZerei")?.value || "",
        plataforma: document.getElementById("zPlataforma")?.value || "",
        tempoGasto: document.getElementById("zTempoGasto")?.value || "",
        avaliacao: document.getElementById("zAvaliacao")?.value || "",
      };

      if (id) {
        const index = this.state.zerados.findIndex((g) => g.id === id);
        this.state.zerados[index] = gameData;
      } else {
        this.state.zerados.push(gameData);
      }

      this.renderTables();
      this.closeModal("modalZerados");
      this.showToast(`"${gameData.nome}" foi salvo!`);
    });

    document
      .getElementById("formDesistidos")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("desistidoId")?.value;
        const gameData = {
          id: id || Date.now().toString(),
          nome: document.getElementById("dNome")?.value || "",
          categoria: document.getElementById("dCategoria")?.value || "",
          motivo: document.getElementById("dMotivo")?.value || "Chato",
          tempoGameplay: document.getElementById("dTempoGameplay")?.value || "",
          observacoes: document.getElementById("dObservacoes")?.value || "",
        };

        if (id) {
          const index = this.state.desistidos.findIndex((g) => g.id === id);
          this.state.desistidos[index] = gameData;
        } else {
          this.state.desistidos.push(gameData);
        }

        this.renderTables();
        this.closeModal("modalDesistidos");
        this.showToast(`"${gameData.nome}" foi salvo!`);
      });

    // Botões de exportação
    document
      .getElementById("exportQueroJogarBtn")
      ?.addEventListener("click", () =>
        this.exportToCsv(this.state.queroJogar, "jogos_para_jogar.csv", [
          "nome",
          "categoria",
          "subcategoria",
          "dataLancamento",
          "interesse",
          "plataformas",
          "status",
          "tempoEstimado",
          "observacoes",
        ])
      );

    document
      .getElementById("exportZeradosBtn")
      ?.addEventListener("click", () =>
        this.exportToCsv(this.state.zerados, "jogos_zerados.csv", [
          "nome",
          "categoria",
          "nota",
          "dataZerei",
          "plataforma",
          "tempoGasto",
          "avaliacao",
        ])
      );

    document
      .getElementById("exportDesistidosBtn")
      ?.addEventListener("click", () =>
        this.exportToCsv(this.state.desistidos, "jogos_desistidos.csv", [
          "nome",
          "categoria",
          "motivo",
          "tempoGameplay",
          "observacoes",
        ])
      );

    // Fechar modal ao clicar fora
    window.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
      }
    });
  }
}

// Instância global
let gameManager;

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  gameManager = new GameManager();
});
