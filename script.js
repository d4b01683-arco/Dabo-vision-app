const API = 'a6178823f5e2f865dfd88e8cade51391';
const cats = [
    {n:'Estrenos Nuevos', id:'now_playing', t:'movie'}, {n:'Animes', id:16, t:'discover'}, {n:'Series VIP', id:'top_rated', t:'tv'}, {n:'Películas Tendencia', id:'popular', t:'movie'},
    {n:'Acción Élite', id:28, t:'discover'}, {n:'Comedia', id:35, t:'discover'}, {n:'Terror', id:27, t:'discover'}, {n:'Fantasías', id:14, t:'discover'},
    {n:'Historias', id:36, t:'discover'}, {n:'Ciencia Ficción', id:878, t:'discover'}, {n:'Humor & StandUp', id:10751, t:'discover'}, {n:'Colección Universal', id:'trending', t:'all'}
];

const bg = document.getElementById('bg-dinamico');
const audio = document.getElementById('audio-ambiente');
let favorites = JSON.parse(localStorage.getItem('dabo_favs')) || [];

let downloadData = JSON.parse(localStorage.getItem('dabo_downloads')) || { count: 5, date: new Date().toLocaleDateString() };
if(downloadData.date !== new Date().toLocaleDateString()) downloadData = { count: 5, date: new Date().toLocaleDateString() };
document.getElementById('dl-count').innerText = downloadData.count;

bg.style.backgroundImage = "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop')";
particlesJS('particles-js', { particles: { number: { value: 30 }, color: { value: '#D4AF37' }, opacity: { value: 0.3 }, size: { value: 1.5 }, line_linked: { enable: true, distance: 150, color: '#D4AF37', opacity: 0.1 }, move: { enable: true, speed: 1.5 } } });

let clicks = 0; let startX = 0;
document.getElementById('mainLogo').addEventListener('click', function() {
    clicks++; if(clicks === 3) {
        this.style.color = "#fff";
        window.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, {once: true});
        window.addEventListener('touchend', (e) => {
            if(e.changedTouches[0].clientX - startX > 80 && prompt("PIN ARQUITECTO:") === "110103") {
                audio.play().catch(()=>{}); document.getElementById('paywall').classList.add('hidden');
                document.getElementById('app-ui').classList.remove('hidden'); document.getElementById('vault-ui').style.display = 'block'; render();
            }
            clicks = 0; this.style.color = "#D4AF37";
        }, {once: true});
    }
});

function descargarVideo() {
    if(downloadData.count > 0) {
        downloadData.count--;
        localStorage.setItem('dabo_downloads', JSON.stringify(downloadData));
        document.getElementById('dl-count').innerText = downloadData.count;
        alert("Sincronizando descarga con la nube de Dabo Vision...");
    } else { alert("Límite diario alcanzado (5/5)."); }
}

function toggleNight() { const f = document.getElementById('night-filter'); f.style.display = (f.style.display === 'block') ? 'none' : 'block'; }
function cerrarBienvenida() { document.getElementById('welcome-modal').style.display = 'none'; }
function cerrarSesion() { audio.pause(); audio.currentTime = 0; document.getElementById('app-ui').classList.add('hidden'); document.getElementById('paywall').classList.remove('hidden'); }
function validarAcceso() { if(!document.getElementById('user-login').value || !document.getElementById('pass-login').value) return; audio.play().catch(()=>{}); document.getElementById('welcome-modal').style.display = 'flex'; document.getElementById('paywall').classList.add('hidden'); document.getElementById('app-ui').classList.remove('hidden'); render(); }

async function render() {
    updateFavRow(); const c = document.getElementById('catalog'); c.innerHTML = '';
    bg.style.backgroundImage = "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')";
    for(const g of cats) {
        const row = document.createElement('div');
        row.innerHTML = `<h3 class="px-6 text-[10px] font-black uppercase text-gold mb-3 italic tracking-tighter">${g.n}</h3><div class="video-row" id="g-${g.id}"></div>`;
        c.appendChild(row);
        let url;
        if(g.t === 'discover') url = `https://api.themoviedb.org/3/discover/movie?api_key=${API}&with_genres=${g.id}&language=es-ES`;
        else if(g.t === 'movie') url = `https://api.themoviedb.org/3/movie/${g.id}?api_key=${API}&language=es-ES`;
        else if(g.t === 'tv') url = `https://api.themoviedb.org/3/tv/${g.id}?api_key=${API}&language=es-ES`;
        else url = `https://api.themoviedb.org/3/trending/all/day?api_key=${API}&language=es-ES`;
        fetch(url).then(r => r.json()).then(data => { document.getElementById(`g-${g.id}`).innerHTML = (data.results || []).map(m => cardHTML(m)).join(''); });
    }
}

