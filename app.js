// ============================================================
// BOAT RACE DASHBOARD
// BOAT RACE公式 × Cloudflare Worker
// 開催一覧 + 12R直接選択 + 6艇横並び
// ============================================================

const API_BASE =
  "https://boat-race-api.k09082207390.workers.dev/";


// ============================================================
// 本日の開催表示
//
// 現在はトップ表示用データ。
// レース本体はBOAT RACE公式からWorker経由で取得。
// ============================================================

const venues = [

  {
    name: "桐生",
    placeNo: 1,
    day: "5日目",
    time: "10:47",
    type: "night",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "戸田",
    placeNo: 2,
    day: "最終日",
    time: "10:47",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "江戸川",
    placeNo: 3,
    day: "初日",
    time: "11:14",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "平和島",
    placeNo: 4,
    day: "次開催",
    time: "08/11",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "多摩川",
    placeNo: 5,
    day: "2日目",
    time: "11:33",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "浜名湖",
    placeNo: 6,
    day: "次開催",
    time: "08/11",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "蒲郡",
    placeNo: 7,
    day: "次開催",
    time: "08/10",
    type: "night",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "常滑",
    placeNo: 8,
    day: "次開催",
    time: "08/10",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "津",
    placeNo: 9,
    day: "5日目",
    time: "10:28",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "三国",
    placeNo: 10,
    day: "最終日",
    time: "08:32",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "びわこ",
    placeNo: 11,
    day: "次開催",
    time: "08/15",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "住之江",
    placeNo: 12,
    day: "最終日",
    time: "15:17",
    type: "night",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "尼崎",
    placeNo: 13,
    day: "初日",
    time: "10:33",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "鳴門",
    placeNo: 14,
    day: "5日目",
    time: "08:40",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "丸亀",
    placeNo: 15,
    day: "3日目",
    time: "15:25",
    type: "night",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "児島",
    placeNo: 16,
    day: "2日目",
    time: "10:46",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "宮島",
    placeNo: 17,
    day: "次開催",
    time: "08/14",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "徳山",
    placeNo: 18,
    day: "4日目",
    time: "10:38",
    type: "g1",
    rank: "PG1",
    title: "第40回 レディースチャンピオン"
  },

  {
    name: "下関",
    placeNo: 19,
    day: "次開催",
    time: "08/11",
    type: "night",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "若松",
    placeNo: 20,
    day: "3日目",
    time: "15:29",
    type: "night",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "芦屋",
    placeNo: 21,
    day: "次開催",
    time: "08/10",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "福岡",
    placeNo: 22,
    day: "次開催",
    time: "08/12",
    type: "",
    rank: "一般",
    title: "次開催"
  },

  {
    name: "唐津",
    placeNo: 23,
    day: "初日",
    time: "08:48",
    type: "",
    rank: "一般",
    title: "開催中"
  },

  {
    name: "大村",
    placeNo: 24,
    day: "4日目",
    time: "15:20",
    type: "night",
    rank: "一般",
    title: "開催中"
  }

];


// ============================================================
// PLACE NUMBER
// ============================================================

const PLACE_NUMBERS =
  Object.fromEntries(
    venues.map(v => [
      v.name,
      v.placeNo
    ])
  );


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


function setDates() {

  const date =
    todayString();

  const todayLabel =
    document.getElementById(
      "todayLabel"
    );

  const homeDateLabel =
    document.getElementById(
      "homeDateLabel"
    );


  if (todayLabel) {
    todayLabel.textContent =
      date;
  }


  if (homeDateLabel) {
    homeDateLabel.textContent =
      date;
  }
}


// ============================================================
// ★ 本日の開催
// ============================================================

function renderVenues() {

  if (!venueGrid) {
    return;
  }


  venueGrid.innerHTML =
    "";


  venues.forEach(
    meeting => {

      const isNext =
        meeting.day === "次開催";


      const nightBadge =
        meeting.type === "night"
          ? `
            <span class="meeting-badge night">
              ナイター
            </span>
          `
          : "";


      const gradeBadge =
        meeting.type === "g1"
          ? `
            <span class="meeting-badge g1">
              ${meeting.rank}
            </span>
          `
          : `
            <span class="meeting-badge">
              ${meeting.rank}
            </span>
          `;


      const races =
        isNext
          ? buildNextMeetingNotice(
              meeting
            )
          : buildMeetingRaceButtons(
              meeting
            );


      venueGrid.insertAdjacentHTML(
        "beforeend",
        `
        <article class="meeting-card">

          <div class="meeting-head">

            <div class="meeting-main">

              <div class="meeting-place">
                ${escapeHtml(meeting.name)}
              </div>

              <div class="meeting-info">

                <div class="meeting-title">
                  ${escapeHtml(meeting.title)}
                </div>

                <div class="meeting-sub">
                  ${escapeHtml(meeting.day)}
                  ・
                  1R ${escapeHtml(meeting.time)}
                </div>

              </div>

            </div>


            <div class="meeting-badges">

              ${gradeBadge}

              ${nightBadge}

            </div>

          </div>


          ${races}

        </article>
        `
      );

    }
  );


  bindMeetingButtons();
}


