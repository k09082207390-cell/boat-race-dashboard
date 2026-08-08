// ============================================================
// BOAT RACE DASHBOARD
// BOAT RACE公式 × Cloudflare Worker
// 統合表示版
// ============================================================

const API_BASE =
  "https://boat-race-api.k09082207390.workers.dev/";


// ============================================================
// 24場
// ============================================================

const venues = [
  ["桐生", "night"],
  ["戸田", ""],
  ["江戸川", ""],
  ["平和島", ""],

  ["多摩川", ""],
  ["浜名湖", ""],
  ["蒲郡", "night"],
  ["常滑", ""],

  ["津", ""],
  ["三国", ""],
  ["びわこ", ""],
  ["住之江", "night"],

  ["尼崎", ""],
  ["鳴門", ""],
  ["丸亀", "night"],
  ["児島", ""],

  ["宮島", ""],
  ["徳山", "g1"],
  ["下関", "night"],
  ["若松", "night"],

  ["芦屋", ""],
  ["福岡", ""],
  ["唐津", ""],
  ["大村", "night"]
];


const PLACE_NUMBERS = {
  "桐生": 1,
  "戸田": 2,
  "江戸川": 3,
  "平和島": 4,

  "多摩川": 5,
  "浜名湖": 6,
  "蒲郡": 7,
  "常滑": 8,

  "津": 9,
  "三国": 10,
  "びわこ": 11,
  "住之江": 12,

  "尼崎": 13,
  "鳴門": 14,
  "丸亀": 15,
  "児島": 16,

  "宮島": 17,
  "徳山": 18,
  "下関": 19,
  "若松": 20,

  "芦屋": 21,
  "福岡": 22,
  "唐津": 23,
  "大村": 24
};


// ============================================================
// DOM
// ============================================================

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


// ============================================================
// STATE
// ============================================================

let selectedVenue =
  "徳山";

let selectedRace =
  1;

let currentRaceData =
  null;

let samplePlayers =
  [];


// ============================================================
// DATE
// ============================================================

