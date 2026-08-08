// ============================================================
// BOAT RACE DASHBOARD
// BOAT RACE公式 × Cloudflare Worker
// 統合表示 + イン信頼度版
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
      () =>
        openVenue(name)
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
                  F${p.flying}
                  /
                  L${p.late}
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
                モーター2連
                <b>${pct(p.motor2)}</b>
              </div>

              <div class="metric">
                モーター3連
                <b>${pct(p.motor3)}</b>
              </div>

              <div class="metric">
                モーター評価
                <b>${motorEvaluation(p)}</b>
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
              border-top:1px solid rgba(0,0,0,.08);
            ">

              <div style="
                font-size:12px;
                opacity:.65;
                margin-bottom:6px;
              ">
                今節成績
              </div>

              <div style="
                font-size:12px;
                line-height:1.8;
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
// 今節履歴 HTML
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
          `${r.day}日目 ` +
          `${r.raceNo}R / ` +
          `${r.course ?? "-"}C / ` +
          `ST ${r.st ?? "-"} / ` +
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

          <td>
            F${p.flying}
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


  let noteEl =
    document.querySelector(
      ".confidence-note"
    );


  /*
   * classが無い旧HTMLでも動かす
   */
  if (!noteEl) {

    const panel =
      scoreEl?.closest(
        ".panel"
      );


    if (panel) {

      const p =
        panel.querySelector("p");


      if (p) {

        p.classList.add(
          "confidence-note"
        );


        noteEl =
          p;
      }
    }
  }


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


  // ----------------------------------------------------------
  // 平均ST
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // 今節ST
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // F
  // ----------------------------------------------------------

  if (
    one.flying > 0
  ) {

    score -= 10;

    reasons.push(
      "1号艇はF持ち"
    );
  }


  // ----------------------------------------------------------
  // モーター
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // 得点率
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // 2〜4号艇の攻撃力
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // 直前展示
  // ----------------------------------------------------------

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


  // ----------------------------------------------------------
  // 0〜100
  // ----------------------------------------------------------

  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );


  if (
    scoreEl
  ) {

    scoreEl.textContent =
      `${score}%`;
  }


  if (
    barEl
  ) {

    barEl.style.width =
      `${score}%`;
  }


  let label =
    "";


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


  if (
    noteEl
  ) {

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
// AI COPY
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
        `展示：` +
        `進入${displayWaiting(p.startCourse)}` +
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
// 今節 TEXT
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

renderVenues();
