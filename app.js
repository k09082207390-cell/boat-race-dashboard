// ============================================================
// BOAT RACE DASHBOARD FRONTEND
// GitHub Pages → Cloudflare Worker /api
// ============================================================

const API_BASE = "https://boat-race-api.k09082207390.workers.dev/api";

const PLACE_NAMES = {
  1:"桐生",2:"戸田",3:"江戸川",4:"平和島",5:"多摩川",6:"浜名湖",
  7:"蒲郡",8:"常滑",9:"津",10:"三国",11:"びわこ",12:"住之江",
  13:"尼崎",14:"鳴門",15:"丸亀",16:"児島",17:"宮島",18:"徳山",
  19:"下関",20:"若松",21:"芦屋",22:"福岡",23:"唐津",24:"大村"
};

const NIGHT_PLACES = new Set([1,7,12,15,19,20,24]);

// 現在は「全24場」から選択。
// 将来Workerに開催一覧APIを足したら開催中だけへ自動切替できる。
const venues = Object.entries(PLACE_NAMES).map(([placeNo,name]) => ({
  placeNo:Number(placeNo),
  name,
  type:NIGHT_PLACES.has(Number(placeNo)) ? "night" : ""
}));

let currentData = null;
let selectedPlaceNo = 18;
let selectedRaceNo = 10;
let allOpen = false;

const venueView = document.getElementById("venueView");
const detailView = document.getElementById("detailView");

init();

function init(){
  setDates();
  renderVenues();
  bindStaticEvents();
  openFromQuery();
}

function japanDate(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat("ja-JP",{
    timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(now);
  const get = type => parts.find(p=>p.type===type)?.value || "";
  return {y:get("year"),m:get("month"),d:get("day")};
}

function todayApiString(){
  const d=japanDate();
  return `${d.y}${d.m}${d.d}`;
}

function todayDisplay(){
  const d=japanDate();
  return `${d.y}/${d.m}/${d.d}`;
}

function setDates(){
  document.getElementById("todayLabel").textContent=todayDisplay();
  document.getElementById("homeDateLabel").textContent=todayDisplay();
}

function renderVenues(){
  const grid=document.getElementById("venueGrid");
  grid.innerHTML="";
  venues.forEach(meeting=>{
    const races = Array.from({length:12},(_,i)=>i+1).map(r=>`
      <button class="meeting-race-btn" type="button"
        data-place-no="${meeting.placeNo}" data-race="${r}">
        <strong>${r}R</strong><span>表示</span>
      </button>`).join("");

    grid.insertAdjacentHTML("beforeend",`
      <article class="meeting-card">
        <div class="meeting-head">
          <div>
            <div class="meeting-place">${escapeHtml(meeting.name)}</div>
            <div class="meeting-sub">${meeting.placeNo}場・レースを選択</div>
          </div>
          <div class="meeting-badges">
            ${meeting.type==="night"?'<span class="meeting-badge night">ナイター</span>':""}
          </div>
        </div>
        <div class="meeting-races">${races}</div>
      </article>
    `);
  });

  document.querySelectorAll(".meeting-race-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      openRace(Number(btn.dataset.placeNo),Number(btn.dataset.race));
    });
  });
}

function bindStaticEvents(){
  document.getElementById("backToVenues").addEventListener("click",()=>{
    detailView.classList.add("hidden");
    venueView.classList.remove("hidden");
    history.pushState(null,"",location.pathname);
  });

  document.getElementById("copyBtn").addEventListener("click",copyAiText);

  document.getElementById("toggleAllBtn").addEventListener("click",()=>{
    allOpen=!allOpen;
    document.querySelectorAll(".player-detail").forEach(d=>d.open=allOpen);
    document.getElementById("toggleAllBtn").textContent=allOpen?"すべて閉じる":"すべて開く";
  });

  window.addEventListener("popstate",openFromQuery);
}

function openFromQuery(){
  const q=new URLSearchParams(location.search);
  const placeNo=Number(q.get("place_no"));
  const raceNo=Number(q.get("race_no"));
  if(placeNo>=1&&placeNo<=24&&raceNo>=1&&raceNo<=12){
    openRace(placeNo,raceNo,false);
  }
}

