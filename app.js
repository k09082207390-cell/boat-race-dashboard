// ============================================================
// BOAT RACE DASHBOARD
// GitHub Pages <-> Cloudflare Worker 実データ接続版
// ============================================================

const API_BASE =
  "https://boat-race-api.k09082207390.workers.dev/";


// ============================================================
// 24場
// ============================================================

const venues = [
  ["桐生", "5日目", "10:47", "night"],
  ["戸田", "最終日", "10:47", ""],
  ["江戸川", "初日", "11:14", ""],
  ["平和島", "次開催", "08/11", ""],

  ["多摩川", "2日目", "11:33", ""],
  ["浜名湖", "次開催", "08/11", ""],
  ["蒲郡", "次開催", "08/10", "night"],
  ["常滑", "次開催", "08/10", ""],

  ["津", "5日目", "10:28", ""],
  ["三国", "最終日", "08:32", ""],
  ["びわこ", "次開催", "08/15", ""],
  ["住之江", "最終日", "15:17", "night"],

  ["尼崎", "初日", "10:33", ""],
  ["鳴門", "5日目", "08:40", ""],
  ["丸亀", "3日目", "15:25", "night"],
  ["児島", "2日目", "10:46", ""],

  ["宮島", "次開催", "08/14", ""],
  ["徳山", "4日目", "10:38", "g1"],
  ["下関", "次開催", "08/11", "night"],
  ["若松", "3日目", "15:29", "night"],

  ["芦屋", "次開催", "08/10", ""],
  ["福岡", "次開催", "08/12", ""],
  ["唐津", "初日", "08:48", ""],
  ["大村", "4日目", "15:20", "night"]
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
// 状態
// ============================================================

let selectedVenue = "徳山";
let selectedRace = 10;

let samplePlayers = [];

let currentRaceData = null;


// ============================================================
// 日付
// ============================================================

function todayString() {

  const d = new Date();

  return (
    `${d.getFullYear()}/` +
    `${String(d.getMonth() + 1).padStart(2, "0")}/` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}


function todayApiString() {

  const d = new Date();

  return (
    `${d.getFullYear()}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}


document.getElementById("todayLabel").textContent =
  todayString();


// ============================================================
// 開催場
// ============================================================

function renderVenues() {

  venueGrid.innerHTML = "";

  venues.forEach(v => {

    const [
      name,
      day,
      time,
      type
    ] = v;

    const btn =
      document.createElement("button");

    btn.className =
      "venue-card";

    btn.innerHTML = `
      <span class="venue-name">
        ${name}
      </span>

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

    btn.addEventListener(
      "click",
      () => openVenue(
        name,
        day
      )
    );

    venueGrid.appendChild(btn);
  });
}


// ============================================================
// 場を開く
// ============================================================

function openVenue(
  name,
  day
) {

  selectedVenue =
    name;

  document.getElementById(
    "selectedVenueTitle"
  ).textContent =
    name;

  document.getElementById(
    "selectedVenueMeta"
  ).textContent =
    `${day}・レースを選択`;

  venueView.classList.add(
    "hidden"
  );

  detailView.classList.add(
    "hidden"
  );

  raceView.classList.remove(
    "hidden"
  );

  renderRaces();
}


// ============================================================
// 1R～12R
// ============================================================

function renderRaces() {

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
      () => openRace(i)
    );

    raceGrid.appendChild(
      btn
    );
  }
}


// ============================================================
// レースを開く
// ============================================================

