// ============================================================
// BOAT RACE DASHBOARD
// BOAT RACE公式 × Cloudflare Worker 接続版
// ============================================================

const API_BASE =
  "https://boat-race-api.k09082207390.workers.dev/";

const venues = [
  ["桐生","5日目","10:47","night"],
  ["戸田","最終日","10:47",""],
  ["江戸川","初日","11:14",""],
  ["平和島","次開催","08/11",""],

  ["多摩川","2日目","11:33",""],
  ["浜名湖","次開催","08/11",""],
  ["蒲郡","次開催","08/10","night"],
  ["常滑","次開催","08/10",""],

  ["津","5日目","10:28",""],
  ["三国","最終日","08:32",""],
  ["びわこ","次開催","08/15",""],
  ["住之江","最終日","15:17","night"],

  ["尼崎","初日","10:33",""],
  ["鳴門","5日目","08:40",""],
  ["丸亀","3日目","15:25","night"],
  ["児島","2日目","10:46",""],

  ["宮島","次開催","08/14",""],
  ["徳山","4日目","10:38","g1"],
  ["下関","次開催","08/11","night"],
  ["若松","3日目","15:29","night"],

  ["芦屋","次開催","08/10",""],
  ["福岡","次開催","08/12",""],
  ["唐津","初日","08:48",""],
  ["大村","4日目","15:20","night"]
];

const PLACE_NUMBERS = {
  "桐生":1,
  "戸田":2,
  "江戸川":3,
  "平和島":4,
  "多摩川":5,
  "浜名湖":6,
  "蒲郡":7,
  "常滑":8,
  "津":9,
  "三国":10,
  "びわこ":11,
  "住之江":12,
  "尼崎":13,
  "鳴門":14,
  "丸亀":15,
  "児島":16,
  "宮島":17,
  "徳山":18,
  "下関":19,
  "若松":20,
  "芦屋":21,
  "福岡":22,
  "唐津":23,
  "大村":24
};

const venueGrid =
  document.getElementById("venueGrid");

const venueView =
  document.getElementById("venueView");

const raceView =
  document.getElementById("raceView");

const detailView =
  document.getElementById("detailView");

const raceGrid =
  document.getElementById("raceGrid");

let selectedVenue = "徳山";
let selectedRace = 10;

let samplePlayers = [];
let currentRaceData = null;


// ============================================================
// DATE
// ============================================================

function todayString() {
  const d = new Date();

  return (
    `${d.getFullYear()}/` +
    `${String(d.getMonth()+1).padStart(2,"0")}/` +
    `${String(d.getDate()).padStart(2,"0")}`
  );
}

function todayApiString() {
  const d = new Date();

  return (
    `${d.getFullYear()}` +
    `${String(d.getMonth()+1).padStart(2,"0")}` +
    `${String(d.getDate()).padStart(2,"0")}`
  );
}

document.getElementById("todayLabel").textContent =
  todayString();


// ============================================================
// VENUES
// ============================================================

function renderVenues() {

  venueGrid.innerHTML = "";

  venues.forEach(v => {

    const [name,day,time,type] = v;

    const b =
      document.createElement("button");

    b.className =
      "venue-card";

    b.innerHTML = `
      <span class="venue-name">${name}</span>

      <span class="venue-body">
        <strong>${day}</strong>
        <small>${time}</small>

        ${
          type
            ? `<span class="badge ${type}">
                 ${type === "night" ? "ナイター" : "G1"}
               </span>`
            : `<span class="badge">一般</span>`
        }
      </span>
    `;

    b.addEventListener(
      "click",
      () => openVenue(name,day)
    );

    venueGrid.appendChild(b);
  });
}


// ============================================================
// VENUE
// ============================================================

function openVenue(name,day) {

  selectedVenue = name;

  document.getElementById(
    "selectedVenueTitle"
  ).textContent = name;

  document.getElementById(
    "selectedVenueMeta"
  ).textContent =
    `${day}・レースを選択`;

  venueView.classList.add("hidden");
  detailView.classList.add("hidden");
  raceView.classList.remove("hidden");

  renderRaces();
}


// ============================================================
// RACES
// ============================================================

