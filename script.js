const API_URL = "";

async function loadBTSStreams() {
  const status = document.getElementById("streamStatus");
  const rows = document.getElementById("streamRows");
  const updated = document.getElementById("lastUpdated");

  if (!API_URL) {
    status.textContent = "Estamos preparando la conexión de estadísticas ♡";
    return;
  }

  try {
    status.textContent = "Cargando estadísticas de BTS...";
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error("Error al cargar datos");

    const data = await response.json();
    rows.innerHTML = "";

    data.songs
      .sort((a, b) => b.totalStreams - a.totalStreams)
      .forEach((song, index) => {
        const tr = document.createElement("tr");

        [index + 1, song.title,
          Number(song.totalStreams).toLocaleString("en-US"),
          Number(song.dailyStreams).toLocaleString("en-US")
        ].forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        rows.appendChild(tr);
      });

    status.textContent = "Estadísticas actualizadas ♡";
    updated.textContent = "Actualizado: " +
      new Date(data.updatedAt).toLocaleString();
  } catch (error) {
    status.textContent = "No se pudieron cargar las estadísticas ♡";
    console.error(error);
  }
}

loadBTSStreams();
