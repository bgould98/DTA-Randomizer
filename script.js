/* =========================================================================
   PORTAL CRAWL RANDOMIZER — CONFIG
   -------------------------------------------------------------------------
   Everything you'd want to tweak per scenario tier is in TIERS below.

   totalTiles: array of allowed board sizes (excluding portal entrance and
     mini-boss) — a fresh roll picks one at random, e.g. [11,12].

   tileCounts: for each monster level (1=green/I, 2=blue/II, 3=purple/III,
     4=gold/IV) a [min,max] range. The generator fills as close to
     totalTiles as it can while respecting these ranges.

   portalEntrance / miniBoss: how many of each (normally 1 each).

   miniBossSlots: number of golden diamond token slots on the mini-boss tile.

   miniBossKeys: how many golden diamond key pickups get placed on crawl tiles
     to unlock the mini-boss.

   salves: how many existing tiles get a Salve icon in their corner
     (can land on regular level tiles or the mini-boss tile, never portal).

   chests: array of {level, count} — that many existing tiles of that
     level get a chest icon in their corner (never on portal or mini-boss).

   shop: array of {type, color, count} — small "?" cards in the Conclusion
     panel. Add more entries for higher tiers if you want more reward types.
   ========================================================================= */

const TIERS = {
  1: {
    accent:'--tier1',
    totalTiles: [11,12],
    tileCounts: { 1:[6,7], 2:[4,5], 3:[1,1], 4:[0,0] },
    portalEntrance: 1,
    miniBoss: 1,
    miniBossSlots: 3,
    miniBossKeys: 3,
    salves: 3,
    chests: [ {level:1, count:1}, {level:2, count:2} ],
    health: [35,18,13,10],
    startingSalves: 2,
    gold: [15,10,5,1],
    shop: [ {type:'common', color:'#4b9e5f', count:3}, {type:'rare', color:'#3f7fc9', count:1} ],
    kingsHand: { maxPerTurn:1, rollRange:'4-6' },
  },
  3: {
    accent:'--tier3',
    totalTiles: [11,12],
    tileCounts: { 1:[3,4], 2:[5,6], 3:[2,2], 4:[1,1] },
    portalEntrance: 1,
    miniBoss: 1,
    miniBossSlots: 3,
    miniBossKeys: 3,
    salves: 4,
    chests: [ {level:1, count:1}, {level:2, count:1}, {level:3, count:1} ],
    health: [35,18,13,10],
    startingSalves: "Previous # of Salves",
    gold: [15,10,5,1],
    shop: [ {type:'common', color:'#4b9e5f', count:2}, {type:'rare', color:'#3f7fc9', count:2} ],
    kingsHand: { maxPerTurn:1, rollRange:'4-6' },
  },
  5: {
    accent:'--tier5',
    totalTiles: [11,12],
    tileCounts: { 1:[2,2], 2:[4,5], 3:[3,3], 4:[2,2] },
    portalEntrance: 1,
    miniBoss: 1,
    miniBossSlots: 3,
    miniBossKeys: 3,
    salves: 3,
    chests: [ {level:1, count:2}, {level:3, count:2} ],
    health: [35,18,13,10],
    startingSalves: "Previous # of Salves",
    gold: [15,10,5,1],
    shop: [ {type:'common', color:'#4b9e5f', count:1}, {type:'rare', color:'#3f7fc9', count:2}, {type:'epic', color:'#7a4fb0', count:1} ],
    kingsHand: { maxPerTurn:1, rollRange:'3-6' },
  },
  7: {
    accent:'--tier7',
    totalTiles: [11,12],
    tileCounts: { 1:[1,2], 2:[3,5], 3:[5,5], 4:[3,3] },
    portalEntrance: 1,
    miniBoss: 1,
    miniBossSlots: 3,
    miniBossKeys: 3,
    salves: 2,
    chests: [ {level:1, count:2}, {level:3, count:4},],
    health: [35,18,13,10],
    startingSalves: "Previous # of Salves",
    gold: [15,10,5,1],
    shop: [ {type:'common', color:'#4b9e5f', count:1}, {type:'rare', color:'#3f7fc9', count:1}, {type:'epic', color:'#7a4fb0', count:1}, {type:'legendary', color:'#d9a53a', count:1} ],
    kingsHand: { maxPerTurn:1, rollRange:'2-6' },
  },
};

let currentTier = 1;
let currentSeed = '';
let activeRandom = Math.random;