function renderRaces() {

  raceGrid.innerHTML = "";

  for (let i=1; i<=12; i++) {

    const b =
      document.createElement("button");

    b.className =
      "race-btn";

    b.textContent =
      `${i}R`;

    b.addEventListener(
      "click",
      () => openRace(i)
    );

    raceGrid.appendChild(b);
  }
}


// ============================================================
// OPEN RACE
// ============================================================

async function openRace(r) {

  selectedRace = r;

  raceView.classList.add("hidden");
  detailView.classList.remove("hidden");

  document.getElementById(
    "raceTitle"
  ).textContent =
    `${selectedVenue} ${r}R`;

  document.getElementById(
    "raceMeta"
  ).textContent =
    "実データを取得中...";

  document.getElementById(
    "fetchStatus"
  ).textContent =
    "BOAT RACE公式から取得中...";

  clearDetail();

  try {

    const placeNo =
      PLACE_NUMBERS[selectedVenue];

    if (!placeNo) {
      throw new Error(
        "場番号が見つかりません"
      );
    }

    const hiduke =
      todayApiString();

    const apiUrl =
      `${API_BASE}` +
      `?hiduke=${hiduke}` +
      `&place_no=${placeNo}` +
      `&race_no=${r}`;

    const res =
      await fetch(apiUrl);

    const data =
      await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(
        data.error ||
        `HTTP ${res.status}`
      );
    }

    currentRaceData = data;

    samplePlayers =
      data.players.map(p => ({

        lane:
          p.lane,

        name:
          p.name || "-",

        grade:
          p.class || "-",

        reg:
          String(
            p.number ?? "-"
          ),

        branch:
          p.branch || "-",

        hometown:
          p.hometown || "-",

        age:
          p.age ?? "-",

        weight:
          p.weight ?? "-",


        // 全国
        nat:
          val(p.national?.winRate),

        nat2:
          val(p.national?.secondRate),

        nat3:
          val(p.national?.thirdRate),


        // 当地
        local:
          val(p.local?.winRate),

        local2:
          val(p.local?.secondRate),

        local3:
          val(p.local?.thirdRate),


        // ST
        avgst:
          p.start?.average ?? "-",

        cst:
          p.start?.courseAverage ?? "-",

        season:
          p.start?.currentSeriesAverage ?? "-",

        est:
          "-",

        flying:
          Number(
            p.start?.flying || 0
          ),

        late:
          Number(
            p.start?.late || 0
          ),


        // モーター
        motor:
          String(
            p.motor?.number ?? "-"
          ),

        m2:
          val(
            p.motor?.secondRate
          ),

        m3:
          val(
            p.motor?.thirdRate
          ),


        // ボート
        boat:
          String(
            p.boat?.number ?? "-"
          ),

        b2:
          val(
            p.boat?.secondRate
          ),

        b3:
          val(
            p.boat?.thirdRate
          ),


        // 未取得
        pre:
          "-",

        pointRate:
          "-",

        r2:
          "-",

        r3:
          "-",

        tilt:
          "-"
      }));


    const race =
      data.race || {};

    document.getElementById(
      "raceTitle"
    ).textContent =
      `${race.place || selectedVenue} ` +
      `${race.raceNo || r}R`;

    document.getElementById(
      "raceMeta"
    ).textContent =
      "BOAT RACE公式 実データ";

    document.getElementById(
      "fetchStatus"
    ).textContent =
      `公式データ取得成功：${samplePlayers.length}艇`;

    updateConfidence();

    renderAll();

  } catch(error) {

    console.error(error);

    document.getElementById(
      "fetchStatus"
    ).textContent =
      `取得失敗：${error.message}`;

    document.getElementById(
      "raceMeta"
    ).textContent =
      "データ取得に失敗しました";

    document.getElementById(
      "playerCards"
    ).innerHTML = `
      <div class="panel">
        データ取得エラー<br>
        ${escapeHtml(error.message)}
      </div>
    `;

    document.getElementById(
      "aiText"
    ).value =
      `データ取得エラー\n${error.message}`;
  }
}


// ============================================================
// CLEAR
// ============================================================

