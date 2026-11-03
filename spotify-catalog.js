(() => {
  "use strict";
  const CLIENT_ID = "e50bcadfe7fa4e71b1fa83eafffa3cb8";
  const REDIRECT_URI = "https://armyplaylist.github.io/army-playlist/callback";
  const TOKEN_KEY = "armyPlaylistSpotifyToken";
  const REFRESH_KEY = "armyPlaylistSpotifyRefresh";
  const EXPIRY_KEY = "armyPlaylistSpotifyExpiry";
  const $ = id => document.getElementById(id);
  const status = $("catalogAuthStatus"), results = $("catalogResults");
  if (!status || !results) return;

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
        const match = String(raw || "").match(/playlist\\/([A-Za-z0-9]+)/);
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
    } finally { button.disabled = false; }
  }
  $("catalogAuditButton")?.addEventListener("click", auditPlaylists);

  $("catalogConnect").addEventListener("click",()=>connect().catch(e=>{status.textContent=e.message;}));
  $("catalogSearchButton").addEventListener("click",search);
  $("catalogQuery").addEventListener("keydown",e=>{if(e.key==="Enter")search();});
  $("catalogAuthStatus").textContent = tokenValid() || localStorage.getItem(REFRESH_KEY) ? "Conexión disponible" : "Necesitas autorizar el acceso";
  if (location.hash === "#catalogSearchPanel") $("catalogSearchPanel").scrollIntoView({behavior:"smooth",block:"start"});
})();