function todayString() {

  const d =
    new Date();

  return (
    `${d.getFullYear()}/` +
    `${String(d.getMonth() + 1).padStart(2, "0")}/` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}


function todayApiString() {

  const d =
    new Date();

  return (
    `${d.getFullYear()}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}


const todayLabel =
  document.getElementById("todayLabel");

if (todayLabel) {
  todayLabel.textContent =
    todayString();
}


// ============================================================
// VENUES
// ============================================================

function renderVenues() {

  if (!venueGrid) {
    return;
  }

  venueGrid.innerHTML =
    "";

  venues.forEach(v => {

    const [
      name,
      type
    ] = v;

    const btn =
      document.createElement(
        "button"
      );

    btn.className =
      "venue-card";

    btn.innerHTML = `
      <span class="venue-name">
        ${name}
      </span>

      <span class="venue-body">

        <strong>
          レース選択
        </strong>

        ${
          type
            ? `
              <span class="badge ${type}">
                ${
                  type === "night"
                    ? "ナイター"
                    : "G1"
                }
              </span>
            `
            : `
              <span class="badge">
                一般
              </span>
            `
        }

      </span>
    `;

    btn.addEventListener(
      "click",
      () => openVenue(name)
    );

    venueGrid.appendChild(
      btn
    );
  });
}


// ============================================================
// VENUE
// ============================================================

function openVenue(
  name
) {

  selectedVenue =
    name;

  const title =
    document.getElementById(
      "selectedVenueTitle"
    );

  const meta =
    document.getElementById(
      "selectedVenueMeta"
    );


  if (title) {
    title.textContent =
      name;
  }


  if (meta) {
    meta.textContent =
      "レースを選択";
  }


  venueView?.classList.add(
    "hidden"
  );

  detailView?.classList.add(
    "hidden"
  );

  raceView?.classList.remove(
    "hidden"
  );


  renderRaces();
}


// ============================================================
// RACES
// ============================================================

function renderRaces() {

  if (!raceGrid) {
    return;
  }


  raceGrid.innerHTML =
    "";


  for (
    let i = 1;
    i <= 12;
    i++
  ) {

    const btn =
      document.createElement(
        "button"
      );

    btn.className =
      "race-btn";

    btn.textContent =
      `${i}R`;

    btn.addEventListener(
      "click",
      () =>
        openRace(i)
    );

    raceGrid.appendChild(
      btn
    );
  }
}


// ============================================================
// OPEN RACE
// ============================================================

async function openRace(
  raceNo
) {

  selectedRace =
    raceNo;


  raceView?.classList.add(
    "hidden"
  );

  detailView?.classList.remove(
    "hidden"
  );


  setText(
    "raceTitle",
    `${selectedVenue} ${raceNo}R`
  );


  setText(
    "raceMeta",
    "実データを取得中..."
  );


  setText(
    "fetchStatus",
    "BOAT RACE公式から取得中..."
  );


  clearDetail();


  try {

    const placeNo =
      PLACE_NUMBERS[
        selectedVenue
      ];


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
      `&race_no=${raceNo}`;


    const response =
      await fetch(
        apiUrl,
        {
          cache:
            "no-store"
        }
      );


    let data;


    try {

      data =
        await response.json();

    } catch {

      throw new Error(
        "APIレスポンスをJSONとして読み込めませんでした"
      );
    }


    if (
      !response.ok
      ||
      !data.ok
    ) {

      throw new Error(
        data.error
        ||
        `HTTP ${response.status}`
      );
    }


    currentRaceData =
      data;


    samplePlayers =
      data.players.map(
        p =>
          normalizePlayer(p)
      );


    const race =
      data.race
      || {};


    setText(
      "raceTitle",
      `${
        race.place
        || selectedVenue
      } ${
        race.raceNo
        || raceNo
      }R`
    );


    setText(
      "raceMeta",
      `${
        data.source
        || "BOAT RACE公式"
      }・実データ`
    );


    const beforeText =
      data.before?.available
        ? "・直前情報あり"
        : "・直前情報は未公開";


    setText(
      "fetchStatus",
      `取得成功：${samplePlayers.length}艇${beforeText}`
    );


    renderWeather();

    renderAll();


  } catch (
    error
  ) {

    console.error(
      error
    );


    setText(
      "fetchStatus",
      `取得失敗：${error.message}`
    );


    setText(
      "raceMeta",
      "データ取得に失敗しました"
    );


    const cards =
      document.getElementById(
        "playerCards"
      );


    if (cards) {

      cards.innerHTML = `
        <div class="panel">
          データ取得エラー
          <br>
          ${escapeHtml(
            error.message
          )}
        </div>
      `;
    }


    const ai =
      document.getElementById(
        "aiText"
      );


    if (ai) {

      ai.value =
        `データ取得エラー\n${error.message}`;
    }
  }
}


// ============================================================
// NORMALIZE PLAYER
// ============================================================

function normalizePlayer(
  p
) {

  return {

    lane:
      p.lane,

    number:
      p.number,

    name:
      p.name
      || "-",

    grade:
      p.class
      || "-",

    branch:
      p.branch
      || "-",

    hometown:
      p.hometown
      || "-",

    age:
      value(
        p.age
      ),

    weight:
      value(
        p.weight
      ),


    // --------------------------------
    // ST
    // --------------------------------

    avgST:
      p.start?.average
      ?? "-",

    flying:
      Number(
        p.start?.flying
        || 0
      ),

    late:
      Number(
        p.start?.late
        || 0
      ),

    seriesST:
      p.start?.currentSeriesAverage
      ??
      p.series?.averageST
      ??
      "-",


    // --------------------------------
    // 全国
    // --------------------------------

    nationalWin:
      value(
        p.national?.winRate
      ),

    national2:
      value(
        p.national?.secondRate
      ),

    national3:
      value(
        p.national?.thirdRate
      ),


    // --------------------------------
    // 当地
    // --------------------------------

    localWin:
      value(
        p.local?.winRate
      ),

    local2:
      value(
        p.local?.secondRate
      ),

    local3:
      value(
        p.local?.thirdRate
      ),


    // --------------------------------
    // モーター
    // --------------------------------

    motor:
      value(
        p.motor?.number
      ),

    motor2:
      value(
        p.motor?.secondRate
      ),

    motor3:
      value(
        p.motor?.thirdRate
      ),


    // --------------------------------
    // ボート
    // --------------------------------

    boat:
      value(
        p.boat?.number
      ),

    boat2:
      value(
        p.boat?.secondRate
      ),

    boat3:
      value(
        p.boat?.thirdRate
      ),


    // --------------------------------
    // 今節
    // --------------------------------

    pointRate:
      value(
        p.series?.pointRate
      ),

    pointRank:
      value(
        p.series?.pointRank
      ),

    raceCount:
      value(
        p.series?.raceCount
      ),

    seriesRaces:
      Array.isArray(
        p.series?.races
      )
        ? p.series.races
        : [],


    // --------------------------------
    // 直前
    // --------------------------------

    beforeAvailable:
      Boolean(
        p.before?.available
      ),

    exhibitionTime:
      value(
        p.before?.exhibitionTime
      ),

    tilt:
      value(
        p.before?.tilt
      ),

    startCourse:
      value(
        p.before?.startCourse
      ),

    startST:
      p.before?.startST
      ?? "-",

    startOrder:
      value(
        p.before?.startOrder
      )
  };
}


// ============================================================
// CLEAR
// ============================================================

function clearDetail() {

  [
    "playerCards",
    "motorTable",
    "startTable",
    "liveTable"
  ]
    .forEach(
      id => {

        const el =
          document.getElementById(
            id
          );

        if (el) {
          el.innerHTML = "";
        }
      }
    );


  const ai =
    document.getElementById(
      "aiText"
    );


  if (ai) {
    ai.value = "";
  }
}


// ============================================================
// PLAYER CARDS
// ============================================================

function renderPlayerCards() {

  const container =
    document.getElementById(
      "playerCards"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

      const races =
        buildSeriesHistoryHtml(
          p
        );


      const motorMark =
        motorEvaluation(
          p
        );


      const stMark =
        startEvaluation(
          p
        );


      container.insertAdjacentHTML(
        "beforeend",
        `
        <article class="player-card">

          <div class="player-head">

            <span class="lane l${p.lane}">
              ${p.lane}
            </span>

            <span>
              ${escapeHtml(p.grade)}
            </span>

          </div>


          <div class="player-body">

            <div class="player-name">
              ${escapeHtml(p.name)}
            </div>


            <div class="mini-grid">

              <div class="metric">
                登録
                <b>${p.number}</b>
              </div>

              <div class="metric">
                支部
                <b>${escapeHtml(p.branch)}</b>
              </div>

              <div class="metric">
                全国
                <b>${p.nationalWin}</b>
              </div>

              <div class="metric">
                当地
                <b>${p.localWin}</b>
              </div>


              <div class="metric">
                平均ST
                <b>${p.avgST}</b>
              </div>

              <div class="metric">
                今節ST
                <b>${p.seriesST}</b>
              </div>

              <div class="metric">
                F/L
                <b>
                  F${p.flying}
                  /
                  L${p.late}
                </b>
              </div>

              <div class="metric">
                ST評価
                <b>${stMark}</b>
              </div>


              <div class="metric">
                モーター
                <b>${p.motor}号</b>
              </div>

              <div class="metric">
                モーター2連
                <b>${pct(p.motor2)}</b>
              </div>

              <div class="metric">
                モーター3連
                <b>${pct(p.motor3)}</b>
              </div>

              <div class="metric">
                モーター評価
                <b>${motorMark}</b>
              </div>


              <div class="metric">
                得点率
                <b>${p.pointRate}</b>
              </div>

              <div class="metric">
                得点順位
                <b>
                  ${
                    p.pointRank !== "-"
                      ? `${p.pointRank}位`
                      : "-"
                  }
                </b>
              </div>

              <div class="metric">
                展示タイム
                <b>${displayWaiting(p.exhibitionTime)}</b>
              </div>

              <div class="metric">
                展示ST
                <b>${displayWaiting(p.startST)}</b>
              </div>

            </div>


            <div style="
              margin-top:12px;
              padding-top:10px;
              border-top:1px solid rgba(255,255,255,.08);
            ">

              <div style="
                font-size:12px;
                opacity:.7;
                margin-bottom:6px;
              ">
                今節成績
              </div>

              <div style="
                font-size:12px;
                line-height:1.8;
              ">
                ${races}
              </div>

            </div>

          </div>

        </article>
        `
      );
    }
  );
}


// ============================================================
// 今節履歴 HTML
// ============================================================

function buildSeriesHistoryHtml(
  p
) {

  if (
    !p.seriesRaces.length
  ) {

    return `
      <span style="opacity:.6">
        データなし
      </span>
    `;
  }


  return p.seriesRaces
    .map(
      r => {

        const result =
          r.result
          ?? "-";


        return `
          <span style="white-space:nowrap;">
            ${r.day}日目
            ${r.raceNo}R
            /
            ${r.course ?? "-"}C
            /
            ST ${r.st ?? "-"}
            /
            ${result}着
          </span>
        `;
      }
    )
    .join("<br>");
}


// ============================================================
// MOTOR TABLE
// ============================================================

function renderMotor() {

  const tbody =
    document.getElementById(
      "motorTable"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

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
            ${pct(p.motor2)}
          </td>

          <td>
            ${pct(p.motor3)}
          </td>

          <td>
            ${p.boat}号
          </td>

          <td>
            ${pct(p.boat2)}
          </td>

          <td>
            ${pct(p.boat3)}
          </td>

          <td>
            ${motorEvaluation(p)}
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// START TABLE
// ============================================================

function renderStart() {

  const tbody =
    document.getElementById(
      "startTable"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

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
            ${p.avgST}
          </td>

          <td>
            ${p.seriesST}
          </td>

          <td>
            ${
              p.pointRate !== "-"
                ? p.pointRate
                : "-"
            }
          </td>

          <td>
            ${
              p.pointRank !== "-"
                ? `${p.pointRank}位`
                : "-"
            }
          </td>

          <td>
            ${
              p.flying > 0
                ? `F${p.flying}`
                : "F0"
            }
          </td>

          <td>
            ${displayWaiting(p.startST)}
          </td>

          <td>
            ${startEvaluation(p)}
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// LIVE TABLE
// ============================================================

function renderLive() {

  const tbody =
    document.getElementById(
      "liveTable"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

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
            ${displayWaiting(p.startCourse)}
          </td>

          <td>
            ${displayWaiting(p.startST)}
          </td>

          <td>
            ${displayWaiting(p.exhibitionTime)}
          </td>

          <td>
            ${displayWaiting(p.tilt)}
          </td>

          <td>
            ${
              p.startOrder !== "-"
                ? p.startOrder
                : "-"
            }
          </td>

          <td>
            ${
              p.beforeAvailable
                ? "取得済"
                : "待機中"
            }
          </td>

          <td>
            ${
              liveEvaluation(p)
            }
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// WEATHER
// ============================================================

function renderWeather() {

  const race =
    currentRaceData?.race
    || {};


  const weather =
    race.weather
    || {};


  /*
   * 既存HTMLのsummary内ddを使用
   */
  const items =
    document.querySelectorAll(
      "#summary .kv dd"
    );


  if (
    items.length >= 5
  ) {

    items[0].textContent =
      weather.windDirection
      ??
      "取得待ち";


    items[1].textContent =
      weather.windSpeed !== null
      &&
      weather.windSpeed !== undefined

        ? `${weather.windSpeed}m`

        : "取得待ち";


    items[2].textContent =
      weather.wave !== null
      &&
      weather.wave !== undefined

        ? `${weather.wave}cm`

        : "取得待ち";


    items[3].textContent =
      weather.airTemperature !== null
      &&
      weather.airTemperature !== undefined

        ? `${weather.airTemperature}℃`

        : "取得待ち";


    items[4].textContent =
      weather.waterTemperature !== null
      &&
      weather.waterTemperature !== undefined

        ? `${weather.waterTemperature}℃`

        : "取得待ち";
  }


  updateConfidence();
}


// ============================================================
// MOTOR EVALUATION
// ============================================================

function motorEvaluation(
  p
) {

  const r2 =
    numberOrNull(
      p.motor2
    );


  const r3 =
    numberOrNull(
      p.motor3
    );


  if (
    r2 !== null
    &&
    r2 >= 50
  ) {

    return "🔥 強";
  }


  if (
    r2 !== null
    &&
    r2 >= 40
  ) {

    return "◎";
  }


  if (
    r3 !== null
    &&
    r3 >= 60
  ) {

    return "○";
  }


  if (
    r2 !== null
    &&
    r2 < 30
  ) {

    return "△";
  }


  return "○";
}


// ============================================================
// ST EVALUATION
// ============================================================

function startEvaluation(
  p
) {

  if (
    p.flying > 0
  ) {

    return "△ F持ち";
  }


  const series =
    stNumber(
      p.seriesST
    );


  const normal =
    stNumber(
      p.avgST
    );


  if (
    series !== null
    &&
    series <= 0.10
  ) {

    return "🔥 今節踏めてる";
  }


  if (
    series !== null
    &&
    series <= 0.13
  ) {

    return "◎ 今節ST良";
  }


  if (
    normal !== null
    &&
    normal <= 0.13
  ) {

    return "◎ ST速い";
  }


  if (
    normal !== null
    &&
    normal >= 0.19
  ) {

    return "△ ST遅め";
  }


  return "○";
}


// ============================================================
// LIVE EVALUATION
// ============================================================

function liveEvaluation(
  p
) {

  if (
    !p.beforeAvailable
  ) {

    return "取得待ち";
  }


  const st =
    exhibitionSTNumber(
      p.startST
    );


  if (
    st !== null
    &&
    st < 0
  ) {

    return "⚠ F展示";
  }


  if (
    st !== null
    &&
    st <= 0.05
  ) {

    return "🔥 踏み込み";
  }


  if (
    st !== null
    &&
    st <= 0.10
  ) {

    return "◎";
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


  const one =
    samplePlayers.find(
      p =>
        p.lane === 1
    );


  /*
   * まだ本格的なイン逃げ率を取得していないので
   * 仮の信頼度スコアは出さない。
   */
  if (score) {

    score.textContent =
      "—";
  }


  if (bar) {

    bar.style.width =
      "0%";
  }


  if (!one) {
    return;
  }
}


// ============================================================
// AI COPY TEXT
// ============================================================

function buildAIText() {

  const race =
    currentRaceData?.race
    || {};


  const weather =
    race.weather
    || {};


  let text =
    "";


  text +=
    `【${race.place || selectedVenue} ${race.raceNo || selectedRace}R】\n`;


  text +=
    `日付：${formatApiDate(race.date)}\n`;


  text +=
    `取得元：BOAT RACE公式\n`;


  text +=
    `直前情報：${
      currentRaceData?.before?.available
        ? "公開済"
        : "未公開"
    }\n`;


  text +=
    "\n";


  // =========================================================
  // 水面
  // =========================================================

  text +=
    "【水面・気象】\n";


  text +=
    `天候：${weather.weather ?? "取得待ち"}\n`;


  text +=
    `気温：${unit(weather.airTemperature, "℃")}\n`;


  text +=
    `水温：${unit(weather.waterTemperature, "℃")}\n`;


  text +=
    `風向：${weather.windDirection ?? "取得待ち"}\n`;


  text +=
    `風速：${unit(weather.windSpeed, "m")}\n`;


  text +=
    `波高：${unit(weather.wave, "cm")}\n`;


  text +=
    "\n";


  // =========================================================
  // 選手
  // =========================================================

  samplePlayers.forEach(
    p => {

      text +=
        `■${p.lane}号艇 ${p.name} ${p.grade}\n`;


      text +=
        `登録：${p.number}` +
        ` / 支部：${p.branch}` +
        ` / 出身：${p.hometown}` +
        ` / ${p.age}歳` +
        ` / ${p.weight}kg\n`;


      text +=
        `全国：勝率${p.nationalWin}` +
        ` / 2連${pct(p.national2)}` +
        ` / 3連${pct(p.national3)}\n`;


      text +=
        `当地：勝率${p.localWin}` +
        ` / 2連${pct(p.local2)}` +
        ` / 3連${pct(p.local3)}\n`;


      text +=
        `平均ST：${p.avgST}` +
        ` / 今節平均ST：${p.seriesST}` +
        ` / F${p.flying}` +
        ` / L${p.late}\n`;


      text +=
        `モーター${p.motor}号：` +
        `2連${pct(p.motor2)}` +
        ` / 3連${pct(p.motor3)}\n`;


      text +=
        `ボート${p.boat}号：` +
        `2連${pct(p.boat2)}` +
        ` / 3連${pct(p.boat3)}\n`;


      text +=
        `得点率：${p.pointRate}` +
        ` / 順位：${
          p.pointRank !== "-"
            ? `${p.pointRank}位`
            : "-"
        }\n`;


      text +=
        `直前：展示タイム ${displayWaiting(p.exhibitionTime)}` +
        ` / 展示ST ${displayWaiting(p.startST)}` +
        ` / 展示コース ${displayWaiting(p.startCourse)}` +
        ` / チルト ${displayWaiting(p.tilt)}\n`;


      text +=
        `今節：${buildSeriesHistoryText(p)}\n`;


      text +=
        "\n";
    }
  );


  text +=
    "【評価用メモ】\n";


  text +=
    "平均STだけでなく今節ST・F持ち・モーター2連/3連・得点率順位・今節着順推移・直前展示を総合して評価すること。\n";


  text +=
    "展示情報が未公開の場合は、未取得値を推測せず基本情報と今節成績のみで暫定評価すること。";


  return text;
}


// ============================================================
// 今節履歴 TEXT
// ============================================================

function buildSeriesHistoryText(
  p
) {

  if (
    !p.seriesRaces.length
  ) {

    return "データなし";
  }


  return p.seriesRaces
    .map(
      r => {

        let result =
          r.result
          ?? "-";


        if (
          typeof result === "number"
        ) {

          result =
            `${result}着`;
        }


        return (
          `${r.day}日目` +
          `${r.raceNo}R` +
          ` ${r.course ?? "-"}C` +
          ` ST${r.st ?? "-"}` +
          ` ${result}`
        );
      }
    )
    .join(" / ");
}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {

  renderPlayerCards();

  renderMotor();

  renderStart();

  renderLive();


  const ai =
    document.getElementById(
      "aiText"
    );


  if (ai) {

    ai.value =
      buildAIText();
  }
}


// ============================================================
// BACK
// ============================================================

document.getElementById(
  "backToVenues"
)?.addEventListener(
  "click",
  () => {

    raceView?.classList.add(
      "hidden"
    );

    detailView?.classList.add(
      "hidden"
    );

    venueView?.classList.remove(
      "hidden"
    );
  }
);


document.getElementById(
  "backToRaces"
)?.addEventListener(
  "click",
  () => {

    detailView?.classList.add(
      "hidden"
    );

    raceView?.classList.remove(
      "hidden"
    );
  }
);


// ============================================================
// COPY
// ============================================================

document.getElementById(
  "copyBtn"
)?.addEventListener(
  "click",
  async () => {

    const textarea =
      document.getElementById(
        "aiText"
      );


    if (!textarea) {
      return;
    }


    const text =
      textarea.value;


    try {

      await navigator.clipboard
        .writeText(
          text
        );

    } catch {

      textarea.select();

      document.execCommand(
        "copy"
      );
    }


    const toast =
      document.getElementById(
        "toast"
      );


    if (toast) {

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
  }
);


// ============================================================
// TABS
// ============================================================

document.querySelectorAll(
  ".tab"
)
  .forEach(
    btn => {

      btn.addEventListener(
        "click",
        () => {

          document.querySelectorAll(
            ".tab"
          )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );


          document.querySelectorAll(
            ".tab-panel"
          )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );


          btn.classList.add(
            "active"
          );


          const target =
            document.getElementById(
              btn.dataset.tab
            );


          target?.classList.add(
            "active"
          );
        }
      );
    }
  );


// ============================================================
// UTIL
// ============================================================

function setText(
  id,
  text
) {

  const el =
    document.getElementById(
      id
    );


  if (el) {
    el.textContent =
      text;
  }
}


function value(
  v
) {

  if (
    v === null
    ||
    v === undefined
    ||
    v === ""
  ) {

    return "-";
  }


  return v;
}


function pct(
  v
) {

  if (
    v === null
    ||
    v === undefined
    ||
    v === ""
    ||
    v === "-"
  ) {

    return "-";
  }


  return `${v}%`;
}


function unit(
  v,
  suffix
) {

  if (
    v === null
    ||
    v === undefined
    ||
    v === ""
  ) {

    return "取得待ち";
  }


  return `${v}${suffix}`;
}


function displayWaiting(
  value
) {

  if (
    value === null
    ||
    value === undefined
    ||
    value === ""
    ||
    value === "-"
  ) {

    return "取得待ち";
  }


  return value;
}


function numberOrNull(
  value
) {

  if (
    value === null
    ||
    value === undefined
    ||
    value === ""
    ||
    value === "-"
  ) {

    return null;
  }


  const n =
    Number(
      value
    );


  return Number.isNaN(n)
    ? null
    : n;
}


function stNumber(
  value
) {

  if (
    !value
    ||
    value === "-"
  ) {

    return null;
  }


  const text =
    String(value)
      .replace(
        /[FL]/gi,
        ""
      );


  const n =
    Number(
      text
    );


  return Number.isNaN(n)
    ? null
    : n;
}


function exhibitionSTNumber(
  value
) {

  if (
    !value
    ||
    value === "-"
  ) {

    return null;
  }


  const text =
    String(value);


  const n =
    Number(
      text.replace(
        /[FL]/gi,
        ""
      )
    );


  if (
    Number.isNaN(n)
  ) {

    return null;
  }


  /*
   * F表示は負数扱い
   */
  if (
    /^F/i.test(text)
  ) {

    return -n;
  }


  return n;
}


function formatApiDate(
  date
) {

  if (
    !date
    ||
    String(date).length !== 8
  ) {

    return date
    || "-";
  }


  const s =
    String(date);


  return (
    `${s.slice(0,4)}/` +
    `${s.slice(4,6)}/` +
    `${s.slice(6,8)}`
  );
}


function escapeHtml(
  str
) {

  return String(
    str ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


// ============================================================
// START
// ============================================================

renderVenues();