async function openRace(r) {

  selectedRace =
    r;

  raceView.classList.add(
    "hidden"
  );

  detailView.classList.remove(
    "hidden"
  );

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
    "ボート日和から取得中...";

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


    // 現在の日付を自動使用
    const hiduke =
      todayApiString();


    const apiUrl =
      `${API_BASE}` +
      `?hiduke=${hiduke}` +
      `&place_no=${placeNo}` +
      `&race_no=${r}`;


    const res =
      await fetch(apiUrl);


    if (!res.ok) {

      throw new Error(
        `API HTTP ${res.status}`
      );
    }


    const data =
      await res.json();


    if (!data.ok) {

      throw new Error(
        data.error ||
        "データ取得失敗"
      );
    }


    currentRaceData =
      data;


    // ========================================================
    // Worker JSON → 画面用データ
    // ========================================================

    samplePlayers =
      data.players.map(
        p => ({
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


          // ----------------------------------
          // 選手成績
          // ----------------------------------

          nat:
            value(
              p.national?.winRate
            ),

          nat2:
            value(
              p.national?.secondRate
            ),

          nat3:
            value(
              p.national?.thirdRate
            ),

          local:
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


          // ----------------------------------
          // ST
          // ----------------------------------

          avgst:
            p.start?.average ??
            "-",

          cst:
            p.start?.courseAverage ??
            "-",

          season:
            p.start?.currentSeriesAverage ??
            "-",

          stRank:
            p.start?.rank ??
            "-",

          // 展示STは次段階
          est:
            "-",


          // ----------------------------------
          // モーター
          // ----------------------------------

          motor:
            String(
              p.motor?.number ??
              "-"
            ),

          m2:
            value(
              p.motor?.secondRate
            ),

          m3:
            value(
              p.motor?.thirdRate
            ),

          motorWinRate:
            value(
              p.motor?.winRate
            ),

          motorEntries:
            value(
              p.motor?.entries
            ),

          motorFinals:
            value(
              p.motor?.finals
            ),

          motorWins:
            value(
              p.motor?.wins
            ),


          // ----------------------------------
          // 直近1か月
          // まだ取得処理を追加していない
          // ----------------------------------

          r2:
            "-",

          r3:
            "-",


          // ----------------------------------
          // 前検
          // ----------------------------------

          pre:
            value(
              p.inspection?.time
            ),

          preMotor2:
            value(
              p.inspection?.motorSecondRate
            ),


          // ----------------------------------
          // 今節
          // ----------------------------------

          pointRate:
            value(
              p.series?.pointRate
            ),

          seriesDisplay:
            value(
              p.series?.displayAverage
            ),


          // ----------------------------------
          // F
          // ----------------------------------

          f:
            Number(
              p.flying || 0
            ),


          // ----------------------------------
          // チルト
          // ----------------------------------

          tilt:
            p.tilt ?? "-"
        })
      );


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
      [
        race.day
          ? `${race.day}日目`
          : "",

        race.rank || "",

        race.title || "",

        race.deadline
          ? `締切 ${race.deadline}`
          : ""
      ]
        .filter(Boolean)
        .join("・");


    document.getElementById(
      "fetchStatus"
    ).textContent =
      `実データ取得成功：` +
      `${samplePlayers.length}艇`;


    updateWeather(
      race
    );


    updateConfidence();


    renderAll();

  } catch (error) {

    console.error(
      error
    );


    samplePlayers =
      [];


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
    ).innerHTML =
      `
      <div class="panel">
        データ取得エラー
        <br>
        ${escapeHtml(
          error.message
        )}
      </div>
      `;


    document.getElementById(
      "aiText"
    ).value =
      `データ取得エラー\n` +
      `${error.message}`;
  }
}


// ============================================================
// 詳細初期化
// ============================================================

function clearDetail() {

  document.getElementById(
    "playerCards"
  ).innerHTML =
    "";

  document.getElementById(
    "motorTable"
  ).innerHTML =
    "";

  document.getElementById(
    "startTable"
  ).innerHTML =
    "";

  document.getElementById(
    "liveTable"
  ).innerHTML =
    "";

  document.getElementById(
    "aiText"
  ).value =
    "";
}


// ============================================================
// 選手カード
// ============================================================