async function openRace(placeNo,raceNo,push=true){
  selectedPlaceNo=placeNo;
  selectedRaceNo=raceNo;
  venueView.classList.add("hidden");
  detailView.classList.remove("hidden");

  const place=PLACE_NAMES[placeNo]||`${placeNo}場`;
  setText("raceTitle",`${place} ${raceNo}R`);
  setText("raceMeta","BOAT RACE公式・実データ");
  setText("fetchStatus","データ取得中...");
  clearRace();

  if(push){
    const u=new URL(location.href);
    u.searchParams.set("place_no",placeNo);
    u.searchParams.set("race_no",raceNo);
    history.pushState(null,"",u);
  }

  try{
    const url=`${API_BASE}?hiduke=${todayApiString()}&place_no=${placeNo}&race_no=${raceNo}`;
    const response=await fetch(url,{cache:"no-store"});
    const data=await response.json();
    if(!response.ok||!data.ok) throw new Error(data.error||`HTTP ${response.status}`);

    currentData=data;
    const players=Array.isArray(data.players)?data.players:[];

    setText("raceTitle",`${data.race?.place||place} ${data.race?.raceNo||raceNo}R`);
    const beforeText=data.before?.available?"・直前情報あり":"・直前情報未公開";
    const cacheState=response.headers.get("x-boat-cache");
    setText("fetchStatus",`取得成功：${players.length}艇${beforeText}${cacheState?`・Cache ${cacheState}`:""}`);

    renderQuick(players);
    renderCompare(players);
    renderPlayers(players);
    renderWeather(data.race?.weather||{});
    renderSources(data);
    renderAi(data);
  }catch(error){
    console.error(error);
    setText("fetchStatus",`取得失敗：${error.message}`);
    document.getElementById("compareTableWrap").innerHTML=`<div class="loading">${escapeHtml(error.message)}</div>`;
  }
}

function clearRace(){
  currentData=null;
  setText("inMark","―");setText("inText","取得待ち");
  setText("wallMark","―");setText("wallText","取得待ち");
  setText("attackMark","―");setText("attackText","取得待ち");
  document.getElementById("compareTableWrap").innerHTML='<div class="loading">読み込み中...</div>';
  document.getElementById("playerDetails").innerHTML="";
  document.getElementById("weatherGrid").innerHTML="";
  document.getElementById("sourceGrid").innerHTML="";
  document.getElementById("aiText").value="";
}

function renderQuick(players){
  const p1=players.find(p=>Number(p.lane)===1);
  const p2=players.find(p=>Number(p.lane)===2);
  const escape=num(p1?.courseStats?.escapeRate);
  const allow=num(p2?.courseStats?.allowEscapeRate);

  setText("inMark",rating(escape));
  setText("inText",p1?`${p1.name} 逃げ率 ${pct(p1.courseStats?.escapeRate)}`:"データなし");
  setText("wallMark",rating(allow));
  setText("wallText",p2?`${p2.name} 逃がし率 ${pct(p2.courseStats?.allowEscapeRate)}`:"データなし");

  const attackers=players.filter(p=>Number(p.lane)>=3).map(p=>{
    const c=p.courseStats||{};
    const attack=Math.max(num(c.firstRate)||0,(num(c.winningMethod?.makuriRate)||0)+(num(c.winningMethod?.makuriSashiRate)||0));
    return {p,attack};
  }).sort((a,b)=>b.attack-a.attack);

  const top=attackers[0];
  setText("attackMark",top?`${top.p.lane}号艇`:"―");
  setText("attackText",top?`${top.p.name} / 1着 ${pct(top.p.courseStats?.firstRate)} / まくり ${pct(top.p.courseStats?.winningMethod?.makuriRate)}`:"データなし");
}

