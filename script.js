const STORAGE_KEYS = {
  official: "armyCombo_official_v1",
  community: "armyCombo_community_v1"
};


// CATÁLOGO MUSICAL DESDE JSON

let ARIRANG_TRACKS = [];

async function loadDiscography() {
try {
const response = await fetch("discografia.json");

if (!response.ok) {
  throw new Error("No se pudo cargar la discografía");
}

const data = await response.json();

const bts = data.artists.find(
  artist => artist.id === "bts"
);

const arirang = bts.releases.find(
  release => release.id === "arirang-2026"
);

ARIRANG_TRACKS = arirang.tracks.map(track => ({
  name: track.title,
  type: ["SWIM", "NORMAL"].includes(track.title)
    ? "main"
    : "bside",
  versions: []
}));

renderAlbumCatalog();

} catch (error) {
console.error("Error cargando discografía:", error);
}
}


// PLAYLISTS DE EJEMPLO

const defaultOfficial = [
  {
    id: "demo-1",
    name: "Playlist de ejemplo · SWIM focus",
    url: "https://open.spotify.com/",
    duration: 60,
    swim: 12,
    normal: 5,
    come: 2,
    bsides: 10,
    swimVersions: []
  },
  {
    id: "demo-2",
    name: "Playlist de ejemplo · ARIRANG mix",
    url: "https://open.spotify.com/",
    duration: 90,
    swim: 10,
    normal: 10,
    come: 3,
    bsides: 15,
    swimVersions: []
  }
];

let officialPlaylists = load(
  STORAGE_KEYS.official,
  defaultOfficial
);

let communityPlaylists = load(
  STORAGE_KEYS.community,
  []
);


// ALMACENAMIENTO

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


// UTILIDADES

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function numberValue(value) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0
    ? number
    : 0;
}

