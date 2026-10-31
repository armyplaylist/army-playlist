const STORAGE_KEYS = {
  official: "armyCombo_official_v1",
  community: "armyCombo_community_v1"
};

const defaultOfficial = [
  {
    id: "demo-1",
    name: "Playlist de ejemplo · SWIM focus",
    url: "https://open.spotify.com/",
    duration: 60,
    swim: 12,
    normal: 5,
    come: 2
  },
  {
    id: "demo-2",
    name: "Playlist de ejemplo · ARIRANG mix",
    url: "https://open.spotify.com/",
    duration: 90,
    swim: 10,
    normal: 10,
    come: 3
  }
];

let officialPlaylists = load(STORAGE_KEYS.official, defaultOfficial);
let communityPlaylists = load(STORAGE_KEYS.community, []);

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveLibraries() {
  localStorage.setItem(
    STORAGE_KEYS.official,
    JSON.stringify(officialPlaylists)
  );

  localStorage.setItem(
    STORAGE_KEYS.community,
    JSON.stringify(communityPlaylists)
  );
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function isSpotifyPlaylist(url) {
  try {
    const parsed = new URL(url);

    return (
      (parsed.hostname === "open.spotify.com" ||
       parsed.hostname === "www.open.spotify.com") &&
      parsed.pathname.includes("/playlist/")
    );
  } catch {
    return false;
  }
}

// NAVEGACIÓN

function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === viewId
    );
  });

  document.getElementById("mainNav").classList.remove("open");

  document.getElementById("menuToggle")
    .setAttribute("aria-expanded", "false");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.go);
  });
});

document.getElementById("menuToggle")
  .addEventListener("click", () => {

    const nav = document.getElementById("mainNav");

    const isOpen = nav.classList.toggle("open");

    document.getElementById("menuToggle")
      .setAttribute("aria-expanded", String(isOpen));
  });


// TARJETAS DE PLAYLISTS

function playlistCard(playlist, statusLabel = "") {

  return `
    <article class="playlist-card">

      <div class="playlist-top">
        <div>
          <h3>${escapeHTML(playlist.name)}</h3>

          <p>
            ${Number(playlist.duration)} minutos · ${statusLabel}
          </p>
        </div>

        <span class="pill">♫ Spotify</span>
      </div>

      <div class="playlist-meta">
        <span>SWIM: ${Number(playlist.swim)}</span>
        <span>NORMAL: ${Number(playlist.normal)}</span>
        <span>COME OVER: ${Number(playlist.come)}</span>
      </div>

      <a
        class="spotify-link"
        href="${escapeHTML(playlist.url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir en Spotify ↗
      </a>

    </article>
  `;
}


// BIBLIOTECAS

function renderLibraries() {

  document.getElementById("officialList").innerHTML =
    officialPlaylists.length
      ? officialPlaylists.map(item =>
          playlistCard(item, "Biblioteca oficial")
        ).join("")
      : '<p class="helper">Todavía no hay playlists oficiales registradas.</p>';

  document.getElementById("communityList").innerHTML =
    communityPlaylists.length
      ? communityPlaylists.map(item =>
          playlistCard(item, "Pendiente de revisión")
        ).join("")
      : '<p class="helper">Todavía no hay aportes comunitarios.</p>';

  document.getElementById("officialCount").textContent =
    `${officialPlaylists.length} playlists`;

  document.getElementById("communityCount").textContent =
    `${communityPlaylists.length} aportes`;
}


// REGISTRO DE PLAYLISTS

function getFormPlaylist(form) {

  const data = new FormData(form);

  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),

    name: String(data.get("name")).trim(),
    url: String(data.get("url")).trim(),
    duration: Number(data.get("duration")),
    swim: Number(data.get("swim") || 0),
    normal: Number(data.get("normal") || 0),
    come: Number(data.get("come") || 0)
  };
}


// PLAYLISTS OFICIALES

document.getElementById("officialForm")
  .addEventListener("submit", event => {

    event.preventDefault();

    const form = event.currentTarget;

    const playlist = getFormPlaylist(form);

    if (!isSpotifyPlaylist(playlist.url)) {
      alert("Por favor, ingresa un enlace válido de una playlist de Spotify.");
      return;
    }

    officialPlaylists.push(playlist);

    saveLibraries();
    renderLibraries();

    form.reset();
  });


// PLAYLISTS DE LA COMUNIDAD

document.getElementById("communityForm")
  .addEventListener("submit", event => {

    event.preventDefault();

    const form = event.currentTarget;

    const playlist = getFormPlaylist(form);

    if (!isSpotifyPlaylist(playlist.url)) {
      alert("Por favor, ingresa un enlace válido de una playlist de Spotify.");
      return;
    }

    communityPlaylists.push(playlist);

    saveLibraries();
    renderLibraries();

    form.reset();

    document.getElementById("communityMessage").textContent =
      "¡Gracias por compartir! Tu playlist quedó registrada localmente como pendiente de revisión.";
  });


// TIEMPO PERSONALIZADO

document.getElementById("timeSelect")
  .addEventListener("change", event => {

    document.getElementById("customTimeLabel")
      .classList.toggle(
        "hidden",
        event.target.value !== "custom"
      );
  });

function selectedMinutes() {

  const value = document.getElementById("timeSelect").value;

  return value === "custom"
    ? Math.max(
        1,
        Number(document.getElementById("customTime").value || 1)
      )
    : Number(value);
}