function cardHTML(m) {
    const isFav = favorites.find(f => f.id === m.id); if(!m.poster_path) return '';
    return `<div class="movie-card" onclick="detectarTipo(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"><div class="fav-btn" onclick="event.stopPropagation(); toggleFav(${m.id}, '${m.poster_path}', '${m.media_type || (m.name ? 'tv' : 'movie')}')">${isFav ? '❤️' : '♡'}</div></div>`;
}

function toggleFav(id, path, tipo) {
    const index = favorites.findIndex(f => f.id === id); if(index > -1) favorites.splice(index, 1); else favorites.push({id, path, tipo});
    localStorage.setItem('dabo_favs', JSON.stringify(favorites)); render();
}

function updateFavRow() {
    const sec = document.getElementById('favorites-section'); const row = document.getElementById('fav-row');
    if(favorites.length > 0) { sec.classList.remove('hidden'); row.innerHTML = favorites.map(m => `<div class="movie-card" onclick="detectarTipo(${m.id}, '${m.tipo}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.path}')"><div class="fav-btn" onclick="event.stopPropagation(); toggleFav(${m.id}, '${m.path}', '${m.tipo}')">❤️</div></div>`).join('');
    } else { sec.classList.add('hidden'); }
}

function detectarTipo(id, tipo) { if(tipo === 'tv' || tipo === 'series') cargarSerie(id); else prepararVideo(id, 'movie'); }

async function cargarSerie(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API}&language=es-ES`);
    const data = await res.json(); document.getElementById('series-overlay').style.display = 'flex';
    document.getElementById('series-title').innerText = data.name; bg.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`;
    document.getElementById('series-content').innerHTML = (data.seasons || []).filter(s => s.season_number > 0).map(s => `<div class="glass-panel mb-4 flex justify-between items-center" onclick="cargarEpisodios(${id}, ${s.season_number})"><div><h4 class="text-gold font-black uppercase text-sm">${s.name}</h4><p class="text-[10px] text-gray-400">${s.episode_count} Episodios</p></div><span class="text-gold">❯</span></div>`).join('');
}

async function cargarEpisodios(tvId, sNum) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${sNum}?api_key=${API}&language=es-ES`);
    const data = await res.json();
    document.getElementById('series-content').innerHTML = `<button onclick="cargarSerie(${tvId})" class="text-gold text-[10px] mb-6 border border-gold/30 px-4 py-1 rounded-full">← VOLVER</button>` + 
    data.episodes.map(e => `<div class="p-4 border-b border-white/5" onclick="prepararVideo(${tvId}, 'tv', ${sNum}, ${e.episode_number})"><p class="text-[11px] font-bold">${e.episode_number}. ${e.name}</p></div>`).join('');
}

function prepararVideo(id, tipo, s=1, e=1) {
    document.getElementById('series-overlay').style.display = 'none'; document.getElementById('video-overlay').style.display = 'flex';
    document.getElementById('player-frame').innerHTML = `<button onclick="animarPlay('${id}','${tipo}',${s},${e})" id="play-btn-main" class="bg-gold text-black font-black px-16 py-8 rounded-full text-2xl shadow-[0_0_60px_rgba(212,175,55,0.5)] z-20">PLAY 🎬</button><div id="actual-video" class="w-full h-full hidden"></div>`;
}

function animarPlay(id, tipo, s, e) {
    const blast = document.createElement('div'); blast.className = 'gold-blast'; document.getElementById('player-frame').appendChild(blast);
    setTimeout(() => {
        audio.pause(); bg.style.opacity = "0"; document.getElementById('play-btn-main').classList.add('hidden');
        const v = document.getElementById('actual-video'); v.classList.remove('hidden');
        v.innerHTML = `<iframe src="${tipo === 'movie' ? `https://vidsrc.icu/embed/movie/${id}` : `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>`;
        let p = 0; const interval = setInterval(() => { if(document.getElementById('video-overlay').style.display === 'none') { clearInterval(interval); return; } p += 0.1; document.getElementById('progress-bar').style.width = (p % 100) + "%"; }, 1000);
    }, 600);
}

function cerrarVideo() { audio.play(); bg.style.opacity = "1"; document.getElementById('video-overlay').style.display = 'none'; document.getElementById('player-frame').innerHTML = ''; document.getElementById('progress-bar').style.width = "0%"; }
function buscar(q) { if(q.length < 3) { if(q.length === 0) render(); return; } fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API}&query=${q}&language=es-ES`).then(r => r.json()).then(d => { document.getElementById('catalog').innerHTML = `<div class="px-6 mb-8"><button onclick="render()" class="text-gold text-[10px] border border-gold/40 px-6 py-2 rounded-full">← Volver</button></div><div class="video-row">${d.results.filter(m=>m.poster_path).map(m => cardHTML(m)).join('')}</div>`; }); }