function renderPlayerCards() {

  const el =
    document.getElementById(
      "playerCards"
    );

  el.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

      el.insertAdjacentHTML(
        "beforeend",
        `
        <article class="player-card">

          <div class="player-head">

            <span class="lane l${p.lane}">
              ${p.lane}
            </span>

            <span>
              ${p.grade}
            </span>

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
                コースST
                <b>${p.cst}</b>
              </div>

              <div class="metric">
                今節ST
                <b>${p.season}</b>
              </div>

              <div class="metric">
                F
                <b>
                  ${p.f > 0
                    ? `F${p.f}`
                    : "F0"}
                </b>
              </div>


              <div class="metric">
                モーター
                <b>${p.motor}号</b>
              </div>

              <div class="metric">
                モーター勝率
                <b>${p.motorWinRate}</b>
              </div>

              <div class="metric">
                前検
                <b>${p.pre}</b>
              </div>

              <div class="metric">
                今節得点率
                <b>${p.pointRate}</b>
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
// モーター
// ============================================================

function renderMotor() {

  const tbody =
    document.getElementById(
      "motorTable"
    );

  tbody.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

      const evaluation =
        motorEvaluation(p);


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
            ${percent(p.m2)}
          </td>

          <td>
            ${percent(p.m3)}
          </td>

          <td>
            取得待ち
          </td>

          <td>
            取得待ち
          </td>

          <td>
            ${p.pre}
          </td>

          <td class="${evaluation.className}">
            ${evaluation.text}
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// ST
// ============================================================

function renderStart() {

  const tbody =
    document.getElementById(
      "startTable"
    );

  tbody.innerHTML =
    "";


  samplePlayers.forEach(
    p => {

      const judge =
        startEvaluation(p);


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
            ${p.avgst}
          </td>

          <td>
            ${p.cst}
          </td>

          <td>
            ${p.season}
          </td>

          <td>
            ${p.est}
          </td>

          <td>
            ${
              p.stRank !== "-"
                ? `${p.stRank}位`
                : "-"
            }
          </td>

          <td>
            ${
              p.f > 0
                ? `F${p.f}`
                : "F0"
            }
          </td>

          <td>
            ${judge}
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// 直前
// ============================================================

function renderLive() {

  const tbody =
    document.getElementById(
      "liveTable"
    );

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
            -
          </td>

          <td>
            -
          </td>

          <td>
            -
          </td>

          <td>
            -
          </td>

          <td>
            -
          </td>

          <td>
            ${p.tilt}
          </td>

          <td>
            -
          </td>

        </tr>
        `
      );
    }
  );
}


// ============================================================
// モーター評価
// ============================================================

function motorEvaluation(p) {

  const rate =
    numberOrNull(
      p.m2
    );

  const wins =
    numberOrNull(
      p.motorWins
    );

  const finals =
    numberOrNull(
      p.motorFinals
    );


  if (
    rate !== null &&
    rate >= 50
  ) {

    return {
      text: "🔥 強",
      className:
        "rank-good"
    };
  }


  if (
    wins !== null &&
    wins >= 1
  ) {

    return {
      text: "◎ 優勝実績",
      className:
        "rank-good"
    };
  }


  if (
    finals !== null &&
    finals >= 1
  ) {

    return {
      text: "○ 優出あり",
      className:
        ""
    };
  }


  if (
    rate !== null &&
    rate < 30
  ) {

    return {
      text: "△",
      className:
        "rank-warn"
    };
  }


  return {
    text: "○",
    className: ""
  };
}


// ============================================================
// ST評価
// ============================================================

function startEvaluation(p) {

  if (p.f > 0) {

    return "△ F持ち";
  }


  const series =
    stNumber(
      p.season
    );

  const course =
    stNumber(
      p.cst
    );

  const average =
    stNumber(
      p.avgst
    );


  if (
    series !== null &&
    series <= 0.10
  ) {

    return "◎ 今節踏めてる";
  }


  if (
    course !== null &&
    course <= 0.13
  ) {

    return "○ コースST速い";
  }


  if (
    average !== null &&
    average >= 0.19
  ) {

    return "△ ST遅め";
  }


  return "○";
}


// ============================================================
// 気象・水面
// ============================================================

function updateWeather(race) {

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
    race.wind ||
    "取得待ち";


  items[1].textContent =
    race.windSpeed !== null &&
    race.windSpeed !== undefined

      ? `${race.windSpeed}m`

      : "取得待ち";


  items[2].textContent =
    race.wave !== null &&
    race.wave !== undefined

      ? `${race.wave}cm`

      : "取得待ち";


  items[3].textContent =
    race.airTemperature !== null &&
    race.airTemperature !== undefined

      ? `${race.airTemperature}℃`

      : "取得待ち";


  items[4].textContent =
    race.waterTemperature !== null &&
    race.waterTemperature !== undefined

      ? `${race.waterTemperature}℃`

      : "取得待ち";
}


// ============================================================
// イン信頼度
// 現段階では仮の点数を出さない
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

  const text =
    document.querySelector(
      ".confidence-wrap"
    )?.parentElement
      ?.querySelector("p");


  if (score) {

    score.textContent =
      "—";
  }


  if (bar) {

    bar.style.width =
      "0%";
  }


  if (text) {

    text.textContent =
      "1号艇の逃げ率・差され率・まくられ率取得後に自動判定します。";
  }
}


// ============================================================
// AI貼り付け用
// ============================================================