// CALCULADORA DE COMBOS

function findBestCombos(playlists, minutes, goals) {

  const eligible = playlists.filter(item =>
    Number(item.duration) <= minutes
  );

  const candidates = [];

  for (let i = 0; i < eligible.length; i++) {

    for (let j = i + 1; j < eligible.length; j++) {

      const first = eligible[i];
      const second = eligible[j];

      const totalMinutes =
        Number(first.duration) + Number(second.duration);

      if (totalMinutes > minutes) continue;

      const totals = [
        Number(first.swim) + Number(second.swim),
        Number(first.normal) + Number(second.normal),
        Number(first.come) + Number(second.come)
      ];

      const achieved = totals.reduce((sum, count, index) => {

        return sum + (
          goals[index] > 0
            ? Math.min(count, goals[index]) / goals[index]
            : 1
        );

      }, 0);

      const completion = goals.reduce((sum, goal, index) => {

        return sum + (
          goal > 0
            ? Math.min(totals[index], goal) / goal
            : 1
        );

      }, 0) / goals.length;

      candidates.push({
        first,
        second,
        totalMinutes,
        totals,
        score: achieved,
        completion
      });
    }
  }

  return candidates
    .sort((a, b) =>
      b.score - a.score ||
      a.totalMinutes - b.totalMinutes
    )
    .slice(0, 5);
}


// BOTÓN BUSCAR COMBOS

document.getElementById("calculateButton")
  .addEventListener("click", () => {

    const source =
      document.getElementById("comboSource").value;

    const playlists =
      source === "official"
        ? officialPlaylists
        : [];

    const minutes = selectedMinutes();

    const goals = [
      Number(document.getElementById("goalSwim").value || 0),
      Number(document.getElementById("goalNormal").value || 0),
      Number(document.getElementById("goalCome").value || 0)
    ];

    const results =
      document.getElementById("comboResults");

    if (!playlists.length) {

      results.innerHTML = `
        <div class="notice">
          La biblioteca ARMY no tiene playlists aprobadas todavía.
          Los aportes enviados quedan pendientes.
        </div>
      `;

      return;
    }

    const combos =
      findBestCombos(playlists, minutes, goals);

    if (!combos.length) {

      results.innerHTML = `
        <div class="notice">
          No encontramos una combinación de dos playlists
          dentro de ese tiempo. Prueba con más minutos
          o registra más playlists.
        </div>
      `;

      return;
    }

    results.innerHTML = `
      <div class="section-heading">
        <h2>Combinaciones sugeridas</h2>
        <span class="count">${combos.length} resultados</span>
      </div>

      ${combos.map((combo, index) => `

        <article class="result-card">

          <span class="pill">
            ${index === 0
              ? "Mejor coincidencia"
              : `Opción ${index + 1}`}
          </span>

          <h3>
            ${escapeHTML(combo.first.name)}
            +
            ${escapeHTML(combo.second.name)}
          </h3>

          <p>
            Tiempo estimado: ${combo.totalMinutes} minutos
            · Objetivos cubiertos:
            ${Math.round(combo.completion * 100)}%
          </p>

          <div class="result-counts">
            <span>SWIM: ${combo.totals[0]} / ${goals[0]}</span>
            <span>NORMAL: ${combo.totals[1]} / ${goals[1]}</span>
            <span>COME OVER: ${combo.totals[2]} / ${goals[2]}</span>
          </div>

          <a
            class="spotify-link"
            href="${escapeHTML(combo.first.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Playlist 1 ↗
          </a>

          &nbsp;·&nbsp;

          <a
            class="spotify-link"
            href="${escapeHTML(combo.second.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Playlist 2 ↗
          </a>

        </article>

      `).join("")}

      <p class="helper">
        Estimación basada en los datos ingresados.
        Las apariciones en una playlist no garantizan
        que Spotify contabilice una reproducción.
      </p>
    `;
  });


// OBJETIVOS

function renderGoals() {

  const goals = [

    {
      name: "SWIM",
      target: Number(
        document.getElementById("goalSwim").value || 120
      )
    },

    {
      name: "NORMAL",
      target: Number(
        document.getElementById("goalNormal").value || 80
      )
    },

    {
      name: "COME OVER",
      target: Number(
        document.getElementById("goalCome").value || 20
      )
    },

    {
      name: "B-sides",
      target: null
    }

  ];

  const markup = goals.map(goal => `

    <article class="goal-item">

      <strong>${goal.name}</strong>

      <small>
        ${
          goal.target === null
            ? "Prioridad máxima · sin límite fijado"
            : `Meta: ${goal.target} apariciones previstas`
        }
      </small>

      <div class="progress-track">
        <span style="width:${goal.target === null ? 100 : 0}%"></span>
      </div>

    </article>

  `).join("");

  document.getElementById("goalBoard").innerHTML =
    markup;

  document.getElementById("homeGoals").innerHTML =
    goals.map(goal => `

      <article class="goal-tile">

        <strong>${goal.name}</strong>

        <small>
          ${
            goal.target === null
              ? "Prioridad máxima"
              : `Meta: ${goal.target}`
          }
        </small>

      </article>

    `).join("");
}


// ACTUALIZAR OBJETIVOS

["goalSwim", "goalNormal", "goalCome"].forEach(id => {

  document.getElementById(id)
    .addEventListener("input", renderGoals);

});


// INICIALIZAR PÁGINA

renderLibraries();
renderGoals();