function clearDetail() {

  document.getElementById(
    "playerCards"
  ).innerHTML = "";

  document.getElementById(
    "motorTable"
  ).innerHTML = "";

  document.getElementById(
    "startTable"
  ).innerHTML = "";

  document.getElementById(
    "liveTable"
  ).innerHTML = "";

  document.getElementById(
    "aiText"
  ).value = "";
}


// ============================================================
// PLAYER CARDS
// ============================================================

function renderPlayerCards() {

  const el =
    document.getElementById(
      "playerCards"
    );

  el.innerHTML = "";

  samplePlayers.forEach(p => {

    el.insertAdjacentHTML(
      "beforeend",
      `
      <article class="player-card">

        <div class="player-head">
          <span class="lane l${p.lane}">
            ${p.lane}
          </span>

          <span>${p.grade}</span>
        </div>

        <div class="player-body">

          <div class="player-name">
            ${p.name}
          </div>

          <div class="mini-grid">

            <div class="metric">
              登録
              <b>${p.reg}</b>
            </div>

            <div class="metric">
              支部
              <b>${p.branch}</b>
            </div>

            <div class="metric">
              全国
              <b>${p.nat}</b>
            </div>

            <div class="metric">
              当地
              <b>${p.local}</b>
            </div>

            <div class="metric">
              平均ST
              <b>${p.avgst}</b>
            </div>

            <div class="metric">
              F
              <b>
                ${p.flying > 0
                  ? `F${p.flying}`
                  : "F0"}
              </b>
            </div>

            <div class="metric">
              モーター
              <b>${p.motor}号</b>
            </div>

            <div class="metric">
              2連率
              <b>${pct(p.m2)}</b>
            </div>

          </div>

        </div>

      </article>
      `
    );
  });
}


// ============================================================
// MOTOR TAB
// ============================================================

function renderMotor() {

  const tbody =
    document.getElementById(
      "motorTable"
    );

  tbody.innerHTML = "";

  samplePlayers.forEach(p => {

    const mark =
      Number(p.m2) >= 50
        ? "🔥"
        : "";

    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>

        <td>
          <span class="lane l${p.lane}">
            ${p.lane}
          </span>
        </td>

        <td>
          ${p.motor}号
        </td>

        <td>
          ${pct(p.m2)}
        </td>

        <td>
          ${pct(p.m3)}
        </td>

        <td>
          ${p.boat}号
        </td>

        <td>
          ${pct(p.b2)}
        </td>

        <td>
          -
        </td>

        <td>
          ${mark}
        </td>

      </tr>
      `
    );
  });
}


// ============================================================
// ST TAB
// ============================================================

function renderStart() {

  const tbody =
    document.getElementById(
      "startTable"
    );

  tbody.innerHTML = "";

  samplePlayers.forEach(p => {

    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>

        <td>
          <span class="lane l${p.lane}">
            ${p.lane}
          </span>
        </td>

        <td>${p.avgst}</td>

        <td>
          ${
            p.cst !== "-"
              ? p.cst
              : "取得待ち"
          }
        </td>

        <td>
          ${
            p.season !== "-"
              ? p.season
              : "取得待ち"
          }
        </td>

        <td>
          取得待ち
        </td>

        <td>
          -
        </td>

        <td>
          ${
            p.flying > 0
              ? `F${p.flying}`
              : "F0"
          }
        </td>

        <td>
          ${stJudge(p)}
        </td>

      </tr>
      `
    );
  });
}


// ============================================================
// LIVE TAB
// ============================================================