// ============================================================
// 1R〜12R
// ============================================================

function buildMeetingRaceButtons(
  meeting
) {

  let html =
    `<div class="meeting-races">`;


  for (
    let race = 1;
    race <= 12;
    race++
  ) {

    html += `
      <button
        class="meeting-race-btn"
        type="button"
        data-place="${escapeHtml(meeting.name)}"
        data-race="${race}"
      >

        <strong>
          ${race}R
        </strong>

        <span>
          選択
        </span>

      </button>
    `;
  }


  html +=
    `</div>`;


  return html;
}


// ============================================================
// 次開催
// ============================================================

function buildNextMeetingNotice(
  meeting
) {

  return `
    <div
      style="
        padding:11px 13px;
        color:#708793;
        font-size:11px;
        background:#f9fcfd;
      "
    >
      次開催：
      ${escapeHtml(meeting.time)}
    </div>
  `;
}


// ============================================================
// 開催一覧のRボタン
// ============================================================

function bindMeetingButtons() {

  document.querySelectorAll(
    ".meeting-race-btn"
  )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const place =
              button.dataset.place;

            const race =
              Number(
                button.dataset.race
              );


            document
              .querySelectorAll(
                ".meeting-race-btn"
              )
              .forEach(
                x =>
                  x.classList.remove(
                    "selected"
                  )
              );


            button.classList.add(
              "selected"
            );


            selectedVenue =
              place;

            openRace(
              race
            );

          }
        );

      }
    );
}


// ============================================================
// 旧UI互換
// ============================================================

