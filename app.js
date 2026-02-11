function escapeHtml(str){
  return (str || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}

function looksLikeIframe(s){
  if(!s) return false;
  const t = s.trim();
  if(!t.toLowerCase().startsWith('<iframe')) return false;
  if(!t.toLowerCase().includes('src=')) return false;
  return true;
}

function store(key, val){ localStorage.setItem(key, val); }
function load(key, fallback=''){ return localStorage.getItem(key) ?? fallback; }

function initEditor(){
  const from = load('v_from','From Me');
  const to = load('v_to','My Love');

  document.getElementById('titleTo').textContent = `To: ${to}`;
  document.getElementById('fromLine').textContent = `From: ${from}`;

  // Restore previous draft if exists
  document.getElementById('headline').textContent = load('v_headline','A not so love letter');
  document.getElementById('letter').value = load('v_letter','');
  document.getElementById('song1').value = load('v_song1','');
  document.getElementById('song2').value = load('v_song2','');
  document.getElementById('song3').value = load('v_song3','');
  document.getElementById('movieEmbed').value = load('v_movie','');
  document.getElementById('noteA').value = load('v_noteA','');
  document.getElementById('noteB').value = load('v_noteB','');
  document.getElementById('noteC').value = load('v_noteC','');

  // Photos restore
  const photoJson = load('v_photos','[]');
  let photos = [];
  try { photos = JSON.parse(photoJson); } catch(e){ photos = []; }
  renderPhotoGrid(photos);

  // Save on changes
  const saveAll = () => {
    store('v_headline', document.getElementById('headline').textContent.trim());
    store('v_letter', document.getElementById('letter').value);
    store('v_song1', document.getElementById('song1').value);
    store('v_song2', document.getElementById('song2').value);
    store('v_song3', document.getElementById('song3').value);
    store('v_movie', document.getElementById('movieEmbed').value);
    store('v_noteA', document.getElementById('noteA').value);
    store('v_noteB', document.getElementById('noteB').value);
    store('v_noteC', document.getElementById('noteC').value);
    store('v_photos', JSON.stringify(photos));
  };

  document.getElementById('headline').addEventListener('input', saveAll);
  ['letter','song1','song2','song3','movieEmbed','noteA','noteB','noteC'].forEach(id=>{
    document.getElementById(id).addEventListener('input', saveAll);
  });

  document.getElementById('photosInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []).slice(0,4);
    const readFile = (f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    });
    for (const f of files){
      const dataUrl = await readFile(f);
      photos.unshift(dataUrl);
    }
    photos = photos.slice(0,4);
    renderPhotoGrid(photos);
    saveAll();
    e.target.value = '';
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    saveAll();
    window.location.href = 'result.html';
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    const keepFrom = load('v_from','From Me');
    const keepTo = load('v_to','My Love');
    localStorage.clear();
    store('v_from', keepFrom);
    store('v_to', keepTo);
    window.location.reload();
  });

  function renderPhotoGrid(arr){
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '';
    arr.forEach((src, idx) => {
      const tile = document.createElement('div');
      tile.className = 'photo-tile';
      tile.innerHTML = `<img src="${src}" alt="photo ${idx+1}">`;
      grid.appendChild(tile);
    });
  }
}

function initResult(){
  const from = load('v_from','From Me');
  const to = load('v_to','My Love');

  document.getElementById('resultTitle').textContent = `For ${to} 🤍`;
  document.getElementById('letterHeadline').textContent = load('v_headline','A not so love letter');
  document.getElementById('letterMeta').textContent = `From: ${from} • To: ${to}`;

  const letter = load('v_letter','');
  document.getElementById('letterText').textContent = letter;

  // Notes
  const notes = [load('v_noteA',''), load('v_noteB',''), load('v_noteC','')].filter(Boolean);
  const notesRow = document.getElementById('notesRow');
  notesRow.innerHTML = '';
  notes.forEach(n => {
    const span = document.createElement('span');
    span.className = 'sticker';
    span.textContent = n;
    notesRow.appendChild(span);
  });

  // Embeds (songs)
  const songsOut = document.getElementById('songsOut');
  songsOut.innerHTML = '';
  [load('v_song1',''), load('v_song2',''), load('v_song3','')].forEach(code => {
    if(!code.trim()) return;
    const wrap = document.createElement('div');
    wrap.className = 'embed-wrap';
    if(looksLikeIframe(code)){
      wrap.innerHTML = code.trim();
    } else {
      wrap.innerHTML = `<div class="muted small">Embed not recognized. Paste an iframe embed code.</div>`;
    }
    songsOut.appendChild(wrap);
  });

  // Movie
  const movieOut = document.getElementById('movieOut');
  const mv = load('v_movie','').trim();
  movieOut.innerHTML = '';
  if(mv){
    const wrap = document.createElement('div');
    wrap.className = 'embed-wrap';
    wrap.innerHTML = looksLikeIframe(mv) ? mv : `<div class="muted small">Embed not recognized. Paste an iframe embed code.</div>`;
    movieOut.appendChild(wrap);
  } else {
    movieOut.innerHTML = `<div class="muted small">No movie embed.</div>`;
  }

  // Photos
  let photos = [];
  try { photos = JSON.parse(load('v_photos','[]')); } catch(e){ photos=[]; }
  const photosOut = document.getElementById('photosOut');
  photosOut.innerHTML = '';
  photos.forEach((src) => {
    const p = document.createElement('div');
    p.className = 'polaroid';
    p.innerHTML = `<img src="${src}" alt="photo">`;
    photosOut.appendChild(p);
  });
  if(!photos.length){
    photosOut.innerHTML = `<div class="muted small">No photos uploaded.</div>`;
  }

  // Envelope toggle
  const env = document.getElementById('env');
  env.addEventListener('click', () => env.classList.toggle('open'));
}
