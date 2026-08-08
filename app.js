const venues = [
  ["桐生","5日目","10:47","night"],["戸田","最終日","10:47",""],["江戸川","初日","11:14",""],["平和島","次開催","08/11",""],
  ["多摩川","2日目","11:33",""],["浜名湖","次開催","08/11",""],["蒲郡","次開催","08/10","night"],["常滑","次開催","08/10",""],
  ["津","5日目","10:28",""],["三国","最終日","08:32",""],["びわこ","次開催","08/15",""],["住之江","最終日","15:17","night"],
  ["尼崎","初日","10:33",""],["鳴門","5日目","08:40",""],["丸亀","3日目","15:25","night"],["児島","2日目","10:46",""],
  ["宮島","次開催","08/14",""],["徳山","4日目","10:38","g1"],["下関","次開催","08/11","night"],["若松","3日目","15:29","night"],
  ["芦屋","次開催","08/10",""],["福岡","次開催","08/12",""],["唐津","初日","08:48",""],["大村","4日目","15:20","night"]
];

const venueGrid = document.getElementById("venueGrid");
const venueView = document.getElementById("venueView");
const raceView = document.getElementById("raceView");
const detailView = document.getElementById("detailView");
const raceGrid = document.getElementById("raceGrid");

let selectedVenue = "徳山";
let selectedRace = 10;

const samplePlayers = [
  {lane:1,name:"山田 太郎",grade:"A1",reg:"4321",branch:"福岡",nat:"6.82",local:"7.14",avgst:".16",cst:".17",season:".18",est:".13",motor:"32",m2:"41.2",m3:"58.7",r2:"38.8",r3:"55.5",pre:"6.78",f:"0"},
  {lane:2,name:"大森 翼",grade:"A2",reg:"5247",branch:"兵庫",nat:"5.88",local:"5.61",avgst:".13",cst:".12",season:".11",est:".08",motor:"54",m2:"42.1",m3:"60.4",r2:"77.7",r3:"88.8",pre:"6.71",f:"0"},
  {lane:3,name:"佐藤 海斗",grade:"A1",reg:"4988",branch:"大阪",nat:"6.41",local:"6.02",avgst:".14",cst:".13",season:".15",est:".11",motor:"18",m2:"48.0",m3:"65.2",r2:"51.2",r3:"68.4",pre:"6.74",f:"0"},
  {lane:4,name:"中村 亮",grade:"B1",reg:"5110",branch:"山口",nat:"4.92",local:"5.20",avgst:".18",cst:".17",season:".20",est:".21",motor:"11",m2:"33.7",m3:"48.1",r2:"29.4",r3:"41.2",pre:"6.82",f:"1"},
  {lane:5,name:"田中 悠",grade:"A2",reg:"4870",branch:"東京",nat:"5.77",local:"5.48",avgst:".12",cst:".11",season:".10",est:".05",motor:"67",m2:"45.8",m3:"62.0",r2:"58.3",r3:"75.0",pre:"6.73",f:"0"},
  {lane:6,name:"木村 蓮",grade:"B1",reg:"5301",branch:"香川",nat:"4.66",local:"4.91",avgst:".15",cst:".14",season:".13",est:".09",motor:"23",m2:"36.9",m3:"50.0",r2:"44.4",r3:"61.1",pre:"6.76",f:"0"}
];

function todayString(){
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}
document.getElementById("todayLabel").textContent = todayString();

function renderVenues(){
  venueGrid.innerHTML = "";
  venues.forEach(v=>{
    const [name,day,time,type] = v;
    const btn = document.createElement("button");
    btn.className = "venue-card";
    btn.innerHTML = `
      <span class="venue-name">${name}</span>
      <span class="venue-body">
        <strong>${day}</strong>
        <small>${time}</small>
        ${type ? `<span class="badge ${type}">${type==="night"?"ナイター":"G1"}</span>` : `<span class="badge">一般</span>`}
      </span>`;
    btn.addEventListener("click",()=>openVenue(name,day));
    venueGrid.appendChild(btn);
  });
}

function openVenue(name, day){
  selectedVenue = name;
  document.getElementById("selectedVenueTitle").textContent = name;
  document.getElementById("selectedVenueMeta").textContent = `${day}・レースを選択`;
  venueView.classList.add("hidden");
  detailView.classList.add("hidden");
  raceView.classList.remove("hidden");
  renderRaces();
}

function renderRaces(){
  raceGrid.innerHTML = "";
  for(let i=1;i<=12;i++){
    const b=document.createElement("button");
    b.className="race-btn";
    b.textContent=`${i}R`;
    b.addEventListener("click",()=>openRace(i));
    raceGrid.appendChild(b);
  }
}

function openRace(r){
  selectedRace = r;
  raceView.classList.add("hidden");
  detailView.classList.remove("hidden");
  document.getElementById("raceTitle").textContent = `${selectedVenue} ${r}R`;
  document.getElementById("raceMeta").textContent = `締切 ${sampleDeadline(r)} ・ デモデータ`;
  renderAll();
}

