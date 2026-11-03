(() => {
  "use strict";
  const CLIENT_ID = "e50bcadfe7fa4e71b1fa83eafffa3cb8";
  const REDIRECT_URI = "https://armyplaylist.github.io/army-playlist/callback";
  const TOKEN_KEY = "armyPlaylistSpotifyToken";
  const REFRESH_KEY = "armyPlaylistSpotifyRefresh";
  const EXPIRY_KEY = "armyPlaylistSpotifyExpiry";
  const $ = id => document.getElementById(id);
  const status = $("catalogAuthStatus"), results = $("catalogResults");

  const randomString = (length=64) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, b => chars[b % chars.length]).join("");
  };
  const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const sha256 = async value => crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const token = () => localStorage.getItem(TOKEN_KEY);
  const tokenValid = () => token() && Number(localStorage.getItem(EXPIRY_KEY) || 0) > Date.now()+60000;

  async function connect() {
    const verifier = randomString(64), state = randomString(24);
    sessionStorage.setItem("armySpotifyVerifier", verifier);
    sessionStorage.setItem("armySpotifyState", state);
    const challenge = base64url(await sha256(verifier));
    const url = new URL("https://accounts.spotify.com/authorize");
    url.search = new URLSearchParams({
      client_id: CLIENT_ID, response_type: "code", redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256", code_challenge: challenge, state,
      scope: "playlist-read-private playlist-read-collaborative", show_dialog: "true"
    }).toString();
    location.href = url.toString();
  }

  async function refreshToken() {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({client_id:CLIENT_ID,grant_type:"refresh_token",refresh_token:refresh})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.error || "No se pudo renovar la conexión.");
    localStorage.setItem(TOKEN_KEY,data.access_token);
    if (data.refresh_token) localStorage.setItem(REFRESH_KEY,data.refresh_token);
    localStorage.setItem(EXPIRY_KEY,String(Date.now()+data.expires_in*1000));
    return data.access_token;
  }

  async function getToken() {
    if (tokenValid()) return token();
    return await refreshToken();
  }

  function clean(s) { return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); }
  function versionLabel(track) {
    const text = clean(track.name + " " + (track.album?.name || ""));
    if (/instrumental/.test(text)) return "Instrumental";
    if (/remix|mix\b/.test(text)) return "Remix";
    if (/acoustic|unplugged/.test(text)) return "Acústica";
    if (/live|concert|stage/.test(text)) return "En vivo";
    if (/sped up|speed up/.test(text)) return "Speed up";
    if (/slowed|reverb/.test(text)) return "Slowed / reverb";
    if (/radio edit/.test(text)) return "Radio edit";
    if (/clean/.test(text)) return "Clean";
    if (/explicit/.test(text)) return "Explicit";
    const type = track.album?.album_type;
    if (type === "single") return "Sencillo";
    if (type === "compilation") return "Recopilación";
    if (type === "album") return "Álbum";
    return "Lanzamiento";
  }
  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function dateLabel(date) {
    if (!date) return "";
    const p = date.split("-");
    return p.length===3 ? p.reverse().join("/") : p.reverse().join("/");
  }
  function render(items, query) {
    if (!items.length) {
      results.innerHTML = '<div class="empty catalog-empty">No encontramos versiones para “'+safe(query)+'”. Prueba con el título y BTS como artista.</div>';
      return;
    }
    const cards = items.map(t => {
      const artists = (t.artists||[]).map(a=>a.name).join(", ");
      const album = t.album || {};
      const cover = album.images?.[1]?.url || album.images?.[0]?.url || "";
      const link = t.external_urls?.spotify || "https://open.spotify.com/track/"+encodeURIComponent(t.id);
      const type = versionLabel(t);
      return '<article class="catalog-track">'+(cover?'<img src="'+safe(cover)+'" alt="Portada de '+safe(album.name||t.name)+'" loading="lazy">':'<div class="catalog-cover-placeholder"></div>')+'<div><h3>'+safe(t.name)+'</h3><p>'+safe(artists)+'</p><p><strong>'+safe(album.name||"Lanzamiento")+'</strong></p><div class="chips"><span class="chip">'+safe(type)+'</span><span class="chip">'+safe(album.album_type||"")+'</span></div><p class="catalog-meta">'+safe(dateLabel(album.release_date))+(t.explicit?" · Explicit":"")+'</p><a class="spotify-link" href="'+safe(link)+'" target="_blank" rel="noopener noreferrer">Abrir en Spotify</a></div></article>';
    }).join("");
    results.innerHTML = cards + '<div class="catalog-attribution"><svg viewBox="0 0 24 24" aria-label="Spotify" role="img"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path d="M5.2 9.2c4.7-1.4 9.7-.9 13.6 1.4M6.1 12.2c3.9-1.1 8-.7 11.4 1.2M7 15.1c3.1-.8 6.2-.5 8.9.9" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>Datos y portadas proporcionados por Spotify. Los resultados enlazan al servicio de Spotify.</div>';
  }

  async function search() {
    if (!$("catalogQuery") || !results) return;
    const query = $("catalogQuery").value.trim();
    if (!query) { results.innerHTML='<div class="empty">Escribe el nombre de una canción para buscar.</div>'; return; }
    const access = await getToken();
    if (!access) { results.innerHTML='<div class="empty">Primero pulsa “Conectar con Spotify”.</div>'; return; }
    $("catalogSearchButton").disabled = true;
    results.innerHTML='<div class="empty catalog-loading">Buscando versiones en Spotify…</div>';
    try {
      const found = new Map();
      for (const offset of [0,10,20]) {
        const params = new URLSearchParams({q:"track:"+query,type:"track",limit:"10",offset:String(offset),market:"MX"});
        const response = await fetch("https://api.spotify.com/v1/search?"+params,{headers:{Authorization:"Bearer "+access}});
        if (response.status===401) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EXPIRY_KEY); throw new Error("La conexión caducó. Pulsa Conectar con Spotify para volver a autorizar."); }
        if (response.status===403) throw new Error("Spotify no autorizó esta búsqueda. Revisa que la aplicación siga activa en Spotify for Developers.");
        if (response.status===429) throw new Error("Spotify está recibiendo demasiadas búsquedas. Espera un momento e inténtalo de nuevo.");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "No se pudo consultar el catálogo de Spotify.");
        (data.tracks?.items||[]).forEach(t=>found.set(t.id,t));
        if (!data.tracks?.next) break;
      }
      const ranked = [...found.values()].sort((a,b) => {
        const qa=clean(query), na=clean(a.name), nb=clean(b.name);
        const score = (t,n) => (n===qa?100:n.startsWith(qa)?60:n.includes(qa)?35:0) + ((t.artists||[]).some(x=>clean(x.name).includes("bts"))?15:0);
        return score(b,nb)-score(a,na);
      });
      render(ranked,query);
    } catch (error) {
      results.innerHTML='<div class="empty">'+safe(error.message || "Ocurrió un error al buscar.")+'</div>';
    } finally { $("catalogSearchButton").disabled=false; }
  }


  // Auditoría local: solo lee metadatos y cuenta repeticiones; nunca modifica playlists.
  async function auditPlaylists() {
    const button = $("catalogAuditButton"), output = $("catalogAuditResults"), label = $("catalogAuditStatus");
    const access = await getToken();
    if (!access) { label.textContent = "Primero conecta Spotify y acepta los permisos de lectura."; return; }
    button.disabled = true;
    output.innerHTML = '<div class="empty">Analizando playlists… Esto puede tardar un poco.</div>';
    try {
      if (typeof playlists === "undefined" || !Array.isArray(playlists)) throw new Error("No pudimos localizar el catálogo de playlists de esta página.");
      const targets = playlists.map((p, index) => {
        const raw = Array.isArray(p[5]) ? p[5][0] : p[5];
        const match = String(raw || "").match(/playlist\/([A-Za-z0-9]+)/);
        return match ? { id: match[1], name: p[0] || ("Playlist " + (index + 1)) } : null;
      }).filter(Boolean);
      const unique = [...new Map(targets.map(p => [p.id,p])).values()];
      let completed = 0;
      const reports = [];
      for (const playlist of unique) {
        let url = "https://api.spotify.com/v1/playlists/" + encodeURIComponent(playlist.id) + "/items?limit=50&additional_types=track";
        const counts = new Map();
        let total = 0;
        while (url) {
          const response = await fetch(url, { headers: { Authorization: "Bearer " + access } });
          if (response.status === 401) throw new Error("La autorización caducó. Pulsa «Conectar con Spotify» y vuelve a autorizar la lectura.");
          if (response.status === 403) throw new Error("Spotify no permitió leer «" + playlist.name + "». Comprueba que esta cuenta sea propietaria o colaboradora de esa playlist.");
          if (response.status === 429) throw new Error("Spotify pidió esperar por demasiadas consultas. Inténtalo de nuevo dentro de unos minutos.");
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || "No se pudo leer «" + playlist.name + "».");
          for (const entry of (data.items || [])) {
            const track = entry.item || entry.track;
            if (!track || track.type !== "track" || !track.id) continue;
            total++;
            const previous = counts.get(track.id) || { name: track.name, artists: (track.artists || []).map(a => a.name).join(", "), count: 0 };
            previous.count++;
            counts.set(track.id, previous);
          }
          url = data.next || null;
        }
        reports.push({ name: playlist.name, id: playlist.id, total, songs: [...counts.values()].sort((a,b) => a.name.localeCompare(b.name,"es")) });
        completed++;
        label.textContent = "Revisadas " + completed + " de " + unique.length + " playlists…";
      }
      const cards = reports.map(report => {
        const lines = report.songs.map(song => "<li>" + safe(song.name) + (song.artists ? " — " + safe(song.artists) : "") + " <strong>×" + song.count + "</strong></li>").join("");
        return '<article class="catalog-track audit-card"><div><h3>' + safe(report.name) + '</h3><p><strong>' + report.total + '</strong> reproducciones en <strong>' + report.songs.length + '</strong> canciones distintas</p><details><summary>Ver conteo por canción</summary><ul>' + lines + '</ul></details></div></article>';
      }).join("");
      output.innerHTML = '<p class="hint">Resultado: ' + reports.length + ' playlists revisadas. Solo se cuentan canciones disponibles; episodios y elementos eliminados/no disponibles se omiten.</p>' + (cards || '<div class="empty">No encontramos playlists para analizar.</div>');
      label.textContent = "Auditoría terminada: " + reports.length + " playlists revisadas.";
    } catch (error) {
      output.innerHTML = '<div class="empty">' + safe(error.message || "Ocurrió un error al analizar las playlists.") + '</div>';
      label.textContent = "No se pudo completar la auditoría.";
    }
  }

  // Importa las playlists de la cuenta conectada sin alterar el catálogo manual.
  let importedPlaylists = [];
  function renderMySpotifyPlaylists() {
    const query = clean($("mySpotifyPlaylistsSearch")?.value || "").trim();
    const filtered = importedPlaylists.filter(p => clean(p.name + " " + (p.owner?.display_name || "")).includes(query));
    const count = $("mySpotifyPlaylistsCount");
    if (count) count.textContent = filtered.length + " de " + importedPlaylists.length + " playlists";
    const target = $("mySpotifyPlaylistsResults");
    if (!filtered.length) {
      target.innerHTML = '<div class="empty">' + (importedPlaylists.length ? "No hay playlists que coincidan con esa búsqueda." : "No encontramos playlists en esta cuenta.") + '</div>';
      return;
    }
    target.innerHTML = '<div class="my-spotify-grid">' + filtered.map(p => {
      const cover = p.images?.[0]?.url;
      const link = p.external_urls?.spotify || (p.id ? "https://open.spotify.com/playlist/" + encodeURIComponent(p.id) : "");
      const total = p.items?.total ?? p.tracks?.total ?? 0;
      const visibility = p.public === false ? "Privada" : p.public === true ? "Pública" : "Acceso compartido";
      const collaboration = p.collaborative ? " · Colaborativa" : "";
      return '<article class="my-spotify-card">' +
        (cover ? '<img src="' + safe(cover) + '" alt="Portada de ' + safe(p.name) + '" loading="lazy">' : '<div class="catalog-cover-placeholder"></div>') +
        '<div class="my-spotify-card-body"><h3>' + safe(p.name || "Playlist sin título") + '</h3>' +
        '<p>' + safe(p.owner?.display_name || "Spotify") + '</p><p>' + total + ' canciones · ' + visibility + collaboration + '</p>' +
        (link ? '<a class="spotify-link" href="' + safe(link) + '" target="_blank" rel="noopener noreferrer">Abrir en Spotify</a>' : '') +
        '</div></article>';
    }).join("") + '</div><p class="hint">Portadas y datos proporcionados por Spotify. Cada tarjeta enlaza a su playlist en Spotify.</p>';
  }
  async function importMySpotifyPlaylists() {
    const output = $("mySpotifyPlaylistsResults");
    let access = await getToken();
    if (!access) {
      await connect();
      return;
    }
    output.innerHTML = '<div class="empty">Cargando tus playlists desde Spotify…</div>';
    try {
      const all = new Map();
      let url = "https://api.spotify.com/v1/me/playlists?limit=50";
      while (url) {
        const parsed = new URL(url);
        if (parsed.origin !== "https://api.spotify.com") throw new Error("Spotify devolvió una dirección de página no válida.");
        const response = await fetch(url, {headers:{Authorization:"Bearer " + access}});
        if (response.status === 401) throw new Error('La autorización caducó. Pulsa “Conectar con Spotify” y vuelve a autorizar.');
        if (response.status === 403) throw new Error("Spotify no permitió consultar tus playlists. Vuelve a conectar la cuenta y acepta los permisos de lectura.");
        if (response.status === 429) throw new Error("Spotify pidió esperar por demasiadas consultas. Inténtalo de nuevo en unos minutos.");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "No se pudieron cargar tus playlists.");
        (data.items || []).forEach(p => { if (p?.id) all.set(p.id,p); });
        url = data.next || null;

      }
      importedPlaylists = [...all.values()].sort((a,b) => (a.name || "").localeCompare(b.name || "", "es"));
      $("mySpotifyPlaylistsTools").hidden = false;
      renderMySpotifyPlaylists();

    } catch (error) {
      output.innerHTML = '<div class="empty">' + safe(error.message || "Ocurrió un error al importar las playlists.") + '</div>';

    } finally { button.disabled = false; }
  }
  $("importSpotifyPlaylistsButton")?.addEventListener("click", importMySpotifyPlaylists);
  $("mySpotifyPlaylistsSearch")?.addEventListener("input", renderMySpotifyPlaylists);

  $("catalogAuditButton")?.addEventListener("click", auditPlaylists);

  $("catalogConnect")?.addEventListener("click",()=>connect().catch(e=>{if(status)status.textContent=e.message;}));
  $("catalogSearchButton")?.addEventListener("click",search);
  $("catalogQuery")?.addEventListener("keydown",e=>{if(e.key==="Enter")search();});
  if (status) status.textContent = tokenValid() || localStorage.getItem(REFRESH_KEY) ? "Conexión disponible" : "Necesitas autorizar el acceso";
  if (location.hash === "#mySpotifyPlaylistsPanel") {
    $("mySpotifyPlaylistsPanel")?.scrollIntoView({behavior:"smooth",block:"start"});
    if (tokenValid() || localStorage.getItem(REFRESH_KEY)) importMySpotifyPlaylists();
  }

  // Enriquecimiento silencioso del catálogo existente con metadatos de Spotify.
  // No crea tarjetas, no cambia la clasificación manual ni modifica playlists.
  const spotifyMetaCache = new Map();
  const playlistIdFromUrl = value => {
    const match = String(value || "").match(/open\.spotify\.com\/playlist\/([A-Za-z0-9]+)/);
    return match ? match[1] : "";
  };
  function addSpotifyMetaStyles() {
    if ($("spotifyMetaStyles")) return;
    const style = document.createElement("style");
    style.id = "spotifyMetaStyles";
    style.textContent = ".spotify-live-meta{display:flex;gap:10px;align-items:flex-start;margin:10px 0;padding:9px;border-radius:12px;background:#f7f2fc;color:#735f88;font-size:.78rem;font-weight:700}.spotify-live-meta img{width:58px;height:58px;flex:0 0 58px;object-fit:cover;border-radius:9px}.spotify-live-meta p{margin:0 0 4px}.spotify-live-meta .spotify-live-description{font-weight:600;color:#88799a;line-height:1.4}.spotify-live-meta .spotify-live-title{font-weight:900;color:#65468a}";
    document.head.appendChild(style);
  }
  async function loadSpotifyPlaylistMeta(id) {
    if (spotifyMetaCache.has(id)) return spotifyMetaCache.get(id);
    const task = (async () => {
      let meta = null;
      const access = await getToken().catch(() => null);
      if (access) {
        const response = await fetch("https://api.spotify.com/v1/playlists/" + encodeURIComponent(id) + "?fields=name,description,images,owner(display_name),tracks(total),items(total),external_urls", {
          headers: { Authorization: "Bearer " + access }
        });
        if (response.ok) {
          const data = await response.json();
          meta = {
            name: data.name || "",
            description: data.description || "",
            image: data.images?.[0]?.url || "",
            owner: data.owner?.display_name || "",
            total: data.tracks?.total ?? data.items?.total ?? null
          };
        } else if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(EXPIRY_KEY);
        }
      }
      // Respaldo público: portada y título de Spotify; no expone la descripción completa.
      if (!meta || !meta.image) {
        try {
          const response = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent("https://open.spotify.com/playlist/" + id));
          if (response.ok) {
            const data = await response.json();
            meta = {...(meta || {}), name: meta?.name || data.title || "", image: meta?.image || data.thumbnail_url || ""};
          }
        } catch (_) {}
      }
      return meta;
    })();
    spotifyMetaCache.set(id, task);
    return task;
  }
  async function enrichExistingPlaylistCards(root = document) {
    addSpotifyMetaStyles();
    const links = [...root.querySelectorAll('a[href*="open.spotify.com/playlist/"]')];
    const unique = new Map();
    for (const link of links) {
      const id = playlistIdFromUrl(link.href);
      if (!id) continue;
      const card = link.closest(".playlist, .combo-entry, .profile, article");
      if (card && !card.querySelector('[data-spotify-meta="' + id + '"]')) unique.set(id, card);
    }
    const entries = [...unique.entries()];
    for (let i = 0; i < entries.length; i += 3) {
      await Promise.all(entries.slice(i, i + 3).map(async ([id, card]) => {
        const meta = await loadSpotifyPlaylistMeta(id);
        if (!meta || card.querySelector('[data-spotify-meta="' + id + '"]')) return;
        const block = document.createElement("div");
        block.className = "spotify-live-meta";
        block.dataset.spotifyMeta = id;
        if (meta.image) {
          const img = document.createElement("img");
          img.src = meta.image;
          img.alt = "Portada de Spotify";
          img.loading = "lazy";
          block.appendChild(img);
        }
        const details = document.createElement("div");
        if (meta.name) {
          const title = document.createElement("p");
          title.className = "spotify-live-title";
          title.textContent = meta.name;
          details.appendChild(title);
        }
        if (meta.description) {
          const description = document.createElement("p");
          description.className = "spotify-live-description";
          description.textContent = meta.description;
          details.appendChild(description);
        }
        if (meta.owner || meta.total !== null && meta.total !== undefined) {
          const extra = document.createElement("p");
          extra.textContent = [meta.owner, meta.total !== null && meta.total !== undefined ? meta.total + " canciones en Spotify" : ""].filter(Boolean).join(" · ");
          details.appendChild(extra);
        }
        block.appendChild(details);
        const heading = card.querySelector("h3, strong");
        if (heading?.parentElement) heading.parentElement.insertAdjacentElement("afterend", block);
        else card.appendChild(block);
      }));
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enrichExistingPlaylistCards(), {once:true});
  } else {
    enrichExistingPlaylistCards();
  }
  const spotifyMetaObserver = new MutationObserver(mutations => {
    if (mutations.some(m => [...m.addedNodes].some(n => n.nodeType === 1))) enrichExistingPlaylistCards();
  });
  spotifyMetaObserver.observe(document.body, {childList:true, subtree:true});

  // Sincroniza silenciosamente las playlists públicas propias del perfil indicado.
  // Usa únicamente la sesión Spotify ya autorizada en este navegador; nunca modifica playlists.
  const PROFILE_ID = "31nsdpqgcab4lqafjmqjlf5yomjq";
  let profileSyncStarted = false;
  function existingPlaylistIds() {
    return new Set([...document.querySelectorAll('a[href*="open.spotify.com/playlist/"]')]
      .map(a => playlistIdFromUrl(a.href)).filter(Boolean));
  }
  function classifyProfilePlaylist(p) {
    const value = clean((p.name || "") + " " + (p.description || ""));
    const rules = [
      ["BTS · Grupal", /\b(bts|ot7|arirang|group|grupal|방탄소년단)\b/],
      ["RM", /\b(rm|namjoon)\b/],
      ["Jin", /\b(jin|seokjin)\b/],
      ["SUGA", /\b(suga|yoongi|agust d)\b/],
      ["J-Hope", /\b(j hope|j-hope|hoseok)\b/],
      ["Jimin", /\b(jimin)\b/],
      ["V", /\b(v|taehyung|tae)\b/],
      ["Jungkook", /\b(jungkook|jk)\b/]
    ];
    const match = rules.find(([, pattern]) => pattern.test(value));
    return match ? match[0] : "Otras playlists";
  }
  function addProfilePlaylistStyles() {
    if ($("profilePublicPlaylistStyles")) return;
    const style = document.createElement("style");
    style.id = "profilePublicPlaylistStyles";
    style.textContent = ".profile-public-section{margin:22px 0;padding:clamp(18px,4vw,28px);border:1px solid #ffffffd9;border-radius:28px;background:#ffffffb8;box-shadow:var(--shadow)}.profile-public-section h2{margin:0 0 6px}.profile-public-section .profile-public-intro{margin:0 0 16px;color:var(--muted);font-size:.86rem;font-weight:700}.profile-public-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.profile-public-card{display:flex;gap:12px;min-width:0;padding:13px;border-radius:18px;background:#fff;box-shadow:var(--shadow)}.profile-public-card img{width:88px;height:88px;flex:0 0 88px;object-fit:cover;border-radius:12px}.profile-public-card h3{margin:0 0 5px;font-size:1rem}.profile-public-card p{margin:4px 0;color:var(--muted);font-size:.8rem;font-weight:700;overflow-wrap:anywhere}.profile-public-card .chip{display:inline-block;margin:4px 4px 4px 0}.profile-public-card .spotify-link{margin-top:5px}@media(max-width:720px){.profile-public-grid{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }
  function profilePublicContainer() {
    let section = $("profilePublicPlaylists");
    if (section) return section;
    addProfilePlaylistStyles();
    section = document.createElement("section");
    section.id = "profilePublicPlaylists";
    section.className = "profile-public-section";
    section.innerHTML = '<h2>Más playlists públicas de mi perfil 💜</h2><p class="profile-public-intro">Playlists públicas recuperadas de Spotify y organizadas según sus títulos y descripciones.</p><div class="profile-public-grid" id="profilePublicPlaylistGrid"><div class="empty">Buscando playlists públicas…</div></div>';
    const page = document.querySelector(".page") || document.body;
    const footer = page.querySelector(".footer");
    if (footer) page.insertBefore(section, footer); else page.appendChild(section);
    return section;
  }
  async function syncPublicProfilePlaylists() {
    if (profileSyncStarted) return;
    profileSyncStarted = true;
    let access = await getToken().catch(() => null);
    if (!access) {
      // Los navegadores móviles bloquean a veces redirecciones OAuth iniciadas al cargar la página.
      // Mostrar una acción explícita para que el toque de la usuaria habilite la navegación.
      const prompt = document.createElement("section");
      prompt.className = "profile-public-section";
      prompt.innerHTML = '<h2>Conecta tu Spotify 💜</h2><p class="profile-public-intro">Autoriza el acceso para recuperar automáticamente las playlists públicas de este perfil. Tus 38 playlists actuales no se modificarán.</p><button type="button" id="profileSpotifyConnect" class="spotify-link">Conectar con Spotify</button><p id="profileSpotifyConnectError" role="status"></p>';
      const page = document.querySelector(".page") || document.body;
      const footer = page.querySelector(".footer");
      if (footer) page.insertBefore(prompt, footer); else page.appendChild(prompt);
      $("profileSpotifyConnect").addEventListener("click", async () => {
        const button = $("profileSpotifyConnect");
        button.disabled = true;
        $("profileSpotifyConnectError").textContent = "Abriendo Spotify…";
        try { await connect(); }
        catch (error) {
          button.disabled = false;
          $("profileSpotifyConnectError").textContent = error.message || "No se pudo abrir Spotify. Inténtalo de nuevo.";
        }
      });
      return;
    }
    try {
      const all = new Map();
      let url = "https://api.spotify.com/v1/me/playlists?limit=50";
      while (url) {
        const response = await fetch(url, {headers:{Authorization:"Bearer " + access}});
        if (!response.ok) throw new Error("Spotify no permitió leer las playlists del perfil.");
        const data = await response.json();
        (data.items || []).forEach(p => {
          if (p?.id && p.public !== false && p.owner?.id === PROFILE_ID) all.set(p.id, p);
        });
        url = data.next || null;
      }
      const known = existingPlaylistIds();
      const missing = [...all.values()].filter(p => !known.has(p.id))
        .sort((a,b) => (a.name || "").localeCompare(b.name || "", "es"));
      if (!missing.length) return;
      const section = profilePublicContainer();
      const grid = $("profilePublicPlaylistGrid");
      grid.innerHTML = missing.map(p => {
        const cover = p.images?.[0]?.url || "";
        const link = p.external_urls?.spotify || "https://open.spotify.com/playlist/" + encodeURIComponent(p.id);
        const category = classifyProfilePlaylist(p);
        const description = (p.description || "").trim();
        const total = p.items?.total ?? p.tracks?.total;
        return '<article class="profile-public-card" data-profile-playlist="' + safe(p.id) + '">' +
          (cover ? '<img src="' + safe(cover) + '" alt="Portada de ' + safe(p.name) + '" loading="lazy">' : '') +
          '<div><h3>' + safe(p.name || "Playlist sin título") + '</h3>' +
          '<span class="chip">' + safe(category) + '</span>' +
          (description ? '<p>' + safe(description) + '</p>' : '<p>Sin descripción pública disponible.</p>') +
          '<p>' + (total == null ? "" : total + " canciones") + '</p>' +
          '<a class="spotify-link" href="' + safe(link) + '" target="_blank" rel="noopener noreferrer">Abrir en Spotify</a>' +
          '</div></article>';
      }).join("");
    } catch (error) {
      // Sin sesión válida o si Spotify limita el acceso, el catálogo manual permanece intacto.
      console.warn("No se pudieron sincronizar las playlists públicas del perfil:", error);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncPublicProfilePlaylists, {once:true});
  } else {
    syncPublicProfilePlaylists();
  }
  
})();