function buildAIText() {

  const race =
    currentRaceData?.race ||
    {};


  let t =
    `【${selectedVenue} ${selectedRace}R】\n`;


  if (race.title) {

    t +=
      `${race.title}\n`;
  }


  if (race.rank) {

    t +=
      `${race.rank}\n`;
  }


  if (race.deadline) {

    t +=
      `締切 ${race.deadline}\n`;
  }


  t += "\n";


  samplePlayers.forEach(
    p => {

      t +=
        `■${p.lane}号艇 ` +
        `${p.name} ${p.grade}\n`;


      t +=
        `登録番号：${p.reg}` +
        ` / 支部：${p.branch}\n`;


      t +=
        `全国勝率：${p.nat}` +
        ` / 2連率：${percent(p.nat2)}` +
        ` / 3連率：${percent(p.nat3)}\n`;


      t +=
        `当地勝率：${p.local}` +
        ` / 2連率：${percent(p.local2)}` +
        ` / 3連率：${percent(p.local3)}\n`;


      t +=
        `平均ST：${p.avgst}` +
        ` / コース別ST：${p.cst}` +
        ` / 今節ST：${p.season}` +
        ` / 展示ST：${p.est}\n`;


      t +=
        `ST順位：${
          p.stRank !== "-"
            ? `${p.stRank}位`
            : "-"
        }` +
        ` / F：${p.f}\n`;


      t +=
        `モーター：${p.motor}号機\n`;


      t +=
        `モーター勝率：${p.motorWinRate}` +
        ` / 通算2連率：${percent(p.m2)}` +
        ` / 通算3連率：${percent(p.m3)}\n`;


      t +=
        `優出：${p.motorFinals}` +
        ` / 優勝：${p.motorWins}` +
        ` / 使用数：${p.motorEntries}\n`;


      t +=
        `直近1か月2連率：取得待ち` +
        ` / 直近1か月3連率：取得待ち\n`;


      t +=
        `前検タイム：${p.pre}` +
        ` / 今節得点率：${p.pointRate}\n`;


      t += "\n";
    }
  );


  t +=
    "【直前・水面】\n";


  t +=
    `風向：${race.wind || "取得待ち"}\n`;


  t +=
    `風速：${
      race.windSpeed ??
      "取得待ち"
    }${
      race.windSpeed !== null &&
      race.windSpeed !== undefined
        ? "m"
        : ""
    }\n`;


  t +=
    `波高：${
      race.wave ??
      "取得待ち"
    }${
      race.wave !== null &&
      race.wave !== undefined
        ? "cm"
        : ""
    }\n`;


  t +=
    `気温：${
      race.airTemperature ??
      "取得待ち"
    }${
      race.airTemperature !== null &&
      race.airTemperature !== undefined
        ? "℃"
        : ""
    }\n`;


  t +=
    `水温：${
      race.waterTemperature ??
      "取得待ち"
    }${
      race.waterTemperature !== null &&
      race.waterTemperature !== undefined
        ? "℃"
        : ""
    }\n`;


  t += "\n";


  t +=
    "【未取得】\n" +
    "展示ST・展示タイム・周回展示・回り足・直線・部品交換\n" +
    "モーター直近1か月2連率・3連率";


  return t;
}


// ============================================================
// 全描画
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
// 戻る
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
// コピー
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

    } catch (e) {

      const ta =
        document.getElementById(
          "aiText"
        );

      ta.select();

      document.execCommand(
        "copy"
      );

      window.getSelection()
        ?.removeAllRanges();
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
// タブ
// ============================================================

document.querySelectorAll(
  ".tab"
).forEach(
  btn => {

    btn.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".tab"
          )
          .forEach(
            x =>
              x.classList.remove(
                "active"
              )
          );


        document
          .querySelectorAll(
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
        ).classList.add(
          "active"
        );
      }
    );
  }
);


// ============================================================
// UTIL
// ============================================================

function value(v) {

  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {

    return "-";
  }

  return v;
}


function percent(v) {

  if (
    v === null ||
    v === undefined ||
    v === "-" ||
    v === ""
  ) {

    return "-";
  }

  return `${v}%`;
}


function numberOrNull(v) {

  if (
    v === null ||
    v === undefined ||
    v === "-" ||
    v === ""
  ) {

    return null;
  }


  const n =
    Number(v);


  return Number.isNaN(n)
    ? null
    : n;
}


function stNumber(v) {

  if (
    !v ||
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


function escapeHtml(str) {

  return String(str)
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
