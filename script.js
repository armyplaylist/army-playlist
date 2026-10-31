const discography=[
{id:'arirang',title:'ARIRANG',year:2026,era:'arirang',type:'Álbum prioritario',color:'#d8c2ff',tracks:['SWIM','NORMAL','COME OVER','Hooligan','Aliens','FYA','2.0','no.29','Merry Go Round',"they don't know 'bout us",'One More Night','Please','Into the Sun']},
{id:'proof',title:'Proof',year:2022,era:'solo',type:'Anthology',color:'#ffe6f0',tracks:['Yet To Come','Run BTS','For Youth','Born Singer']},
{id:'be',title:'BE',year:2020,era:'be',type:'Álbum',color:'#e6f0ff',tracks:['Life Goes On','Dynamite','Blue & Grey','Stay']},
{id:'mots7',title:'MAP OF THE SOUL: 7',year:2020,era:'mots',type:'Álbum',color:'#fff0e6',tracks:['ON','Black Swan','Louder than bombs','We are Bulletproof: the Eternal']},
{id:'ly',title:'LOVE YOURSELF: Answer',year:2018,era:'ly',type:'Álbum',color:'#f0ffe6',tracks:['IDOL','Epiphany','Euphoria','Answer: Love Myself']},
{id:'wings',title:'WINGS',year:2016,era:'wings',type:'Álbum',color:'#e6fff8',tracks:['Blood Sweat & Tears','Begin','Stigma','MAMA']},
{id:'hyyh',title:'Young Forever',year:2016,era:'hyyh',type:'Compilación',color:'#f5e6ff',tracks:['Fire','Save ME','Epilogue: Young Forever','Butterfly']},
{id:'dark',title:'Dark & Wild',year:2014,era:'hyyh',type:'Álbum',color:'#fffbe6',tracks:['Danger','War of Hormone','Rain']},
];

let official=JSON.parse(localStorage.getItem('asc_official_final')||'null')||[
{id:'o1',name:'ARIRANG focus - SWIM heavy',duration:85,tracks:['SWIM','NORMAL','Merry Go Round','FYA','Aliens'],url:'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',swim:8,normal:3,come:1,src:'Oficial'},
{id:'o2',name:'BTS Classics',duration:120,tracks:['Dynamite','Blood Sweat & Tears','IDOL','Life Goes On','Yet To Come','ON'],url:'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',swim:0,normal:0,come:0,src:'Oficial'},
{id:'o3',name:'HYYH Gym Hype',duration:75,tracks:['Fire','Save ME','ON','IDOL','Run BTS','Danger'],url:'https://open.spotify.com/playlist/xyz',swim:0,normal:0,come:0,src:'Oficial'},
{id:'o4',name:'14h Streaming Party',duration:420,tracks:['SWIM','NORMAL','COME OVER','Dynamite','IDOL','Fire','ON','Yet To Come'],url:'https://open.spotify.com/playlist/xyz',swim:10,normal:8,come:3,src:'Oficial'},
{id:'o5',name:'Noche larga ARIRANG',duration:210,tracks:['SWIM','COME OVER','Please','One More Night','Into the Sun',"they don't know 'bout us"],url:'https://open.spotify.com/playlist/xyz',swim:5,normal:2,come:2,src:'Oficial'},
{id:'o6',name:'SAD HOURS',duration:95,tracks:['Epiphany','Blue & Grey','We are Bulletproof: the Eternal','Butterfly'],url:'https://open.spotify.com/playlist/xyz',swim:0,normal:0,come:0,src:'Oficial'},
];
let community=JSON.parse(localStorage.getItem('asc_community_final')||'[]');
if(community.length===0){ community=[{id:'a1',name:'Mi combo ARIRANG',duration:110,tracks:['SWIM','COME OVER','Please'],url:'https://open.spotify.com/playlist/xyz',swim:3,normal:1,come:1,src:'ARMY'}]; }
function save(){ localStorage.setItem('asc_official_final',JSON.stringify(official)); localStorage.setItem('asc_community_final',JSON.stringify(community)); }

const $=s=>document.querySelector(s); const $$=s=>document.querySelectorAll(s);