function sampleDeadline(r){
  const base=10*60+35;
  const mins=base+(r-1)*27;
  return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`;
}

function renderPlayerCards(){
  const el=document.getElementById("playerCards");
  el.innerHTML="";
  samplePlayers.forEach(p=>{
    const hot = Number(p.r2)>=60 ? "hot" : "";
    el.insertAdjacentHTML("beforeend",`
      <article class="player-card">
        <div class="player-head">
          <span class="lane l${p.lane}">${p.lane}</span>
          <span>${p.grade}</span>
        </div>
        <div class="player-body">
          <div class="player-name">${p.name}</div>
          <div class="mini-grid">
            <div class="metric">登録<b>${p.reg}</b></div>
            <div class="metric">支部<b>${p.branch}</b></div>
            <div class="metric">全国<b>${p.nat}</b></div>
            <div class="metric">当地<b>${p.local}</b></div>
            <div class="metric">平均ST<b>${p.avgst}</b></div>
            <div class="metric">展示ST<b>${p.est}</b></div>
            <div class="metric">モーター<b>${p.motor}号</b></div>
            <div class="metric">直近2連<b class="${hot}">${p.r2}%</b></div>
          </div>
        </div>
      </article>`);
  });
}

function renderMotor(){
  const tbody=document.getElementById("motorTable");
  tbody.innerHTML="";
  samplePlayers.forEach(p=>{
    let label="○";
    let cls="";
    if(Number(p.r2)>=60){label="🔥 強";cls="rank-good";}
    else if(Number(p.r2)<30){label="△";cls="rank-warn";}
    tbody.insertAdjacentHTML("beforeend",`
      <tr>
        <td><span class="lane l${p.lane}">${p.lane}</span></td>
        <td>${p.motor}号</td>
        <td>${p.m2}%</td>
        <td>${p.m3}%</td>
        <td class="${Number(p.r2)>=60?"hot":""}">${p.r2}%</td>
        <td>${p.r3}%</td>
        <td>${p.pre}</td>
        <td class="${cls}">${label}</td>
      </tr>`);
  });
}

function renderStart(){
  const tbody=document.getElementById("startTable");
  tbody.innerHTML="";
  samplePlayers.forEach((p,i)=>{
    const num = Number(p.est);
    let judge="○";
    if(num<=0.08) judge="◎ 踏める";
    if(num>=0.20) judge="× 凹み注意";
    tbody.insertAdjacentHTML("beforeend",`
      <tr>
        <td><span class="lane l${p.lane}">${p.lane}</span></td>
        <td>${p.avgst}</td>
        <td>${p.cst}</td>
        <td>${p.season}</td>
        <td>${p.est}</td>
        <td>${i+1}</td>
        <td>${p.f==="1"?"F1":"F0"}</td>
        <td>${judge}</td>
      </tr>`);
  });
}

function renderLive(){
  const tbody=document.getElementById("liveTable");
  tbody.innerHTML="";
  samplePlayers.forEach((p,i)=>{
    tbody.insertAdjacentHTML("beforeend",`
      <tr>
        <td><span class="lane l${p.lane}">${p.lane}</span></td>
        <td>${p.est}</td>
        <td>${(6.70+i*0.03).toFixed(2)}</td>
        <td>${(37.10+i*0.05).toFixed(2)}</td>
        <td>${(5.80+i*0.02).toFixed(2)}</td>
        <td>${(7.20-i*0.01).toFixed(2)}</td>
        <td>${i===2?"+0.5":"0"}</td>
        <td>${i===3?"キャリアボデー":"なし"}</td>
      </tr>`);
  });
}

function buildAIText(){
  let t=`【${selectedVenue} ${selectedRace}R】\n締切 ${sampleDeadline(selectedRace)}\n\n`;
  samplePlayers.forEach(p=>{
    t+=`■${p.lane}号艇 ${p.name} ${p.grade}\n`;
    t+=`登録番号：${p.reg} / 支部：${p.branch}\n`;
    t+=`全国勝率：${p.nat} / 当地勝率：${p.local}\n`;
    t+=`平均ST：${p.avgst} / コース別ST：${p.cst} / 今節ST：${p.season} / 展示ST：${p.est}\n`;
    t+=`モーター：${p.motor}号機\n`;
    t+=`通算2連率：${p.m2}% / 通算3連率：${p.m3}%\n`;
    t+=`直近1か月2連率：${p.r2}% / 直近1か月3連率：${p.r3}%\n`;
    t+=`前検タイム：${p.pre} / F：${p.f}\n\n`;
  });
  t+=`【直前】\n風向：向かい風\n風速：4m\n波高：4cm\n気温：31℃\n水温：28℃\n\n`;
  t+=`※現在は画面確認用のデモデータです。次段階でボート日和実データ取得に接続します。`;
  return t;
}

function renderAll(){
  renderPlayerCards();
  renderMotor();
  renderStart();
  renderLive();
  document.getElementById("aiText").value=buildAIText();
}

document.getElementById("backToVenues").addEventListener("click",()=>{
  raceView.classList.add("hidden");
  venueView.classList.remove("hidden");
});
document.getElementById("backToRaces").addEventListener("click",()=>{
  detailView.classList.add("hidden");
  raceView.classList.remove("hidden");
});

document.getElementById("copyBtn").addEventListener("click",async()=>{
  const text=document.getElementById("aiText").value;
  try{
    await navigator.clipboard.writeText(text);
  }catch(e){
    const ta=document.getElementById("aiText");
    ta.select();
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
  }
  const toast=document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1400);
});

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

renderVenues();