function openVenue(
  name
) {

  selectedVenue =
    name;


  setText(
    "selectedVenueTitle",
    name
  );


  setText(
    "selectedVenueMeta",
    "レースを選択"
  );


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


  venueView?.classList.add(
    "hidden"
  );


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


    const data =
      await response.json();


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


    activateSummaryTab();

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

          el.innerHTML =
            "";
        }

      }
    );


  const ai =
    document.getElementById(
      "aiText"
    );


  if (ai) {

    ai.value =
      "";
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
                  F${p.flying}/L${p.late}
                </b>
              </div>

              <div class="metric">
                ST評価
                <b>${startEvaluation(p)}</b>
              </div>


              <div class="metric">
                モーター
                <b>${p.motor}号</b>
              </div>

              <div class="metric">
                2連率
                <b>${pct(p.motor2)}</b>
              </div>


              <div class="metric">
                3連率
                <b>${pct(p.motor3)}</b>
              </div>

              <div class="metric">
                機力
                <b>${motorEvaluation(p)}</b>
              </div>


              <div class="metric">
                得点率
                <b>${p.pointRate}</b>
              </div>

              <div class="metric">
                順位
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
              margin-top:8px;
              padding-top:7px;
              border-top:1px solid rgba(0,0,0,.08);
            ">

              <div style="
                font-size:9px;
                opacity:.65;
                margin-bottom:3px;
              ">
                今節成績
              </div>

              <div style="
                font-size:9px;
                line-height:1.55;
              ">
                ${buildSeriesHistoryHtml(p)}
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
// SERIES HTML
// ============================================================

function buildSeriesHistoryHtml(
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
          `${r.day}日 ${r.raceNo}R ` +
          `${r.course ?? "-"}C ` +
          `ST${r.st ?? "-"} ` +
          `${result}`
        );

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

          <td>${p.motor}号</td>

          <td>${pct(p.motor2)}</td>

          <td>${pct(p.motor3)}</td>

          <td>${p.boat}号</td>

          <td>${pct(p.boat2)}</td>

          <td>${pct(p.boat3)}</td>

          <td>${motorEvaluation(p)}</td>

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

          <td>${p.avgST}</td>

          <td>${p.seriesST}</td>

          <td>${p.pointRate}</td>

          <td>
            ${
              p.pointRank !== "-"
                ? `${p.pointRank}位`
                : "-"
            }
          </td>

          <td>F${p.flying}</td>

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
            ${displayWaiting(p.startOrder)}
          </td>

          <td>
            ${
              p.beforeAvailable
                ? "取得済"
                : "待機中"
            }
          </td>

          <td>
            ${liveEvaluation(p)}
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

  const weather =
    currentRaceData?.race?.weather
    || {};


  const items =
    document.querySelectorAll(
      "#summary .kv dd"
    );


  if (
    items.length < 5
  ) {
    return;
  }


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
// START EVALUATION
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

    return "🔥 踏めてる";
  }


  if (
    series !== null
    &&
    series <= 0.13
  ) {

    return "◎ 今節良";
  }


  if (
    normal !== null
    &&
    normal <= 0.13
  ) {

    return "◎ ST速";
  }


  if (
    normal !== null
    &&
    normal >= 0.19
  ) {

    return "△ 遅め";
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

    return "🔥";
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
// イン信頼度
// ============================================================

function updateConfidence() {

  const scoreEl =
    document.querySelector(
      ".confidence-score"
    );


  const barEl =
    document.querySelector(
      ".confidence-bar span"
    );


  const noteEl =
    document.querySelector(
      ".confidence-note"
    );


  const one =
    samplePlayers.find(
      p =>
        p.lane === 1
    );


  if (!one) {

    if (scoreEl) {
      scoreEl.textContent = "—";
    }

    if (barEl) {
      barEl.style.width = "0%";
    }

    return;
  }


  let score =
    50;


  const reasons =
    [];


  // 平均ST

  const avgST =
    stNumber(
      one.avgST
    );


  if (
    avgST !== null
  ) {

    if (
      avgST <= 0.12
    ) {

      score += 10;

      reasons.push(
        "1号艇の平均STが速い"
      );

    } else if (
      avgST <= 0.15
    ) {

      score += 6;

    } else if (
      avgST >= 0.19
    ) {

      score -= 8;

      reasons.push(
        "1号艇の平均STが遅め"
      );
    }
  }


  // 今節ST

  const seriesST =
    stNumber(
      one.seriesST
    );


  if (
    seriesST !== null
  ) {

    if (
      seriesST <= 0.10
    ) {

      score += 12;

      reasons.push(
        "1号艇が今節かなり踏めている"
      );

    } else if (
      seriesST <= 0.13
    ) {

      score += 8;

      reasons.push(
        "1号艇の今節STが良い"
      );

    } else if (
      seriesST >= 0.19
    ) {

      score -= 8;

      reasons.push(
        "1号艇の今節STが遅い"
      );
    }
  }


  // F

  if (
    one.flying > 0
  ) {

    score -= 10;

    reasons.push(
      "1号艇はF持ち"
    );
  }


  // Motor

  const motor2 =
    numberOrNull(
      one.motor2
    );


  const motor3 =
    numberOrNull(
      one.motor3
    );


  if (
    motor2 !== null
  ) {

    if (
      motor2 >= 50
    ) {

      score += 10;

      reasons.push(
        "1号艇のモーターが強い"
      );

    } else if (
      motor2 >= 40
    ) {

      score += 5;

    } else if (
      motor2 < 30
    ) {

      score -= 8;

      reasons.push(
        "1号艇のモーターが弱め"
      );
    }
  }


  if (
    motor3 !== null
    &&
    motor3 >= 60
  ) {

    score += 4;
  }


  // Point

  const pointRate =
    numberOrNull(
      one.pointRate
    );


  if (
    pointRate !== null
  ) {

    if (
      pointRate >= 7
    ) {

      score += 8;

      reasons.push(
        "1号艇は今節上位"
      );

    } else if (
      pointRate >= 6
    ) {

      score += 4;

    } else if (
      pointRate < 4
    ) {

      score -= 6;

      reasons.push(
        "1号艇の今節成績が低調"
      );
    }
  }


  // 2〜4攻撃力

  const attackers =
    samplePlayers.filter(
      p =>
        p.lane >= 2
        &&
        p.lane <= 4
    );


  attackers.forEach(
    p => {

      const pST =
        stNumber(
          p.seriesST
        );


      const pMotor =
        numberOrNull(
          p.motor2
        );


      let danger =
        0;


      if (
        pST !== null
        &&
        pST <= 0.10
      ) {

        danger += 2;

      } else if (
        pST !== null
        &&
        pST <= 0.13
      ) {

        danger += 1;
      }


      if (
        pMotor !== null
        &&
        pMotor >= 50
      ) {

        danger += 2;
      }


      if (
        p.flying > 0
      ) {

        danger -= 1;
      }


      if (
        danger >= 3
      ) {

        score -= 8;

        reasons.push(
          `${p.lane}号艇の攻撃力が高い`
        );

      } else if (
        danger === 2
      ) {

        score -= 4;
      }

    }
  );


  // 直前ST

  if (
    one.beforeAvailable
  ) {

    const exhibitionST =
      exhibitionSTNumber(
        one.startST
      );


    if (
      exhibitionST !== null
    ) {

      if (
        exhibitionST < 0
      ) {

        score -= 6;

        reasons.push(
          "1号艇が展示F"
        );

      } else if (
        exhibitionST <= 0.05
      ) {

        score += 6;

        reasons.push(
          "1号艇の展示STが鋭い"
        );
      }
    }
  }


  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );


  if (scoreEl) {

    scoreEl.textContent =
      `${score}%`;
  }


  if (barEl) {

    barEl.style.width =
      `${score}%`;
  }


  let label;


  if (
    score >= 80
  ) {

    label =
      "かなり信頼";

  } else if (
    score >= 70
  ) {

    label =
      "信頼";

  } else if (
    score >= 60
  ) {

    label =
      "やや信頼";

  } else if (
    score >= 50
  ) {

    label =
      "五分";

  } else if (
    score >= 40
  ) {

    label =
      "やや不安";

  } else {

    label =
      "波乱警戒";
  }


  if (noteEl) {

    noteEl.textContent =
      `${label}｜${
        reasons.length
          ? reasons
              .slice(0, 3)
              .join("・")
          : "大きなプラス・マイナス材料なし"
      }`;
  }
}


