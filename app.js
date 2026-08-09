// ============================================================
// BOAT RACE AI COPY - SIMPLE
// ============================================================

const WORKER_BASE =
  "https://boat-race-api.k09082207390.workers.dev";

const API_URL =
  `${WORKER_BASE}/api`;

const PLACE_NAMES = {
  1: "桐生",
  2: "戸田",
  3: "江戸川",
  4: "平和島",
  5: "多摩川",
  6: "浜名湖",
  7: "蒲郡",
  8: "常滑",
  9: "津",
  10: "三国",
  11: "びわこ",
  12: "住之江",
  13: "尼崎",
  14: "鳴門",
  15: "丸亀",
  16: "児島",
  17: "宮島",
  18: "徳山",
  19: "下関",
  20: "若松",
  21: "芦屋",
  22: "福岡",
  23: "唐津",
  24: "大村"
};

const PAGE_LABELS = [
  ["basic", "基本情報"],
  ["course", "枠別勝率"],
  ["motor", "モータ情報"],
  ["series", "今節成績"],
  ["before", "直前情報"]
];

let currentAiText = "";

document.addEventListener(
  "DOMContentLoaded",
  init
);

function init() {

  const dateInput =
    document.getElementById(
      "dateInput"
    );

  dateInput.value =
    toDateInputValue(
      new Date()
    );


  const placeSelect =
    document.getElementById(
      "placeSelect"
    );

  placeSelect.innerHTML =
    Object.entries(
      PLACE_NAMES
    )
      .map(
        ([no, name]) =>
          `<option value="${no}">${name}</option>`
      )
      .join(
        ""
      );


  placeSelect.value =
    "18";


  const raceSelect =
    document.getElementById(
      "raceSelect"
    );

  raceSelect.innerHTML =
    Array.from(
      {
        length:
          12
      },
      (_, index) => {

        const raceNo =
          index + 1;


        return `<option value="${raceNo}">${raceNo}R</option>`;
      }
    )
      .join(
        ""
      );


  raceSelect.value =
    "12";


  document
    .getElementById(
      "fetchBtn"
    )
    .addEventListener(
      "click",
      fetchAiPack
    );


  document
    .getElementById(
      "copyBtn"
    )
    .addEventListener(
      "click",
      copyAiText
    );


  renderStatus(
    {}
  );
}

async function fetchAiPack() {

  const date =
    document.getElementById(
      "dateInput"
    ).value
      .replaceAll(
        "-",
        ""
      );

  const placeNo =
    Number(
      document.getElementById(
        "placeSelect"
      ).value
    );

  const raceNo =
    Number(
      document.getElementById(
        "raceSelect"
      ).value
    );


  const fetchBtn =
    document.getElementById(
      "fetchBtn"
    );

  const copyBtn =
    document.getElementById(
      "copyBtn"
    );


  fetchBtn.disabled =
    true;

  copyBtn.disabled =
    true;

  currentAiText =
    "";

  setBadge(
    "取得中",
    "loading"
  );

  setText(
    "messageText",
    "5ページを並列取得しています..."
  );

  setText(
    "elapsedText",
    "取得時間 計測中"
  );

  setText(
    "copyState",
    "未コピー"
  );

  document.getElementById(
    "preview"
  ).value =
    "";


  renderStatus(
    Object.fromEntries(
      PAGE_LABELS.map(
        ([key]) => [
          key,
          {
            state:
              "loading"
          }
        ]
      )
    )
  );


  const startedAt =
    performance.now();


  try {

    const url =
      `${API_URL}` +
      `?hiduke=${date}` +
      `&place_no=${placeNo}` +
      `&race_no=${raceNo}` +
      `&mode=ai-pack-simple`;


    const response =
      await fetch(
        url,
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


    const elapsed =
      (
        performance.now()
        -
        startedAt
      )
      /
      1000;


    currentAiText =
      data.aiText
      ||
      "";


    document.getElementById(
      "preview"
    ).value =
      currentAiText;


    const statusMap =
      {};


    for (
      const page of data.pages
      ||
      []
    ) {

      statusMap[
        page.key
      ] = {

        state:
          page.available
            ? "ok"
            : "error",

        detail:
          page.available
            ? "取得OK"
            : (
                page.error
                ||
                "取得失敗"
              )
      };
    }


    renderStatus(
      statusMap
    );


    setText(
      "elapsedText",
      `取得時間 ${elapsed.toFixed(1)}秒`
    );


    if (
      data.successCount === 5
    ) {

      setBadge(
        "5/5 取得成功",
        "ok"
      );

      setText(
        "messageText",
        "AI用データの準備完了"
      );

    } else {

      setBadge(
        `${data.successCount}/5`,
        "partial"
      );

      setText(
        "messageText",
        "一部ページの取得に失敗しました"
      );
    }


    copyBtn.disabled =
      !currentAiText;

  } catch (
    error
  ) {

    console.error(
      error
    );


    const elapsed =
      (
        performance.now()
        -
        startedAt
      )
      /
      1000;


    setBadge(
      "取得失敗",
      "error"
    );

    setText(
      "elapsedText",
      `取得時間 ${elapsed.toFixed(1)}秒`
    );

    setText(
      "messageText",
      String(
        error
      )
    );

  } finally {

    fetchBtn.disabled =
      false;
  }
}

async function copyAiText() {

  if (
    !currentAiText
  ) {

    return;
  }


  try {

    await navigator.clipboard.writeText(
      currentAiText
    );


    setText(
      "copyState",
      "コピーしました"
    );


    showToast();

  } catch (
    error
  ) {

    console.error(
      error
    );


    setText(
      "copyState",
      "コピー失敗"
    );
  }
}

function renderStatus(
  statusMap
) {

  const grid =
    document.getElementById(
      "statusGrid"
    );


  grid.innerHTML =
    PAGE_LABELS
      .map(
        (
          [
            key,
            label
          ]
        ) => {

          const item =
            statusMap[
              key
            ]
            ||
            {};


          const state =
            item.state
            ||
            "idle";


          const stateLabel = {
            idle:
              "未取得",
            loading:
              "取得中...",
            ok:
              "✓ 取得OK",
            error:
              "× 取得失敗"
          }[
            state
          ];


          return `
            <div class="status-card ${state}">
              <div class="name">${label}</div>
              <div class="state">${stateLabel}</div>
            </div>
          `;
        }
      )
      .join(
        ""
      );
}

function setBadge(
  text,
  className
) {

  const badge =
    document.getElementById(
      "summaryBadge"
    );


  badge.textContent =
    text;

  badge.className =
    `badge ${className}`;
}

function setText(
  id,
  text
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.textContent =
      text;
  }
}

function showToast() {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.classList.add(
    "show"
  );


  window.setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );
    },
    1500
  );
}

function toDateInputValue(
  date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth()
      +
      1
    )
      .padStart(
        2,
        "0"
      );

  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return `${year}-${month}-${day}`;
}