function renderCompare(players){
  const rows=[
    ["級別",p=>val(p.class)],
    ["全国勝率",p=>val(p.national?.winRate)],
    ["当地勝率",p=>val(p.local?.winRate)],
    ["今節得点率",p=>val(p.series?.pointRate)],
    ["今節平均ST",p=>st(p.series?.averageST),"st-series"],
    ["コース1着率",p=>`${pct(p.courseStats?.firstRate)} (${val(p.courseStats?.entryCount)}走)`,"high-course"],
    ["逃げ / 逃がし",p=>Number(p.lane)===1?`逃 ${pct(p.courseStats?.escapeRate)}`:`逃が ${pct(p.courseStats?.allowEscapeRate)}`,"escape"],
    ["コース平均ST",p=>st(p.courseStats?.averageST),"st-course"],
    ["差し率",p=>pct(p.courseStats?.winningMethod?.sashiRate)],
    ["まくり率",p=>pct(p.courseStats?.winningMethod?.makuriRate)],
    ["まくり差し率",p=>pct(p.courseStats?.winningMethod?.makuriSashiRate)],
    ["モーター2連率",p=>pct(p.motor?.secondRate),"motor"],
    ["直近1か月2連",p=>pct(p.motor?.recent1Month?.secondRate),"recent2"],
    ["機力トレンド",p=>trendText(p),"trend"]
  ];

  let html='<table><thead><tr><th>比較項目</th>';
  players.forEach(p=>{
    html+=`<th><div class="compare-name">${escapeHtml(p.lane)} ${escapeHtml(p.name)}</div><div class="compare-reg">${escapeHtml(p.number)}</div></th>`;
  });
  html+='</tr></thead><tbody>';

  rows.forEach(([label,fn,type])=>{
    html+=`<tr><td>${escapeHtml(label)}</td>`;
    players.forEach(p=>{
      html+=`<td class="${compareClass(p,type)}">${escapeHtml(fn(p))}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody></table>';
  document.getElementById("compareTableWrap").innerHTML=html;
}

function compareClass(p,type){
  if(type==="st-series") return stClass(p.series?.averageST);
  if(type==="st-course") return stClass(p.courseStats?.averageST);
  if(type==="high-course") return highClass(p.courseStats?.firstRate);
  if(type==="motor") return highClass(p.motor?.secondRate);
  if(type==="recent2") return highClass(p.motor?.recent1Month?.secondRate);
  if(type==="escape"){
    const n=Number(p.lane)===1?num(p.courseStats?.escapeRate):num(p.courseStats?.allowEscapeRate);
    if(n===null)return "";
    if(n>=65)return "good";
    if(n<40)return "bad";
    return "warn";
  }
  if(type==="trend"){
    const d=motorTrend(p);
    if(d===null)return "";
    if(d>=8)return "good";
    if(d<=-8)return "bad";
  }
  return "";
}

function renderPlayers(players){
  const wrap=document.getElementById("playerDetails");
  wrap.innerHTML=players.map(p=>{
    const c=p.courseStats||{};
    const recent=p.motor?.recent1Month||{};
    const races=Array.isArray(p.series?.races)?p.series.races:[];
    const raceLines=races.map(r=>`${r.day}日 ${r.raceNo}R ${r.course}C ST${r.st} ${resultText(r.result)}`).join("<br>");
    const isOne=Number(p.lane)===1;

    return `
      <details class="player-detail">
        <summary>
          <span class="lane-circle" style="${laneStyle(Number(p.lane))}">${p.lane}</span>
          <span>
            <span class="player-summary-name">${escapeHtml(p.class||"")} ${escapeHtml(p.name)}</span>
            <span class="player-summary-sub">登録 ${escapeHtml(p.number)} / ${escapeHtml(p.branch||"")}</span>
          </span>
        </summary>
        <div class="detail-body">
          <div class="metrics">
            ${metric("全国",val(p.national?.winRate))}
            ${metric("当地",val(p.local?.winRate))}
            ${metric("平均ST",val(p.start?.average))}
            ${metric("今節ST",val(p.series?.averageST))}
            ${metric("F/L",`F${val(p.start?.flying)}/L${val(p.start?.late)}`)}
            ${metric("ST評価",stEval(p))}
            ${metric("モーター",`${val(p.motor?.number)}号`)}
            ${metric("通算2連",pct(p.motor?.secondRate))}
            ${metric("直近1か月2連",pct(recent.secondRate))}
            ${metric("機力トレンド",trendText(p))}
            ${metric("コース1着",`${pct(c.firstRate)} / ${val(c.entryCount)}走`)}
            ${metric(isOne?"逃げ率":"逃がし率",isOne?pct(c.escapeRate):pct(c.allowEscapeRate))}
            ${metric("差し率",pct(c.winningMethod?.sashiRate))}
            ${metric("まくり率",pct(c.winningMethod?.makuriRate))}
            ${metric("得点率",val(p.series?.pointRate))}
            ${metric("順位",`${val(p.series?.pointRank)}位`)}
          </div>
          <div class="series"><b>今節成績</b><br>${raceLines||"―"}</div>
          <div class="comment"><b>選手コメント</b><br>${escapeHtml(p.comment?.text||"コメントなし")}</div>
        </div>
      </details>
    `;
  }).join("");
}

function renderWeather(w){
  document.getElementById("weatherGrid").innerHTML=[
    ["風向",val(w.windDirection)],["風速",unit(w.windSpeed,"m")],
    ["波高",unit(w.wave,"cm")],["気温",unit(w.airTemperature,"℃")],
    ["水温",unit(w.waterTemperature,"℃")]
  ].map(([k,v])=>`<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`).join("");
}

function renderSources(data){
  document.getElementById("sourceGrid").innerHTML=[
    ["BOAT RACE公式",data.meta?.raceSourceStatus===200?"OK":"確認"],
    ["選手コメント",`${val(data.comments?.count)}艇`],
    ["直近モーター",`${val(data.recentMotors?.count)}艇`],
    ["コース別",`${val(data.courseStats?.count)}艇`]
  ].map(([k,v])=>`<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`).join("");
}

function renderAi(data){
  const ps=data.players||[];
  const lines=[`${data.race?.place||""} ${data.race?.raceNo||""}R`];
  ps.forEach(p=>{
    const c=p.courseStats||{};
    lines.push([
      `${p.lane} ${p.name}`,
      `級 ${p.class||""}`,
      `全国 ${val(p.national?.winRate)}`,
      `今節ST ${val(p.series?.averageST)}`,
      `得点率 ${val(p.series?.pointRate)}`,
      `コース1着 ${pct(c.firstRate)}(${val(c.entryCount)}走)`,
      Number(p.lane)===1?`逃げ ${pct(c.escapeRate)}`:`逃がし ${pct(c.allowEscapeRate)}`,
      `差し ${pct(c.winningMethod?.sashiRate)}`,
      `まくり ${pct(c.winningMethod?.makuriRate)}`,
      `M2連 ${pct(p.motor?.secondRate)}`,
      `直近M2連 ${pct(p.motor?.recent1Month?.secondRate)}`,
      `トレンド ${trendText(p)}`,
      `コメント ${p.comment?.text||""}`
    ].join(" / "));
  });
  document.getElementById("aiText").value=lines.join("\n");
}

async function copyAiText(){
  const text=document.getElementById("aiText").value;
  if(!text)return;
  try{
    await navigator.clipboard.writeText(text);
    setText("copyState","コピーしました");
    showToast();
  }catch(e){
    setText("copyState","コピー失敗");
  }
}

function showToast(){
  const t=document.getElementById("toast");
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1300);
}

function motorTrend(p){
  const all=num(p.motor?.secondRate);
  const recent=num(p.motor?.recent1Month?.secondRate);
  if(all===null||recent===null)return null;
  return Number((recent-all).toFixed(1));
}
function trendText(p){
  const d=motorTrend(p);
  if(d===null)return "―";
  if(d>0)return `↑ +${d}pt`;
  if(d<0)return `↓ ${d}pt`;
  return "→ 0pt";
}
function rating(n){
  if(n===null)return "―";
  if(n>=65)return "◎";
  if(n>=50)return "○";
  if(n>=40)return "△";
  return "×";
}
function stEval(p){
  if(num(p.start?.flying)>0)return "△ F持ち";
  const a=num(p.series?.averageST);
  if(a!==null&&a<=.11)return "🔥 踏めてる";
  if(a!==null&&a<=.14)return "◎ 今節良";
  if(a!==null&&a>=.18)return "△ 遅め";
  return "○";
}
function stClass(x){
  const n=num(x); if(n===null)return "";
  if(n<=.12)return "good"; if(n>=.18)return "warn"; return "";
}
function highClass(x){
  const n=num(x); if(n===null)return "";
  if(n>=50)return "good"; if(n<=20)return "bad"; return "";
}
function metric(k,v){return `<div class="metric"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`}
function laneStyle(lane){
  return ({
    1:"background:#fff;color:#111",
    2:"background:#222;color:#fff",
    3:"background:#d64545;color:#fff",
    4:"background:#3f6fc4;color:#fff",
    5:"background:#e6c33c;color:#111",
    6:"background:#3f9b64;color:#fff"
  })[lane]||"";
}
function resultText(r){
  if(typeof r==="number"||/^\d+$/.test(String(r)))return `${r}着`;
  return String(r??"―");
}
function num(x){
  if(x===null||x===undefined||x==="")return null;
  const n=Number(x); return Number.isFinite(n)?n:null;
}
function val(x){return x===null||x===undefined||x===""?"―":String(x)}
function pct(x){return x===null||x===undefined||x===""?"―":`${x}%`}
function unit(x,u){return x===null||x===undefined||x===""?"―":`${x}${u}`}
function st(x){
  const n=num(x); if(n===null)return val(x);
  return n.toFixed(3).replace(/^0/,"");
}
function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[m]);
}