function makeId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function isSpotifyPlaylist(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.hostname === "open.spotify.com" &&
      /^\/playlist\/[a-zA-Z0-9]+\/?$/.test(parsed.pathname)
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


// CATÁLOGO VISUAL DE ARIRANG

function renderAlbumCatalog() {
  const trackList = document.querySelector("#albumes .track-list");

  if (!trackList) return;

  trackList.innerHTML = ARIRANG_TRACKS.map(track => `
    <article class="track-card">

      <div class="track-cover">
        ${escapeHTML(track.name.charAt(0).toUpperCase())}
      </div>

      <div>
        <strong>${escapeHTML(track.name)}</strong>

        <small>
          ${track.type === "main"
            ? "Canción prioritaria"
            : "B-side"}
          · Clean / Explicit
        </small>
      </div>

      <span class="pill">
        ${track.type === "main" ? "Prioridad alta" : "B-side"}
      </span>

    </article>
  `).join("");
}


// VERSIONES DE SWIM

function parseSwimVersions(value) {
  return String(value || "")
    .split(",")
    .map(version => version.trim())
    .filter(Boolean);
}


// TARJETAS DE PLAYLISTS

function playlistCard(playlist, statusLabel = "") {
  const versions = Array.isArray(playlist.swimVersions)
    ? playlist.swimVersions
    : [];

  return `
    <article class="playlist-card">

      <div class="playlist-top">
        <div>
          <h3>${escapeHTML(playlist.name)}</h3>

          <p>
            ${numberValue(playlist.duration)} minutos ·
            ${escapeHTML(statusLabel)}
          </p>
        </div>

        <span class="pill">♫ Spotify</span>
      </div>

      <div class="playlist-meta">
        <span>SWIM: ${numberValue(playlist.swim)}</span>
        <span>NORMAL: ${numberValue(playlist.normal)}</span>
        <span>COME OVER: ${numberValue(playlist.come)}</span>
        <span>B-sides: ${numberValue(playlist.bsides)}</span>
      </div>

      ${
        versions.length
          ? `
            <div class="version-list">
              <strong>Versiones de SWIM:</strong>

              <ul>
                ${versions.map(version =>
                  `<li>${escapeHTML(version)}</li>`
                ).join("")}
              </ul>
            </div>
          `
          : ""
      }

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
          playlistCard(
            item,
            item.status === "approved"
              ? "Aprobada"
              : "Pendiente de revisión"
          )
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
    id: makeId(),

    name: String(data.get("name") || "").trim(),
    url: String(data.get("url") || "").trim(),

    duration: numberValue(data.get("duration")),

    swim: numberValue(data.get("swim")),
    normal: numberValue(data.get("normal")),
    come: numberValue(data.get("come")),
    bsides: numberValue(data.get("bsides")),

    swimVersions: parseSwimVersions(
      data.get("swimVersions")
    )
  };
}


// PLAYLISTS OFICIALES

document.getElementById("officialForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;
    const playlist = getFormPlaylist(form);

    if (!isSpotifyPlaylist(playlist.url)) {
      alert("Ingresa un enlace válido de una playlist de Spotify.");
      return;
    }

    if (!playlist.duration) {
      alert("Ingresa una duración válida.");
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
      alert("Ingresa un enlace válido de una playlist de Spotify.");
      return;
    }

    if (!playlist.duration) {
      alert("Ingresa una duración válida.");
      return;
    }

    playlist.status = "pending";

    communityPlaylists.push(playlist);

    saveLibraries();
    renderLibraries();

    form.reset();

    document.getElementById("communityMessage").textContent =
      "¡Gracias por compartir! Tu playlist quedó registrada como pendiente de revisión en este dispositivo.";
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
    ? numberValue(document.getElementById("customTime").value)
    : numberValue(value);
}


// GENERADOR DE COMBOS

function findBestCombos(playlists, minutes, goals) {
  const eligible = playlists.filter(item =>
    numberValue(item.duration) > 0 &&
    numberValue(item.duration) <= minutes
  );

  const candidates = [];
  const maxPlaylists = 4;

  function evaluateCombo(combo) {
    const totalMinutes = combo.reduce(
      (sum, item) => sum + numberValue(item.duration),
      0
    );

    const totals = {
      swim: combo.reduce(
        (sum, item) => sum + numberValue(item.swim), 0
      ),

      normal: combo.reduce(
        (sum, item) => sum + numberValue(item.normal), 0
      ),

      come: combo.reduce(
        (sum, item) => sum + numberValue(item.come), 0
      ),

      bsides: combo.reduce(
        (sum, item) => sum + numberValue(item.bsides), 0
      )
    };

    const versions = [
      ...new Set(
        combo.flatMap(item =>
          Array.isArray(item.swimVersions)
            ? item.swimVersions
            : []
        )
      )
    ];

    let completion = 0;
    let activeGoals = 0;

    const achieved = [
      totals.swim,
      totals.normal,
      totals.come
    ];

    goals.forEach((goal, index) => {
      if (goal > 0) {
        completion += Math.min(
          achieved[index],
          goal
        ) / goal;

        activeGoals++;
      }
    });

    completion = activeGoals
      ? completion / activeGoals
      : 0;

    const score =
      completion * 1000 +
      totals.bsides * 2 +
      versions.length;

    candidates.push({
      playlists: [...combo],
      totalMinutes,
      totals,
      versions,
      completion,
      score
    });
  }

  function search(start, combo) {
    if (combo.length > 0) {
      evaluateCombo(combo);
    }

    if (combo.length >= maxPlaylists) return;

    for (let i = start; i < eligible.length; i++) {
      const nextCombo = [...combo, eligible[i]];

      const time = nextCombo.reduce(
        (sum, item) => sum + numberValue(item.duration),
        0
      );

      if (time <= minutes) {
        search(i + 1, nextCombo);
      }
    }
  }

  search(0, []);

  return candidates
    .sort((a, b) =>
      b.score - a.score ||
      b.totals.bsides - a.totals.bsides ||
      a.totalMinutes - b.totalMinutes
    )
    .slice(0, 5);
}


// BUSCAR COMBOS

document.getElementById("calculateButton")
  .addEventListener("click", () => {
    const source =
      document.getElementById("comboSource").value;

    let playlists = [];

    if (source === "official") {
      playlists = officialPlaylists;
    }

    if (source === "community") {
      playlists = communityPlaylists.filter(
        item => item.status === "approved"
      );
    }

    const minutes = selectedMinutes();

    const goals = [
      numberValue(document.getElementById("goalSwim").value),
      numberValue(document.getElementById("goalNormal").value),
      numberValue(document.getElementById("goalCome").value)
    ];

    const results =
      document.getElementById("comboResults");

    if (!minutes) {
      results.innerHTML = `
        <div class="notice">
          Ingresa una cantidad válida de minutos.
        </div>
      `;
      return;
    }

    if (!playlists.length) {
      results.innerHTML = `
        <div class="notice">
          No hay playlists disponibles en esta biblioteca.
          Los aportes comunitarios necesitan aprobación.
        </div>
      `;
      return;
    }

    const combos = findBestCombos(
      playlists,
      minutes,
      goals
    );

    if (!combos.length) {
      results.innerHTML = `
        <div class="notice">
          No encontramos combinaciones dentro del tiempo elegido.
          Prueba con más minutos o registra más playlists.
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
            ${combo.playlists.map(item =>
              escapeHTML(item.name)
            ).join(" + ")}
          </h3>

          <p>
            Tiempo estimado: ${combo.totalMinutes} minutos
            · Objetivos cubiertos:
            ${Math.round(combo.completion * 100)}%
          </p>

          <div class="result-counts">
            <span>SWIM: ${combo.totals.swim} / ${goals[0]}</span>
            <span>NORMAL: ${combo.totals.normal} / ${goals[1]}</span>
            <span>COME OVER: ${combo.totals.come} / ${goals[2]}</span>
            <span>B-sides: ${combo.totals.bsides}</span>
          </div>

          ${
            combo.versions.length
              ? `
                <div class="version-list">
                  <strong>Versiones de SWIM incluidas:</strong>

                  <ul>
                    ${combo.versions.map(version =>
                      `<li>${escapeHTML(version)}</li>`
                    ).join("")}
                  </ul>
                </div>
              `
              : ""
          }

          ${combo.playlists.map((item, i) => `
            <p>
              <a
                class="spotify-link"
                href="${escapeHTML(item.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir playlist ${i + 1} ↗
              </a>
            </p>
          `).join("")}

        </article>
      `).join("")}

      <p class="helper">
        Los resultados son estimaciones basadas en los datos registrados.
        El catálogo muestra Clean y Explicit como variantes disponibles,
        pero no verifica automáticamente las ediciones en Spotify.
      </p>
    `;
  });


