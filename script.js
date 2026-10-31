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
come: 2,
bsides: 10
},
{
id: "demo-2",
name: "Playlist de ejemplo · ARIRANG mix",
url: "https://open.spotify.com/",
duration: 90,
swim: 10,
normal: 10,
come: 3,
bsides: 15
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
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[char]);
}

function isSpotifyPlaylist(url) {
try {
const parsed = new URL(url);

return (
  parsed.hostname === "open.spotify.com" &&
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

window.scrollTo({ top: 0, behavior: "smooth" });
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
${Number(playlist.duration)} minutos ·
${escapeHTML(statusLabel)}
</p>
</div>
<span class="pill">♫ Spotify</span>
</div>

  <div class="playlist-meta">
    <span>SWIM: ${Number(playlist.swim || 0)}</span>
    <span>NORMAL: ${Number(playlist.normal || 0)}</span>
    <span>COME OVER: ${Number(playlist.come || 0)}</span>
    <span>B-sides: ${Number(playlist.bsides || 0)}</span>
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
playlistCard(item, item.status === "approved"
? "Aprobada"
: "Pendiente de revisión")
).join("")
: '<p class="helper">Todavía no hay aportes comunitarios.</p>';

document.getElementById("officialCount").textContent =
"${officialPlaylists.length} playlists";

document.getElementById("communityCount").textContent =
"${communityPlaylists.length} aportes";
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
come: Number(data.get("come") || 0),
bsides: Number(data.get("bsides") || 0)

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
? Math.max(
1,
Number(document.getElementById("customTime").value || 1)
)
: Number(value);
}

// GENERADOR DE COMBOS INTELIGENTE

function findBestCombos(playlists, minutes, goals) {
const eligible = playlists.filter(item =>
Number(item.duration) > 0 &&
Number(item.duration) <= minutes
);

const candidates = [];
const maxPlaylists = 4;

function evaluateCombo(combo) {
const totalMinutes = combo.reduce(
(sum, item) => sum + Number(item.duration),
0
);

if (totalMinutes > minutes) return;

const totals = {
  swim: combo.reduce((sum, item) =>
    sum + Number(item.swim || 0), 0),

  normal: combo.reduce((sum, item) =>
    sum + Number(item.normal || 0), 0),

  come: combo.reduce((sum, item) =>
    sum + Number(item.come || 0), 0),

  bsides: combo.reduce((sum, item) =>
    sum + Number(item.bsides || 0), 0)
};

const targets = [
  goals[0],
  goals[1],
  goals[2]
];

const achieved = [
  totals.swim,
  totals.normal,
  totals.come
];

let completion = 0;
let activeGoals = 0;

targets.forEach((goal, index) => {
  if (goal > 0) {
    completion += Math.min(achieved[index], goal) / goal;
    activeGoals++;
  }
});

completion = activeGoals
  ? completion / activeGoals
  : 0;

// Los objetivos principales tienen prioridad.
// Los B-sides funcionan como desempate y bonificación.
const score =
  completion * 1000 +
  totals.bsides * 2;

candidates.push({
  playlists: [...combo],
  totalMinutes,
  totals,
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
    (sum, item) => sum + Number(item.duration),
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

// BOTÓN BUSCAR COMBOS

document.getElementById("calculateButton")
.addEventListener("click", () => {
const source =
document.getElementById("comboSource").value;

let playlists = [];

if (source === "official") {
  playlists = officialPlaylists;
} else if (source === "community") {
  playlists = communityPlaylists.filter(
    item => item.status === "approved"
  );
}

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
      No hay playlists disponibles en esta biblioteca.
      Los aportes de ARMY necesitan aprobación antes
      de aparecer en el generador.
    </div>
  `;
  return;
}

const combos =
  findBestCombos(playlists, minutes, goals);

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
    Los resultados son estimaciones basadas en los datos
    registrados. No garantizan reproducciones contabilizadas
    por Spotify.
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

document.getElementById("goalBoard").innerHTML =
goals.map(goal => "<article class="goal-item"> <strong>${goal.name}</strong> <small> ${goal.target === null ? "Prioridad máxima · sin límite fijado" :"Meta: ${goal.target} apariciones previstas"} </small> <div class="progress-track"> <span style="width:${goal.target === null ? 100 : 0}%"></span> </div> </article> ").join("");

document.getElementById("homeGoals").innerHTML =
goals.map(goal => "<article class="goal-tile"> <strong>${goal.name}</strong> <small> ${goal.target === null ? "Prioridad máxima" :"Meta: ${goal.target}"} </small> </article> ").join("");
}

// ACTUALIZAR OBJETIVOS

["goalSwim", "goalNormal", "goalCome"].forEach(id => {
document.getElementById(id)
.addEventListener("input", renderGoals);
});

// INICIALIZAR

renderLibraries();
renderGoals();
