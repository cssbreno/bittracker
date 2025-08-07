// Configurações globais do Chart.js
Chart.defaults.font.family = "'VT323', monospace";
Chart.defaults.color = "#e0e0e0";
Chart.defaults.borderColor = "#555";

// --- Gerenciamento de Estado (usando memória em vez de localStorage) ---
let state = {
  queroJogar: [],
  zerados: [],
  desistidos: [],
};

// Variáveis dos gráficos
let interesseChart, notaChart, motivoChart;

// --- Funções de Gráficos ---
function createCharts() {
  const interesseCtx = document
    .getElementById("interesseChart")
    .getContext("2d");
  interesseChart = new Chart(interesseCtx, {
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

  const notaCtx = document.getElementById("notaChart").getContext("2d");
  notaChart = new Chart(notaCtx, {
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

  const motivoCtx = document.getElementById("motivoChart").getContext("2d");
  motivoChart = new Chart(motivoCtx, {
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

function updateCharts() {
  // Gráfico de interesse
  const interesseCount = state.queroJogar.reduce(
    (acc, game) => {
      acc[game.interesse] = (acc[game.interesse] || 0) + 1;
      return acc;
    },
    { Baixo: 0, Médio: 0, Alto: 0 }
  );

  interesseChart.data.labels = Object.keys(interesseCount);
  interesseChart.data.datasets[0].data = Object.values(interesseCount);
  interesseChart.update();

  // Gráfico de notas
  const notaCount = state.zerados.reduce(
    (acc, game) => {
      if (game.nota) acc[game.nota - 1]++;
      return acc;
    },
    [0, 0, 0, 0, 0]
  );

  notaChart.data.datasets[0].data = notaCount;
  notaChart.update();

  // Estatísticas
  const totalZerados = state.zerados.length;
  document.getElementById("totalZerados").textContent = totalZerados;
  const totalHoras = state.zerados.reduce(
    (sum, game) => sum + (parseInt(game.tempoGasto) || 0),
    0
  );
  document.getElementById("tempoMedio").textContent =
    totalZerados > 0 ? `${(totalHoras / totalZerados).toFixed(1)}h` : "0h";

  // Gráfico de motivos de desistência
  const motivoCount = state.desistidos.reduce((acc, game) => {
    acc[game.motivo] = (acc[game.motivo] || 0) + 1;
    return acc;
  }, {});

  motivoChart.data.labels = Object.keys(motivoCount);
  motivoChart.data.datasets[0].data = Object.values(motivoCount);
  motivoChart.update();
}

// --- Funções de Renderização ---
function renderTables() {
  renderTable(
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
  renderTable(
    "zerados",
    "tableZerados",
    ["nome", "categoria", "nota", "plataforma", "tempoGasto", "avaliacao"],
    "green"
  );
  renderTable(
    "desistidos",
    "tableDesistidos",
    ["nome", "categoria", "motivo", "tempoGameplay", "observacoes"],
    "red"
  );
  updateCharts();
}

function renderTable(stateKey, tableId, columns, themeColor) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  const emptyStateEl = document.getElementById(
    `empty${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}`
  );
  tbody.innerHTML = "";

  if (state[stateKey].length === 0) {
    emptyStateEl.style.display = "block";
    document.getElementById(tableId).style.display = "none";
  } else {
    emptyStateEl.style.display = "none";
    document.getElementById(tableId).style.display = "table";

    state[stateKey].forEach((item) => {
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
        <button class="action-btn edit" onclick="openModal('modal${
          stateKey.charAt(0).toUpperCase() + stateKey.slice(1)
        }', '${item.id}')" title="Editar">
          ✏️
        </button>
        <button class="action-btn delete" onclick="deleteItem('${stateKey}', '${
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
function openModal(modalId, itemId = null) {
  const modalHandlers = {
    modalQueroJogar: () => handleQueroJogarModal(itemId),
    modalZerados: () => handleZeradosModal(itemId),
    modalDesistidos: () => handleDesistidosModal(itemId),
  };

  const modal = document.getElementById(modalId);
  const form = modal.querySelector("form");
  form.reset();
  form.querySelector('input[type="hidden"]').value = itemId || "";

  modalHandlers[modalId]?.();
  modal.style.display = "block";
}

// Helper functions to handle different modal types
function handleQueroJogarModal(itemId) {
  const item = itemId ? state.queroJogar.find((g) => g.id === itemId) : {};
  document.getElementById("qjNome").value = item.nome || "";
  document.getElementById("qjCategoria").value = item.categoria || "";
  document.getElementById("qjSubcategoria").value = item.subcategoria || "";
  document.getElementById("qjDataLancamento").value = item.dataLancamento || "";
  document.getElementById("qjInteresse").value = item.interesse || "Médio";
  document.getElementById("qjPlataformas").value = item.plataformas || "";
  document.getElementById("qjStatus").value = item.status || "Já Lançado";
  document.getElementById("qjTempoEstimado").value = item.tempoEstimado || "";
  document.getElementById("qjObservacoes").value = item.observacoes || "";
}

function handleZeradosModal(itemId) {
  const item = itemId ? state.zerados.find((g) => g.id === itemId) : {};
  document.getElementById("zNome").value = item.nome || "";
  document.getElementById("zCategoria").value = item.categoria || "";

  const form = document.getElementById("formZerados");
  const checkedStar = form.querySelector('input[name="rating"]:checked');
  if (checkedStar) checkedStar.checked = false;

  if (item.nota) {
    const starInput = form.querySelector(
      `input[name="rating"][value="${item.nota}"]`
    );
    if (starInput) starInput.checked = true;
  }

  document.getElementById("zDataZerei").value = item.dataZerei || "";
  document.getElementById("zPlataforma").value = item.plataforma || "";
  document.getElementById("zTempoGasto").value = item.tempoGasto || "";
  document.getElementById("zAvaliacao").value = item.avaliacao || "";
}

function handleDesistidosModal(itemId) {
  const item = itemId ? state.desistidos.find((g) => g.id === itemId) : {};
  document.getElementById("dNome").value = item.nome || "";
  document.getElementById("dCategoria").value = item.categoria || "";
  document.getElementById("dMotivo").value = item.motivo || "Chato";
  document.getElementById("dTempoGameplay").value = item.tempoGameplay || "";
  document.getElementById("dObservacoes").value = item.observacoes || "";
}
const modal = document.getElementById(modalId);
const form = modal.querySelector("form");
form.reset();

// Define o ID do item (para edição)
form.querySelector('input[type="hidden"]').value = itemId || "";

if (modalId === "modalQueroJogar") {
  const item = itemId ? state.queroJogar.find((g) => g.id === itemId) : {};
  document.getElementById("qjNome").value = item.nome || "";
  document.getElementById("qjCategoria").value = item.categoria || "";
  document.getElementById("qjSubcategoria").value = item.subcategoria || "";
  document.getElementById("qjDataLancamento").value = item.dataLancamento || "";
  document.getElementById("qjInteresse").value = item.interesse || "Médio";
  document.getElementById("qjPlataformas").value = item.plataformas || "";
  document.getElementById("qjStatus").value = item.status || "Já Lançado";
  document.getElementById("qjTempoEstimado").value = item.tempoEstimado || "";
  document.getElementById("qjObservacoes").value = item.observacoes || "";
} else if (modalId === "modalZerados") {
  const item = itemId ? state.zerados.find((g) => g.id === itemId) : {};
  document.getElementById("zNome").value = item.nome || "";
  document.getElementById("zCategoria").value = item.categoria || "";

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

  document.getElementById("zDataZerei").value = item.dataZerei || "";
  document.getElementById("zPlataforma").value = item.plataforma || "";
  document.getElementById("zTempoGasto").value = item.tempoGasto || "";
  document.getElementById("zAvaliacao").value = item.avaliacao || "";
} else if (modalId === "modalDesistidos") {
  const item = itemId ? state.desistidos.find((g) => g.id === itemId) : {};
  document.getElementById("dNome").value = item.nome || "";
  document.getElementById("dCategoria").value = item.categoria || "";
  document.getElementById("dMotivo").value = item.motivo || "Chato";
  document.getElementById("dTempoGameplay").value = item.tempoGameplay || "";
  document.getElementById("dObservacoes").value = item.observacoes || "";
}

modal.style.display = "block";

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// --- Componentes de UI ---
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
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

function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  document.getElementById("confirmMessage").textContent = message;
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
    yesBtn.removeEventListener("click", handleYes);
    noBtn.removeEventListener("click", handleNo);
  };

  yesBtn.addEventListener("click", handleYes);
  noBtn.addEventListener("click", handleNo);
}

// --- CRUD Operations ---
function deleteItem(stateKey, itemId, itemName) {
  showConfirmModal(`Tem certeza que quer apagar "${itemName}"?`, () => {
    state[stateKey] = state[stateKey].filter((item) => item.id !== itemId);
    renderTables();
    showToast(`"${itemName}" foi apagado.`, "error");
  });
}

// --- Navegação por Abas ---
function switchTab(targetId) {
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
function exportToCsv(data, filename, headers) {
  if (!data || data.length === 0) {
    showToast("Não há dados para exportar.", "error");
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

  showToast(`${filename} exportado!`);
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  createCharts();
  renderTables();
  switchTab("tabQueroJogar");

  // Navegação entre abas
  document
    .getElementById("tabBtnQueroJogar")
    .addEventListener("click", () => switchTab("tabQueroJogar"));
  document
    .getElementById("tabBtnZerados")
    .addEventListener("click", () => switchTab("tabZerados"));
  document
    .getElementById("tabBtnDesistidos")
    .addEventListener("click", () => switchTab("tabDesistidos"));

  // Botões de adicionar
  document
    .getElementById("addQueroJogarBtn")
    .addEventListener("click", () => openModal("modalQueroJogar"));
  document
    .getElementById("addZeradoBtn")
    .addEventListener("click", () => openModal("modalZerados"));
  document
    .getElementById("addDesistidoBtn")
    .addEventListener("click", () => openModal("modalDesistidos"));

  // Formulários
  document
    .getElementById("formQueroJogar")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("queroJogarId").value;
      const gameData = {
        id: id || Date.now().toString(),
        nome: document.getElementById("qjNome").value,
        categoria: document.getElementById("qjCategoria").value,
        subcategoria: document.getElementById("qjSubcategoria").value,
        dataLancamento: document.getElementById("qjDataLancamento").value,
        interesse: document.getElementById("qjInteresse").value,
        plataformas: document.getElementById("qjPlataformas").value,
        status: document.getElementById("qjStatus").value,
        tempoEstimado: document.getElementById("qjTempoEstimado").value,
        observacoes: document.getElementById("qjObservacoes").value,
      };

      if (id) {
        const index = state.queroJogar.findIndex((g) => g.id === id);
        state.queroJogar[index] = gameData;
      } else {
        state.queroJogar.push(gameData);
      }

      renderTables();
      closeModal("modalQueroJogar");
      showToast(`"${gameData.nome}" foi salvo!`);
    });

  document
    .getElementById("formZerados")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("zeradoId").value;
      const rating = e.target.querySelector('input[name="rating"]:checked');
      const gameData = {
        id: id || Date.now().toString(),
        nome: document.getElementById("zNome").value,
        categoria: document.getElementById("zCategoria").value,
        nota: rating ? parseInt(rating.value) : 0,
        dataZerei: document.getElementById("zDataZerei").value,
        plataforma: document.getElementById("zPlataforma").value,
        tempoGasto: document.getElementById("zTempoGasto").value,
        avaliacao: document.getElementById("zAvaliacao").value,
      };

      if (id) {
        const index = state.zerados.findIndex((g) => g.id === id);
        state.zerados[index] = gameData;
      } else {
        state.zerados.push(gameData);
      }

      renderTables();
      closeModal("modalZerados");
      showToast(`"${gameData.nome}" foi salvo!`);
    });

  document
    .getElementById("formDesistidos")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("desistidoId").value;
      const gameData = {
        id: id || Date.now().toString(),
        nome: document.getElementById("dNome").value,
        categoria: document.getElementById("dCategoria").value,
        motivo: document.getElementById("dMotivo").value,
        tempoGameplay: document.getElementById("dTempoGameplay").value,
        observacoes: document.getElementById("dObservacoes").value,
      };

      if (id) {
        const index = state.desistidos.findIndex((g) => g.id === id);
        state.desistidos[index] = gameData;
      } else {
        state.desistidos.push(gameData);
      }

      renderTables();
      closeModal("modalDesistidos");
      showToast(`"${gameData.nome}" foi salvo!`);
    });

  // Botões de exportação
  document
    .getElementById("exportQueroJogarBtn")
    .addEventListener("click", () =>
      exportToCsv(state.queroJogar, "jogos_para_jogar.csv", [
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
    .addEventListener("click", () =>
      exportToCsv(state.zerados, "jogos_zerados.csv", [
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
    .addEventListener("click", () =>
      exportToCsv(state.desistidos, "jogos_desistidos.csv", [
        "nome",
        "categoria",
        "motivo",
        "tempoGameplay",
        "observacoes",
      ])
    );

  // Fechar modal ao clicar fora
  window.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  });
});