// OBJETIVOS

function renderGoals() {
  const goals = [
    {
      name: "SWIM",
      target: numberValue(
        document.getElementById("goalSwim").value
      )
    },

    {
      name: "NORMAL",
      target: numberValue(
        document.getElementById("goalNormal").value
      )
    },

    {
      name: "COME OVER",
      target: numberValue(
        document.getElementById("goalCome").value
      )
    },

    {
      name: "B-sides",
      target: null
    }
  ];

  document.getElementById("goalBoard").innerHTML =
    goals.map(goal => `
      <article class="goal-item">

        <strong>${goal.name}</strong>

        <small>
          ${goal.target === null
            ? "Prioridad máxima · sin límite fijado"
            : `Meta: ${goal.target} apariciones previstas`}
        </small>

        <div class="progress-track">
          <span style="width:${goal.target === null ? 100 : 0}%"></span>
        </div>

      </article>
    `).join("");

  document.getElementById("homeGoals").innerHTML =
    goals.map(goal => `
      <article class="goal-tile">

        <strong>${goal.name}</strong>

        <small>
          ${goal.target === null
            ? "Prioridad máxima"
            : `Meta: ${goal.target}`}
        </small>

      </article>
    `).join("");
}


// ACTUALIZAR OBJETIVOS

["goalSwim", "goalNormal", "goalCome"].forEach(id => {
  document.getElementById(id)
    .addEventListener("input", renderGoals);
});


// INICIALIZAR

renderAlbumCatalog();
renderLibraries();
renderGoals();