// ============================================================
// AI TEXT
// ============================================================

function buildAIText() {

  const race =
    currentRaceData?.race
    || {};


  const weather =
    race.weather
    || {};


  const scoreText =
    document.querySelector(
      ".confidence-score"
    )?.textContent
    || "—";


  const confidenceNote =
    document.querySelector(
      ".confidence-note"
    )?.textContent
    || "-";


  let text =
    "";


  text +=
    `【${race.place || selectedVenue} ${race.raceNo || selectedRace}R】\n`;


  text +=
    `日付：${formatApiDate(race.date)}\n`;


  text +=
    `イン信頼度：${scoreText}\n`;


  text +=
    `イン評価：${confidenceNote}\n`;


  text +=
    `直前情報：${
      currentRaceData?.before?.available
        ? "公開済"
        : "未公開"
    }\n\n`;


  text +=
    "【気象・水面】\n";


  text +=
    `風向：${weather.windDirection ?? "取得待ち"}\n`;

  text +=
    `風速：${unit(weather.windSpeed, "m")}\n`;

  text +=
    `波高：${unit(weather.wave, "cm")}\n`;

  text +=
    `気温：${unit(weather.airTemperature, "℃")}\n`;

  text +=
    `水温：${unit(weather.waterTemperature, "℃")}\n\n`;


  samplePlayers.forEach(
    p => {

      text +=
        `■${p.lane}号艇 ${p.name} ${p.grade}\n`;


      text +=
        `登録：${p.number}` +
        ` / 支部：${p.branch}` +
        ` / 出身：${p.hometown}\n`;


      text +=
        `全国：${p.nationalWin}` +
        ` / 2連${pct(p.national2)}` +
        ` / 3連${pct(p.national3)}\n`;


      text +=
        `当地：${p.localWin}` +
        ` / 2連${pct(p.local2)}` +
        ` / 3連${pct(p.local3)}\n`;


      text +=
        `平均ST：${p.avgST}` +
        ` / 今節ST：${p.seriesST}` +
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
        `展示：進入${displayWaiting(p.startCourse)}` +
        ` / ST${displayWaiting(p.startST)}` +
        ` / タイム${displayWaiting(p.exhibitionTime)}` +
        ` / チルト${displayWaiting(p.tilt)}\n`;


      text +=
        `今節：${buildSeriesHistoryText(p)}\n\n`;

    }
  );


  return text;
}


// ============================================================
// SERIES TEXT
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
          `${r.day}日目${r.raceNo}R ` +
          `${r.course ?? "-"}C ` +
          `ST${r.st ?? "-"} ` +
          `${result}`
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

  renderWeather();

  updateConfidence();


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
// TAB RESET
// ============================================================

function activateSummaryTab() {

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


  document.querySelector(
    '.tab[data-tab="summary"]'
  )?.classList.add(
    "active"
  );


  document.getElementById(
    "summary"
  )?.classList.add(
    "active"
  );
}


// ============================================================
// BACK
// ============================================================

function showHome() {

  detailView?.classList.add(
    "hidden"
  );

  raceView?.classList.add(
    "hidden"
  );

  venueView?.classList.remove(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document.getElementById(
  "backToVenues"
)?.addEventListener(
  "click",
  showHome
);


document.getElementById(
  "backToRaces"
)?.addEventListener(
  "click",
  showHome
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


    try {

      await navigator.clipboard
        .writeText(
          textarea.value
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


          document.getElementById(
            btn.dataset.tab
          )?.classList.add(
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

    return "取得待ち";
  }


  return v;
}


function numberOrNull(
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

    return null;
  }


  const n =
    Number(v);


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


  const n =
    Number(
      String(value)
        .replace(
          /[FL]/gi,
          ""
        )
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

setDates();

renderVenues();