// NAV
$$('[data-view]').forEach(btn=>{ btn.addEventListener('click',()=>{ const v=btn.dataset.view; if(!v) return; $$('.view').forEach(x=>x.classList.remove('active')); document.getElementById(v)?.classList.add('active'); $$('.nav-link,.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v)); window.scrollTo({top:0,behavior:'smooth'}); }); });
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{ document.querySelector(`[data-view="${b.dataset.go}"]`)?.click(); }));
$('#menuToggle')?.addEventListener('click',()=>$('#mainNav').classList.toggle('open'));

// FORMS
function parseTracks(str){ return str.split(',').map(s=>s.trim()).filter(Boolean); }
function handleForm(form,type){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const item={id:Date.now().toString(36),name:fd.get('name'),url:fd.get('url'),duration:parseInt(fd.get('duration')||60),tracks:parseTracks(fd.get('tracks')||''),swim:parseInt(fd.get('swim')||0),normal:parseInt(fd.get('normal')||0),come:parseInt(fd.get('come')||0),src:type==='official'?'Oficial':'ARMY'};
    if(type==='official') official.unshift(item); else community.unshift(item);
    save(); renderAll(); form.reset();
    if(type==='community'){ const m=$('#communityMessage'); if(m){ m.textContent='¡Guardado! Ahora aparece en Discografía y Combos ♡'; setTimeout(()=>m.textContent='',3000);} }
  });
}
const offForm=$('#officialForm'); const comForm=$('#communityForm');
if(offForm) handleForm(offForm,'official'); if(comForm) handleForm(comForm,'community');

// RENDER LISTAS
function cardHTML(p){ return `<article class="playlist-card"><strong>${p.name}</strong><small>${p.src} • ${p.duration} min • ${p.tracks.length} canciones</small><div style="margin:8px 0;display:flex;flex-wrap:wrap">${p.tracks.map(t=>`<span class="tag">${t}</span>`).join('')}</div><a class="pill" href="${p.url}" target="_blank">Abrir Spotify →</a></article>`; }
function renderLists(){
  $('#officialList').innerHTML=official.map(cardHTML).join('')||'<p class="notice">No hay playlists</p>';
  $('#communityList').innerHTML=community.map(cardHTML).join('')||'<p class="notice">Sé la primera en compartir ♡</p>';
  $('#officialCount').textContent=`${official.length} playlists`;
  $('#communityCount').textContent=`${community.length} aportes`;
}
function renderGoals(){
  const goals=[{k:'SWIM',v:120,note:'6 lanzamientos'},{k:'NORMAL',v:80,note:'4 lanzamientos'},{k:'COME OVER',v:20,note:'1 lanzamiento'},{k:'B-sides',v:50,note:'Catálogo'}];
  $('#goalBoard').innerHTML=goals.map(g=>`<article class="goal-card"><div style="display:flex;justify-content:space-between"><b>♡ ${g.k} — ${g.v}</b><span class="pill">Meta</span></div><small>${g.note}</small><div style="margin-top:10px;background:#f3e8ff;height:8px;border-radius:999px"><div style="width:${Math.min(90,g.v/2)}%;height:100%;background:#7a5cfa"></div></div></article>`).join('');
}

// DISCOGRAFÍA
function countForTrack(tr){ return [...official,...community].filter(p=>p.tracks.includes(tr)); }
function renderDisco(){
  const q=($('#searchDisco').value||'').toLowerCase();
  const era=$('#eraFilter').value;
  const filtered=discography.filter(a=>{ const mq=!q||a.title.toLowerCase().includes(q)||a.tracks.some(t=>t.toLowerCase().includes(q)); const me=era==='all'||a.era===era; return mq&&me; });
  $('#discoGrid').innerHTML=filtered.map(al=>{
    const cnt=[...official,...community].filter(p=>p.tracks.some(t=>al.tracks.includes(t))).length;
    return `<article class="disco" data-id="${al.id}"><div class="disco-cover" style="background:linear-gradient(135deg,${al.color},#fff)"><span class="badge">${al.type}</span>${al.title[0]}</div><div class="disco-info"><strong>${al.title}</strong><small>${al.year} • En ${cnt} playlists</small><div style="margin-top:8px;display:flex;flex-wrap:wrap">${al.tracks.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}<span class="tag">+${al.tracks.length-3}</span></div></div></article>`;
  }).join('');
  $$('.disco').forEach(el=>el.addEventListener('click',()=>openDisco(el.dataset.id)));
}
$('#searchDisco').addEventListener('input',renderDisco); $('#eraFilter').addEventListener('change',renderDisco);

function openDisco(id){
  const al=discography.find(a=>a.id===id);
  const modal=$('#discoModal'); const content=$('#discoModalContent');
  content.innerHTML=`<div style="display:flex;gap:14px;align-items:center"><div class="disco-cover" style="width:80px;height:80px;border-radius:18px;background:${al.color}">${al.title[0]}</div><div><p class="eyebrow">${al.type} • ${al.year}</p><h2 style="margin:0;font-family:Sora">${al.title}</h2><small>${al.tracks.length} canciones • Toca una para ver playlists</small></div></div><div style="margin-top:16px">${al.tracks.map(t=>`<div class="song-row" data-track="${t}"><div class="left"><b>${t}</b><small>${countForTrack(t).length?`En ${countForTrack(t).length} playlists`:'Aún no agregada'}</small><div class="in-list hidden" id="list-${t.replace(/[^a-zA-Z0-9]/g,'')}"></div></div><span>${countForTrack(t).length?'♡ Ver':'＋'}</span></div>`).join('')}</div><div class="notice">Toca cualquier canción para ver en qué playlists está. Si no aparece, agrégala en Biblioteca ARMY ♡</div>`;
  modal.classList.remove('hidden');
  content.querySelectorAll('.song-row').forEach(row=>{
    row.addEventListener('click',()=>{
      const tr=row.dataset.track; const box=document.getElementById('list-'+tr.replace(/[^a-zA-Z0-9]/g,''));
      const pls=countForTrack(tr);
      if(box.classList.contains('hidden')){
        if(pls.length===0){ box.innerHTML=`<div class="notice">No está en ninguna playlist. <button class="pill" onclick="document.querySelector('[data-view=comunidad]').click(); document.getElementById('discoModal').classList.add('hidden')">Agregar ahora →</button></div>`; }
        else { box.innerHTML=pls.map(p=>`<div class="mini"><span><b>${p.src}:</b> ${p.name} (${p.duration}m)</span><a href="${p.url}" target="_blank" class="pill">Abrir →</a></div>`).join(''); }
        box.classList.remove('hidden');
      } else box.classList.add('hidden');
    });
  });
}
$('#closeDisco').addEventListener('click',()=>$('#discoModal').classList.add('hidden'));
$('#discoModal').addEventListener('click',e=>{ if(e.target.id==='discoModal') e.currentTarget.classList.add('hidden'); });

// COMBOS - RANGO NUEVO 1-3h etc
let selRange={min:60,max:180};
$$('.dur-chip').forEach(chip=>{
  chip.addEventListener('click',()=>{
    $$('.dur-chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active');
    const r=chip.dataset.range;
    if(r==='custom'){ $('#customTimeLabel').classList.remove('hidden'); selRange={custom:true}; }
    else if(r==='1-3'){ selRange={min:60,max:180}; $('#customTimeLabel').classList.add('hidden'); }
    else if(r==='4-8'){ selRange={min:240,max:480}; $('#customTimeLabel').classList.add('hidden'); }
    else if(r==='9-12'){ selRange={min:540,max:720}; $('#customTimeLabel').classList.add('hidden'); }
    else if(r==='13-15'){ selRange={min:780,max:900}; $('#customTimeLabel').classList.add('hidden'); }
  });
});

$('#calculateButton').addEventListener('click',()=>{
  let target;
  if(selRange.custom){ target=parseInt($('#customTime').value||180); }
  else { target=Math.round((selRange.min+selRange.max)/2); }
  const src=$('#comboSource').value;
  const goal=$('#goalFilter').value;
  let pool=[...official,...community];
  if(src==='official') pool=official; if(src==='community') pool=community;
  if(goal){ const f=pool.filter(p=>p.tracks.includes(goal)); if(f.length) pool=f; }
  let combos=[];
  for(let i=0;i<pool.length;i++){ combos.push([pool[i]]); for(let j=i+1;j<pool.length;j++){ combos.push([pool[i],pool[j]]); for(let k=j+1;k<pool.length;k++){ combos.push([pool[i],pool[j],pool[k]]); for(let l=k+1;l<pool.length;l++){ combos.push([pool[i],pool[j],pool[k],pool[l]]); } } } }
  const minT=target*0.85, maxT=target*1.15;
  let viable=combos.filter(c=>{ const d=c.reduce((a,b)=>a+b.duration,0); return d>=minT&&d<=maxT; });
  if(viable.length===0){ viable=combos.map(c=>({c,diff:Math.abs(c.reduce((a,b)=>a+b.duration,0)-target)})).sort((a,b)=>a.diff-b.diff).slice(0,5).map(x=>x.c); }
  viable=viable.slice(0,6);
  const res=$('#comboResults');
  if(!viable.length){ res.innerHTML='<p class="notice">No hay combos. Agrega más playlists en Biblioteca ♡</p>'; return; }
  res.innerHTML=viable.map((combo,i)=>{
    const dur=combo.reduce((a,b)=>a+b.duration,0);
    const h=Math.floor(dur/60), m=dur%60;
    const tracks=[...new Set(combo.flatMap(p=>p.tracks))];
    return `<article class="playlist-card combo"><div class="combo-top"><b>Combo #${i+1} — ${h}h ${m}m (${dur} min)</b><span class="badge-dark">${combo.length} playlists</span></div><small>${tracks.length} canciones únicas</small><div style="margin:8px 0;display:flex;flex-wrap:wrap">${tracks.slice(0,12).map(t=>`<span class="tag">${t}</span>`).join('')}${tracks.length>12?`<span class="tag">+${tracks.length-12}</span>`:''}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${combo.map(p=>`<a href="${p.url}" target="_blank" class="pill">${p.src}: ${p.name} →</a>`).join('')}</div></article>`;
  }).join('');
  res.scrollIntoView({behavior:'smooth'});
});

function renderAll(){ renderLists(); renderDisco(); renderGoals(); }
renderAll();