function renderLive() {

  const tbody =
    document.getElementById(
      "liveTable"
    );

  tbody.innerHTML = "";

  samplePlayers.forEach(p => {

    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>
          <span class="lane l${p.lane}">
            ${p.lane}
          </span>
        </td>

        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>取得待ち</td>
      </tr>
      `
    );
  });
}


// ============================================================
// ST JUDGE
// ============================================================

function stJudge(p) {

  if (
    p.flying > 0
  ) {
    return "△ F持ち";
  }

  const st =
    Number(p.avgst);

  if (
    !Number.isNaN(st)
    && st <= 0.13
  ) {
    return "◎ ST速い";
  }

  if (
    !Number.isNaN(st)
    && st >= 0.19
  ) {
    return "△ ST遅め";
  }

  return "○";
}


// ============================================================
// CONFIDENCE
// ============================================================

function updateConfidence() {

  const score =
    document.querySelector(
      ".confidence-score"
    );

  const bar =
    document.querySelector(
      ".confidence-bar span"
    );

  if (score) {
    score.textContent =
      "—";
  }

  if (bar) {
    bar.style.width =
      "0%";
  }
}


// ============================================================
// AI COPY TEXT
// ============================================================

function buildAIText() {

  let t =
    `【${selectedVenue} ${selectedRace}R】\n`;

  t +=
    `BOAT RACE公式 実データ\n\n`;


  samplePlayers.forEach(p => {

    t +=
      `■${p.lane}号艇 ${p.name} ${p.grade}\n`;

    t +=
      `登録：${p.reg} / 支部：${p.branch} / 出身：${p.hometown}\n`;

    t +=
      `年齢：${p.age}歳 / 体重：${p.weight}kg\n`;

    t +=
      `全国勝率：${p.nat}` +
      ` / 2連率：${pct(p.nat2)}` +
      ` / 3連率：${pct(p.nat3)}\n`;

    t +=
      `当地勝率：${p.local}` +
      ` / 2連率：${pct(p.local2)}` +
      ` / 3連率：${pct(p.local3)}\n`;

    t +=
      `平均ST：${p.avgst}` +
      ` / F：${p.flying}` +
      ` / L：${p.late}\n`;

    t +=
      `モーター：${p.motor}号` +
      ` / 2連率：${pct(p.m2)}\n`;

    t +=
      `ボート：${p.boat}号` +
      ` / 2連率：${pct(p.b2)}\n`;

    t += "\n";
  });


  t +=
    "【未取得データ】\n" +
    "コース別ST / 今節ST / 今節得点率 / 前検タイム\n" +
    "展示ST / 展示タイム / 周回展示 / 直線 / 回り足\n" +
    "風向 / 風速 / 波高 / 気温 / 水温\n" +
    "モーター直近期間成績";


  return t;
}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {

  renderPlayerCards();
  renderMotor();
  renderStart();
  renderLive();

  document.getElementById(
    "aiText"
  ).value =
    buildAIText();
}


// ============================================================
// BACK
// ============================================================

document.getElementById(
  "backToVenues"
).addEventListener(
  "click",
  () => {

    raceView.classList.add(
      "hidden"
    );

    detailView.classList.add(
      "hidden"
    );

    venueView.classList.remove(
      "hidden"
    );
  }
);


document.getElementById(
  "backToRaces"
).addEventListener(
  "click",
  () => {

    detailView.classList.add(
      "hidden"
    );

    raceView.classList.remove(
      "hidden"
    );
  }
);


// ============================================================
// COPY
// ============================================================

document.getElementById(
  "copyBtn"
).addEventListener(
  "click",
  async () => {

    const text =
      document.getElementById(
        "aiText"
      ).value;

    try {

      await navigator.clipboard
        .writeText(text);

    } catch {

      const ta =
        document.getElementById(
          "aiText"
        );

      ta.select();

      document.execCommand(
        "copy"
      );
    }

    const toast =
      document.getElementById(
        "toast"
      );

    toast.classList.add(
      "show"
    );

    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      1400
    );
  }
);


// ============================================================
// TABS
// ============================================================

document.querySelectorAll(
  ".tab"
).forEach(btn => {

  btn.addEventListener(
    "click",
    () => {

      document.querySelectorAll(
        ".tab"
      ).forEach(
        x => x.classList.remove("active")
      );

      document.querySelectorAll(
        ".tab-panel"
      ).forEach(
        x => x.classList.remove("active")
      );

      btn.classList.add(
        "active"
      );

      document.getElementById(
        btn.dataset.tab
      ).classList.add(
        "active"
      );
    }
  );
});


// ============================================================
// UTIL
// ============================================================

function val(v) {

  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {
    return "-";
  }

  return v;
}


function pct(v) {

  if (
    v === null ||
    v === undefined ||
    v === "" ||
    v === "-"
  ) {
    return "-";
  }

  return `${v}%`;
}


function escapeHtml(str) {

  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


// ============================================================
// START
// ============================================================

renderVenues();
