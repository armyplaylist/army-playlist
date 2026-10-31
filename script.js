
:root{--bg:#fdf8ff;--soft:#f7efff;--card:#ffffff;--lilac:#e9ddff;--deep:#d8c2ff;--dark:#7a5cfa;--text:#2a2040;--muted:#8a7aa8;--border:#efe6ff;--shadow:0 10px 30px rgba(122,92,250,0.08);--radius:24px}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Sora,system-ui;background:var(--bg);color:var(--text);padding-bottom:90px}
button{font:inherit;cursor:pointer}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:rgba(253,248,255,0.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
.brand{display:flex;gap:10px;align-items:center;font-weight:600}.brand-mark{width:34px;height:34px;display:grid;place-items:center;background:var(--lilac);border-radius:12px}
.menu-toggle{display:none;border:0;background:var(--soft);width:36px;height:36px;border-radius:12px}
.desktop-nav{display:flex;gap:6px}.nav-link{border:0;background:transparent;padding:8px 12px;border-radius:999px;color:var(--muted);transition:.2s;font-size:13px}.nav-link.active,.nav-link:hover{background:var(--lilac);color:var(--text)}
.app-shell{max-width:1100px;margin:0 auto;padding:24px 18px}
.view{display:none;animation:fade .25s ease}.view.active{display:block}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.welcome-card{display:grid;grid-template-columns:1.2fr .8fr;background:var(--card);border:1px solid var(--border);border-radius:32px;padding:28px;box-shadow:var(--shadow);overflow:hidden}
.eyebrow{font-size:11px;letter-spacing:1.6px;color:var(--muted);font-weight:600;margin:0 0 10px}
.welcome-card h1{font-size:48px;line-height:0.95;margin:0 0 14px;letter-spacing:-1px;font-family:Sora}.welcome-card h1 span{color:var(--dark)}
.welcome-card p{color:var(--muted);line-height:1.5;max-width:36ch}
.button{border:0;border-radius:999px;padding:12px 18px;font-weight:600}.button-primary{background:var(--text);color:white}.full-button{width:100%;padding:16px}
.welcome-art{position:relative;display:grid;place-items:center}.orb{width:170px;height:170px;border-radius:50%;background:radial-gradient(120% 120% at 30% 20%, #fff 0%, #f3e8ff 30%, #d8c2ff 60%, #c2a6ff 100%);display:grid;place-items:center;font-size:56px;box-shadow:var(--shadow);animation:float 4s ease-in-out infinite}
.spark{position:absolute;font-size:20px;animation:float 3s ease-in-out infinite}.s1{top:12%;right:18%}.s2{bottom:20%;left:8%}.s3{top:50%;right:5%}.s4{bottom:5%;right:30%}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.quick-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}
.stat-card{display:flex;gap:12px;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:14px 16px}
.stat-icon{width:36px;height:36px;display:grid;place-items:center;background:var(--soft);border-radius:12px}
.section-heading{display:flex;justify-content:space-between;align-items:end;margin:26px 0 12px}
.page-heading h1{font-size:42px;margin:6px 0;font-family:Sora}.page-heading p{color:var(--muted);max-width:55ch}
.planner-card{display:grid;gap:18px;background:var(--card);border:1px solid var(--border);border-radius:24px;padding:22px;box-shadow:var(--shadow)}
.duration-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.dur-chip{border:2px solid var(--border);background:var(--card);border-radius:18px;padding:14px;text-align:left;transition:.2s}
.dur-chip.active{border-color:var(--dark);background:var(--soft);box-shadow:var(--shadow)}
.dur-chip b{display:block;font-size:14px}.dur-chip small{color:var(--muted);font-size:11px}
.form-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.playlist-grid,.disco-grid,.goal-board{display:grid;gap:12px}
.playlist-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.disco-grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.filters{display:flex;gap:10px;margin:14px 0}.filters input,.filters select{flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--card)}
.disco{background:var(--card);border:1px solid var(--border);border-radius:22px;overflow:hidden;cursor:pointer;transition:.2s}.disco:hover{transform:translateY(-3px);border-color:var(--deep)}
.disco-cover{height:150px;display:grid;place-items:center;font-size:48px;background:linear-gradient(135deg,var(--soft),var(--lilac));position:relative}.disco-cover .badge{position:absolute;top:10px;left:10px;background:#fff;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:700}
.disco-info{padding:14px}.disco-info strong{display:block}.disco-info small{color:var(--muted)}
.track-card,.playlist-card,.goal-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:16px;box-shadow:var(--shadow)}
.playlist-card small{display:block;color:var(--muted);margin:6px 0}.count{background:var(--soft);padding:4px 10px;border-radius:999px;font-size:12px}
.form-panel{margin-top:20px;background:var(--card);border:1px dashed var(--deep);border-radius:20px;padding:0 16px 16px}.form-panel summary{padding:16px 0;font-weight:600;list-style:none}
.playlist-form{display:grid;gap:14px}.playlist-form label{display:grid;gap:6px;font-size:13px;font-weight:600}
.playlist-form input,.playlist-form textarea,.playlist-form select{padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--bg);font:inherit}
.results-area{margin-top:20px;display:grid;gap:14px}
.combo{border:2px solid var(--lilac);background:linear-gradient(180deg,#fff 0%, #fbf7ff 100%)}
.combo-top{display:flex;justify-content:space-between;align-items:center}
.tag{display:inline-block;background:var(--soft);border:1px solid var(--lilac);padding:4px 10px;border-radius:999px;font-size:11px;margin:2px}
.pill{display:inline-block;background:var(--soft);border:1px solid var(--lilac);padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600}
.badge-dark{background:var(--text);color:#fff;padding:4px 10px;border-radius:999px;font-size:11px}
.modal{position:fixed;inset:0;background:rgba(42,32,64,.38);backdrop-filter:blur(12px);display:grid;place-items:center;z-index:50;padding:16px}
.modal-card{background:#fff;border-radius:28px;padding:22px;width:100%;max-width:680px;max-height:90vh;overflow:auto;position:relative}
.modal-card.large{max-width:680px}
.close{position:absolute;top:12px;right:12px;border:0;background:var(--soft);width:32px;height:32px;border-radius:999px}
.song-row{padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--bg);display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;cursor:pointer}
.song-row .left b{display:block;font-size:14px}.song-row .left small{color:var(--muted)}
.in-list{margin-top:8px;display:grid;gap:6px}
.mini{padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:12px;display:flex;justify-content:space-between;align-items:center}
.notice{background:var(--soft);border:1px solid var(--border);border-radius:16px;padding:12px 14px;color:var(--muted);font-size:12px;margin-top:16px}
.hidden{display:none !important}
.mobile-nav{display:none;position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border:1px solid var(--border);border-radius:999px;padding:6px;box-shadow:var(--shadow);z-index:30;gap:4px}
.mobile-nav button{border:0;background:transparent;padding:8px 12px;border-radius:999px;display:flex;flex-direction:column;align-items:center;font-size:11px;color:var(--muted)}
.mobile-nav button.active{background:var(--text);color:white}
footer{text-align:center;color:var(--muted);font-size:11px;padding:30px 0}
@media(max-width:820px){.welcome-card{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}.disco-grid{grid-template-columns:1fr 1fr}.desktop-nav{display:none}.menu-toggle{display:block}.mobile-nav{display:flex}.desktop-nav.open{display:flex;position:absolute;top:60px;left:12px;right:12px;background:white;border:1px solid var(--border);border-radius:20px;padding:10px;flex-direction:column}}