function makeSeed(){
  return `${Date.now().toString(36)}-${Math.floor(Math.random()*0x100000000).toString(36)}`;
}
function seedToRandom(seed){
  let h = 2166136261;
  for(let i=0;i<seed.length;i++){
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function(){
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rand(){ return activeRandom(); }

function shareSeed(){ return `tier${currentTier}-${currentSeed}`; }

function parseSeedInput(value){
  const raw = value.trim();
  const match = raw.match(/^tier(1|3|5|7)-(.+)$/i);
  if(match) return { tier: parseInt(match[1]), seed: match[2].trim() };
  return { tier: currentTier, seed: raw };
}

function setActiveTier(tier){
  currentTier = tier;
  document.querySelectorAll('.tier-btn').forEach(btn=>{
    btn.classList.toggle('active', parseInt(btn.dataset.t) === currentTier);
  });
}

function updateSeedInput(){
  const input = document.getElementById('seedInput');
  if(input) input.value = shareSeed();
}

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rand()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function pick(arr){ return arr[Math.floor(rand()*arr.length)]; }

const CELL = 46, STEP = CELL+6;
const ORIGIN = {x:60,y:60};

function cellPos(cx,cy){ return {x:ORIGIN.x+cx*STEP, y:ORIGIN.y+cy*STEP}; }
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function levelColor(l){ return cssVar(['--lvl1','--lvl2','--lvl3','--lvl4'][l-1]); }
function levelRoman(l){ return ['I','II','III','IV'][l-1]; }

/* ---------- pick per-level tile counts that hit the total as closely as possible ---------- */
function pickLevelCounts(tileCounts, target){
  const levels = [1,2,3,4];
  const mins = levels.map(l=>tileCounts[l][0]);
  const maxs = levels.map(l=>tileCounts[l][1]);
  const counts = mins.slice();
  let remaining = target - counts.reduce((a,b)=>a+b,0);
  while(remaining > 0){
    const room = levels.map((l,i)=>i).filter(i=>counts[i] < maxs[i]);
    if(room.length === 0) break;
    counts[pick(room)]++;
    remaining--;
  }
  return counts;
}

/* ---------- random-walk path generator ---------- */
function generateDungeon(tier){
  const cfg = TIERS[tier];
  const target = pick(cfg.totalTiles);
  const counts = pickLevelCounts(cfg.tileCounts, target);
  let levelTiles = [];
  counts.forEach((c,i)=>{ for(let k=0;k<c;k++) levelTiles.push({level:i+1}); });
  levelTiles = shuffle(levelTiles);

  const portalCount = cfg.portalEntrance;
  const bossCount = cfg.miniBoss;
  const pathLength = levelTiles.length + portalCount + bossCount;

  const key = (x,y)=>`${x},${y}`;
  const grid = new Map();
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let cx=0, cy=0;
  const order = [{x:0,y:0}];
  grid.set(key(0,0), true);

  let attempts = 0;
  while(order.length < pathLength && attempts < 800){
    attempts++;
    const dirsShuffled = shuffle(dirs);
    let moved = false;
    for(const [dx,dy] of dirsShuffled){
      const nx=cx+dx, ny=cy+dy;
      if(!grid.has(key(nx,ny))){
        grid.set(key(nx,ny), true);
        order.push({x:nx,y:ny});
        cx=nx; cy=ny;
        moved = true;
        break;
      }
    }
    if(!moved){
      const from = order[Math.floor(rand()*order.length)];
      cx = from.x; cy = from.y;
    }
  }

  const nodes = order.map(p=>({x:p.x, y:p.y}));
  for(let i=0;i<portalCount;i++) Object.assign(nodes[i], {special:'portal'});
  const bossStart = nodes.length - bossCount;
  for(let i=0;i<bossCount;i++) Object.assign(nodes[bossStart+i], {special:'miniboss', slots:cfg.miniBossSlots});
  let li = 0;
  for(let i=portalCount;i<bossStart;i++){ nodes[i].level = levelTiles[li++]?.level; }

  const pickupCount = n => (n.chest ? 1 : 0) + (n.salve ? 1 : 0) + (n.miniBossKey ? 1 : 0);

  // overlay chests onto existing level tiles (never portal / mini-boss)
  const middleNodes = nodes.slice(portalCount, bossStart);
  for(const c of cfg.chests){
    const candidates = middleNodes.filter(n=>n.level===c.level && !n.chest);
    shuffle(candidates).slice(0, c.count).forEach(n=>{ n.chest = c.level; });
  }
  // overlay salves onto existing tiles (level tiles or the mini-boss tile)
  const salvePool = middleNodes.concat(nodes.slice(bossStart)).filter(n=>!n.salve && pickupCount(n) < 2);
  shuffle(salvePool).slice(0, cfg.salves).forEach(n=>{ n.salve = true; });
  // overlay mini-boss keys onto crawl tiles; any two pickup types may share a tile, but never all three.
  const keyPool = middleNodes.filter(n=>!n.miniBossKey && pickupCount(n) < 2);
  shuffle(keyPool).slice(0, cfg.miniBossKeys).forEach(n=>{ n.miniBossKey = true; });

  // edges between orthogonally adjacent placed nodes
  const posKey = new Map(nodes.map(n=>[key(n.x,n.y), n]));
  const edges = [];
  const seen = new Set();
  for(const n of nodes){
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
      const other = posKey.get(key(n.x+dx,n.y+dy));
      if(other){
        const ek = [n,other].sort((a,b)=> (a.x-b.x)||(a.y-b.y)).map(p=>key(p.x,p.y)).join('|');
        if(!seen.has(ek)){ seen.add(ek); edges.push({a:n,b:other}); }
      }
    }
  }

  return { nodes, edges };
}

/* ---------- icon builders (reused in board + panels + legend) ---------- */
function svgSalve(cx,cy,r=9,fill='#4fae8a'){
  return `
    <path d="M ${cx-r*0.5} ${cy-r} h${r} v${r*0.5}
      c${r*0.6} ${r*0.3} ${r*0.9} ${r*0.9} ${r*0.9} ${r*1.3}
      a${r*0.9} ${r*0.9} 0 1 1 -${r*2.8} 0
      c0 -${r*0.4} ${r*0.3} -1 ${r*0.9} -${r*1.3} z"
      fill="${fill}" stroke="#1c2028" stroke-width="1"/>
    <rect x="${cx-r*0.35}" y="${cy-r*1.15}" width="${r*0.7}" height="${r*0.35}" fill="${fill}" stroke="#1c2028" stroke-width="1"/>`;
}
function svgCard(cx,cy,color,w=20,h=27){
  return `
    <rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="3" fill="${color}" stroke="#00000055" stroke-width="1.5"/>
    <text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="15" font-weight="800" fill="#ffffffcc">?</text>`;
}
/* small chest badge, reused both full-size (legend) and scaled into a tile corner */
function svgChestGlyph(cx,cy,level,scale=1){
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
      <rect x="-13" y="-8" width="26" height="16" rx="2" fill="#7a5324" stroke="#2e2210" stroke-width="1.5"/>
      <rect x="-13" y="-13" width="26" height="7" rx="2" fill="#a3742f" stroke="#2e2210" stroke-width="1.5"/>
      <circle cx="0" cy="-6" r="2" fill="#f0d78a"/>
      <circle cx="14" cy="-14" r="8" fill="${levelColor(level)}" stroke="#0008" stroke-width="1"/>
      <text x="14" y="-10" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${level}</text>
    </g>`;
}
function svgMiniBossKey(cx,cy,scale=1){
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
      <rect x="-6" y="-6" width="12" height="12" fill="#f0d78a" stroke="#2e2210" stroke-width="1.4" transform="rotate(45)"/>
      <rect x="-2.7" y="-2.7" width="5.4" height="5.4" fill="#fff1ad" opacity=".65" transform="rotate(45)"/>
    </g>`;
}

/* ---------- tile + corner-overlay rendering ---------- */
function svgTile(n){
  const p = cellPos(n.x,n.y);
  const cx=p.x+CELL/2, cy=p.y+CELL/2;
  let fill, inner;

  if(n.special==='portal'){
    fill = '#3a1418';
    inner = `
      <ellipse cx="${cx}" cy="${cy}" rx="14" ry="14" fill="#8a2a2a"/>
      <ellipse cx="${cx}" cy="${cy}" rx="9" ry="9" fill="#c0392b"/>
      <ellipse cx="${cx}" cy="${cy}" rx="5" ry="6" fill="#5b2a8c"/>
      <ellipse cx="${cx}" cy="${cy}" rx="2.2" ry="2.8" fill="#c9a6f2"/>`;
  } else if(n.special==='miniboss'){
    fill = '#7a5a1e';
    const slots = n.slots||3;
    let dots = '';
    for(let i=0;i<slots;i++){
      const ang = -90 + (i-(slots-1)/2)*40;
      const rad = ang*Math.PI/180;
      const dx = cx + Math.cos(rad)*13, dy = cy + Math.sin(rad)*13 + 5;
      dots += `<rect x="${dx-3.2}" y="${dy-3.2}" width="6.4" height="6.4" fill="none" stroke="#f0d78a" stroke-width="1.3" transform="rotate(45 ${dx} ${dy})"/>`;
    }
    inner = `<rect x="${cx-8}" y="${cy-10}" width="16" height="16" rx="2" fill="#15161a" stroke="#f0d78a" stroke-width="1.5"/>${dots}`;
  } else {
    fill = levelColor(n.level);
    inner = `<text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">${levelRoman(n.level)}</text>`;
  }

  let overlay = '';
  if(n.chest){ overlay += svgChestGlyph(p.x+CELL-9, p.y+11, n.chest, 0.5); }
  if(n.salve){ overlay += svgSalve(p.x+9, p.y+9, 6); }
  if(n.miniBossKey){ overlay += svgMiniBossKey(p.x+CELL-10, p.y+CELL-10, 0.72); }

  return `<g>
    <rect x="${p.x}" y="${p.y}" width="${CELL}" height="${CELL}" rx="6" fill="${fill}" stroke="#00000055" stroke-width="1.5"/>
    ${inner}
    ${overlay}
  </g>`;
}
function svgEdge(e){
  const a = cellPos(e.a.x,e.a.y), b = cellPos(e.b.x,e.b.y);
  const ax=a.x+CELL/2, ay=a.y+CELL/2, bx=b.x+CELL/2, by=b.y+CELL/2;
  return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#ffffff55" stroke-width="2"/>`;
}

/* ---------- board render ---------- */
function render(seed = makeSeed()){
  currentSeed = String(seed);
  activeRandom = seedToRandom(shareSeed());
  const {nodes, edges} = generateDungeon(currentTier);
  const svg = document.getElementById('board');
  const xs = nodes.map(n=>n.x), ys = nodes.map(n=>n.y);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  ORIGIN.x = 60 - minX*STEP;
  ORIGIN.y = 60 - minY*STEP;
  const vbW = (maxX-minX+1)*STEP + 100, vbH = (maxY-minY+1)*STEP + 100;
  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = edges.map(svgEdge).join('') + nodes.map(svgTile).join('');
  updateSeedInput();
  syncBoardPanelHeight();
}

function syncBoardPanelHeight(){
  const layout = document.querySelector('.layout');
  const boardFrame = document.querySelector('.board-frame');
  const sidebar = document.querySelector('.sidebar');
  if(!layout || !boardFrame || !sidebar) return;
  if(window.matchMedia('(max-width:760px)').matches){
    boardFrame.style.height = '';
    return;
  }
  boardFrame.style.height = `${sidebar.offsetHeight}px`;
}

/* ---------- Hero Setup panel ---------- */
function renderSetup(){
  const cfg = TIERS[currentTier];
  document.getElementById('setup').innerHTML = `
    <div class="panel-title">Hero Setup</div>
    <div class="row"><span>Health <em>1/2/3/4 players</em></span><b>${cfg.health.join(' / ')}</b></div>
    <div class="row"><span>Starting Salves</span>
      <b>${cfg.startingSalves}<svg class="icon-inline" width="20" height="20" viewBox="0 0 20 20">${svgSalve(10,11,7)}</svg></b></div>
    <div class="row"><span>Starting Gold</span><b>${cfg.gold.join(' / ')}</b></div>
  `;
}

/* ---------- Conclusion panel ---------- */
function shopRowHTML(cfg){
  return `<div class="shop-row">${cfg.shop.map(s=>`
    <div class="shop-chip">
      <svg width="20" height="27" viewBox="0 0 20 27">${svgCard(10,13.5,s.color)}</svg>
      × ${s.count}
    </div>`).join('')}</div>`;
}
function renderConclusion(){
  const cfg = TIERS[currentTier];
  const salveIcon = `<svg class="icon-inline" width="16" height="16" viewBox="0 0 16 16">${svgSalve(8,9,5.5)}</svg>`;
  document.getElementById('conclusion').innerHTML = `
    <div class="panel-title">Conclusion</div>
    <div class="conclusion-block defeat">
      <h3>Upon Defeat</h3>
      ${shopRowHTML(cfg)}
      <ul>
        <li>Record loss on score sheet, and increase Starting Salves ${salveIcon} by 3</li>
        <li>Repeat this scenario</li>
      </ul>
    </div>
    <div class="conclusion-block victory">
      <h3>Upon Victory</h3>
      ${shopRowHTML(cfg)}
      <ul>
        <li>Record win on score sheet</li>
        <li>Advance to the next scenario</li>
      </ul>
    </div>
  `;
}

/* ---------- King's Hand Tokens panel ---------- */
function renderKingsHand(){
  const cfg = TIERS[currentTier];
  document.getElementById('kingshand').innerHTML = `
    <div class="panel-title">King's Hand Tokens</div>
    <div class="row"><span>Starting tokens:</span><b>Shown on minions</b></div>
    <div class="row"><span>Max tokens used per turn:</span><b>${cfg.kingsHand.maxPerTurn}</b></div>
    <div class="row"><span>Successful roll values:</span><b>${cfg.kingsHand.rollRange}</b></div>
  `;
}

/* ---------- legend ---------- */
function renderLegend(){
  const items = [
    {svg:`<rect width="26" height="26" rx="5" fill="${cssVar('--lvl1')}"/><text x="13" y="18" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">I</text>`, label:'Level I-IV minion tile'},
    {svg:`<rect width="26" height="26" rx="5" fill="#3a1418"/><ellipse cx="13" cy="13" rx="8" ry="8" fill="#8a2a2a"/><ellipse cx="13" cy="13" rx="5" ry="5" fill="#c0392b"/><ellipse cx="13" cy="13" rx="3" ry="3.5" fill="#5b2a8c"/>`, label:'Portal entrance'},
    {svg:`<rect width="26" height="26" rx="5" fill="#7a5a1e"/><rect x="8" y="7" width="10" height="10" rx="2" fill="#15161a" stroke="#f0d78a" stroke-width="1.3"/>`, label:'Mini-boss (token slots)'},
    {svg:`<rect width="26" height="26" rx="5" fill="${cssVar('--lvl1')}"/><text x="11" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">I</text>${svgChestGlyph(21,9,1,0.42)}`, label:'Loot chest — corner icon on a level tile'},
    {svg:`<rect width="26" height="26" rx="5" fill="${cssVar('--lvl2')}"/><text x="13" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">II</text>${svgSalve(7,8,5)}`, label:'Healing salve — corner icon on a tile'},
    {svg:`<rect width="26" height="26" rx="5" fill="${cssVar('--lvl3')}"/><text x="12" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">III</text>${svgMiniBossKey(20,20,0.55)}`, label:'Mini-boss key — golden diamond pickup'},
    {svg:svgCard(13,13,'#4b9e5f',18,24), label:'Common card reward'},
    {svg:svgCard(13,13,'#3f7fc9',18,24), label:'Rare card reward'},
    {svg:svgCard(13,13,'#7a4fb0',18,24), label:'Epic card reward'},
    {svg:svgCard(13,13,'#d9a53a',18,24), label:'Legendary card reward'},
  ];
  document.getElementById('legendGrid').innerHTML = items.map(i=>`
    <div class="legend-item">
      <svg width="26" height="26" viewBox="0 0 26 26">${i.svg}</svg>
      <span>${i.label}</span>
    </div>`).join('');
}

/* ---------- wiring ---------- */
function renderAll(seed){
  renderSetup();
  renderConclusion();
  renderKingsHand();
  render(seed);
  syncBoardPanelHeight();
}
document.querySelectorAll('.tier-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    setActiveTier(parseInt(btn.dataset.t));
    renderAll();
  });
});
setActiveTier(1);
document.getElementById('rollBtn').addEventListener('click', ()=>render());
document.getElementById('seedBtn').addEventListener('click', ()=>{
  const seed = shareSeed();
  navigator.clipboard?.writeText(seed).catch(()=>{});
  updateSeedInput();
  const btn = document.getElementById('seedBtn');
  const old = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(()=>btn.textContent=old, 900);
});
document.getElementById('loadSeedBtn').addEventListener('click', ()=>{
  const input = document.getElementById('seedInput');
  const parsed = parseSeedInput(input.value);
  if(!parsed.seed) return;
  setActiveTier(parsed.tier);
  renderAll(parsed.seed);
});
document.getElementById('seedInput').addEventListener('keydown', e=>{
  if(e.key === 'Enter') document.getElementById('loadSeedBtn').click();
});
window.addEventListener('resize', syncBoardPanelHeight);

renderLegend();
renderAll();
