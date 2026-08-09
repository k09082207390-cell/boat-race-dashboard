// ============================================================
// BOAT RACE DASHBOARD
// 開催一覧 → 場 → 1R〜12R → 6艇比較
// GitHub Pages frontend
// ============================================================

const WORKER_BASE =
  "https://boat-race-api.k09082207390.workers.dev";

const API_URL =
  `${WORKER_BASE}/api`;

const SCHEDULE_URL =
  `${WORKER_BASE}/schedule`;

const PLACE_NAMES = {
  1:"桐生",
  2:"戸田",
  3:"江戸川",
  4:"平和島",
  5:"多摩川",
  6:"浜名湖",
  7:"蒲郡",
  8:"常滑",
  9:"津",
  10:"三国",
  11:"びわこ",
  12:"住之江",
  13:"尼崎",
  14:"鳴門",
  15:"丸亀",
  16:"児島",
  17:"宮島",
  18:"徳山",
  19:"下関",
  20:"若松",
  21:"芦屋",
  22:"福岡",
  23:"唐津",
  24:"大村"
};


// ============================================================
// STATE
// ============================================================

let selectedDate =
  getTodayJST();

let scheduleData =
  null;

let selectedVenue =
  null;

let selectedRaceNo =
  null;

let currentRaceData =
  null;

let allOpen =
  false;


// ============================================================
// DOM
// ============================================================

const scheduleView =
  document.getElementById(
    "scheduleView"
  );

const raceListView =
  document.getElementById(
    "raceListView"
  );

const raceDetailView =
  document.getElementById(
    "raceDetailView"
  );


// ============================================================
// INIT
// ============================================================

init();


async function init() {

  bindStaticEvents();

  const params =
    new URLSearchParams(
      location.search
    );

  const queryDate =
    params.get(
      "date"
    );

  if (
    /^\d{8}$/.test(
      queryDate
      ||
      ""
    )
  ) {

    selectedDate =
      queryDate;
  }


  updateDateLabels();

  await loadSchedule();


  const placeNo =
    Number(
      params.get(
        "place_no"
      )
    );

  const raceNo =
    Number(
      params.get(
        "race_no"
      )
    );


  if (
    placeNo >= 1
    &&
    placeNo <= 24
  ) {

    const venue =
      scheduleData?.venues?.find(
        v =>
          Number(
            v.placeNo
          )
          ===
          placeNo
      )
      ||
      {
        placeNo,
        place:
          PLACE_NAMES[
            placeNo
          ],
        active:
          true
      };


    openVenue(
      venue,
      false
    );


    if (
      raceNo >= 1
      &&
      raceNo <= 12
    ) {

      await openRace(
        raceNo,
        false
      );
    }
  }
}


// ============================================================
// STATIC EVENTS
// ============================================================

function bindStaticEvents() {

  document
    .getElementById(
      "prevDateBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        selectedDate =
          addDays(
            selectedDate,
            -1
          );

        await onDateChanged();
      }
    );


  document
    .getElementById(
      "nextDateBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        selectedDate =
          addDays(
            selectedDate,
            1
          );

        await onDateChanged();
      }
    );


  document
    .getElementById(
      "todayBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        selectedDate =
          getTodayJST();

        await onDateChanged();
      }
    );


  document
    .getElementById(
      "backToScheduleBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        showSchedule();

        pushUrl({
          date:
            selectedDate
        });
      }
    );


  document
    .getElementById(
      "backToRaceListBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        showRaceList();

        pushUrl({
          date:
            selectedDate,

          place_no:
            selectedVenue?.placeNo
        });
      }
    );


  document
    .getElementById(
      "copyBtn"
    )
    ?.addEventListener(
      "click",
      copyAiText
    );


  document
    .getElementById(
      "toggleAllBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        allOpen =
          !allOpen;


        document
          .querySelectorAll(
            ".player-detail"
          )
          .forEach(
            detail =>
              detail.open =
                allOpen
          );


        setText(
          "toggleAllBtn",
          allOpen
            ? "すべて閉じる"
            : "すべて開く"
        );
      }
    );
}


// ============================================================
// DATE
// ============================================================

async function onDateChanged() {

  selectedVenue =
    null;

  selectedRaceNo =
    null;

  currentRaceData =
    null;


  updateDateLabels();

  showSchedule();

  pushUrl({
    date:
      selectedDate
  });


  await loadSchedule();
}


function updateDateLabels() {

  const display =
    formatDateSlash(
      selectedDate
    );


  setText(
    "headerDate",
    display
  );

  setText(
    "selectedDate",
    display
  );
}


// ============================================================
// SCHEDULE
// ============================================================

async function loadSchedule() {

  setText(
    "scheduleStatus",
    "開催情報を取得中..."
  );


  const venueGrid =
    document.getElementById(
      "venueGrid"
    );


  if (
    venueGrid
  ) {

    venueGrid.innerHTML =
      '<div class="loading-panel">開催情報を読み込み中...</div>';
  }


  try {

    const url =
      `${SCHEDULE_URL}?hiduke=${selectedDate}`;


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


    scheduleData =
      data;


    setText(
      "scheduleStatus",
      `開催 ${data.activeCount ?? 0}場`
    );


    renderVenueGrid(
      Array.isArray(
        data.venues
      )
        ? data.venues
        : []
    );

  } catch (
    error
  ) {

    console.error(
      "schedule error",
      error
    );


    setText(
      "scheduleStatus",
      "開催情報の取得に失敗"
    );


    if (
      venueGrid
    ) {

      venueGrid.innerHTML =
        `
          <div class="loading-panel">
            開催情報を取得できませんでした。<br>
            ${escapeHtml(
              error.message
            )}
          </div>
        `;
    }
  }
}


// ============================================================
// VENUE GRID
// ============================================================

function renderVenueGrid(
  venues
) {

  const grid =
    document.getElementById(
      "venueGrid"
    );


  if (
    !grid
  ) {

    return;
  }


  grid.innerHTML =
    "";


  const sorted =
    [...venues]
      .sort(
        (
          a,
          b
        ) =>
          Number(
            a.placeNo
          )
          -
          Number(
            b.placeNo
          )
      );


  for (
    const venue of sorted
  ) {

    const active =
      Boolean(
        venue.active
      );


    const grade =
      venue.grade
      ||
      "一般";


    const gradeClass =
      getGradeClass(
        grade
      );


    const gradeBadge =
      active
        ? `
          <span
            class="venue-badge ${gradeClass}"
          >
            ${escapeHtml(
              grade
            )}
          </span>
        `
        : "";


    const nightBadge =
      venue.night
        ? `
          <span
            class="venue-badge night"
          >
            🌙
          </span>
        `
        : "";


    const dayText =
      active
        ? (
            venue.dayLabel
            ||
            (
              venue.day
                ? `${venue.day}日目`
                : "開催中"
            )
          )
        : "非開催";


    const titleText =
      active
        ? (
            venue.title
            ||
            "開催中"
          )
        : (
            venue.nextDateLabel
              ? `次開催 ${venue.nextDateLabel}`
              : "次開催情報なし"
          );


    const progressText =
      active
        ? (
            venue.currentRaceNo
              ? `${venue.currentRaceNo}R以降`
              : ""
          )
        : "";


    const deadlineText =
      active
        ? (
            venue.deadline
            ||
            venue.firstRaceDeadline
            ||
            ""
          )
        : "";


    const buttonDisabled =
      active
        ? ""
        : "disabled";


    grid.insertAdjacentHTML(
      "beforeend",
      `
        <article
          class="venue-card ${
            active
              ? "active"
              : "inactive"
          }"
        >

          <button
            type="button"
            class="venue-card-button"
            data-place-no="${escapeHtml(
              venue.placeNo
            )}"
            ${buttonDisabled}
          >

            <div class="venue-card-head">

              <div class="venue-name">
                ${escapeHtml(
                  venue.place
                  ||
                  PLACE_NAMES[
                    venue.placeNo
                  ]
                  ||
                  ""
                )}
              </div>

              <div class="venue-badges">
                ${gradeBadge}
                ${nightBadge}
              </div>

            </div>


            <div class="venue-card-body">

              <div class="venue-day">
                ${escapeHtml(
                  dayText
                )}
              </div>


              <div class="venue-title">
                ${escapeHtml(
                  titleText
                )}
              </div>


              <div class="venue-bottom">

                <div class="venue-progress">
                  ${escapeHtml(
                    progressText
                  )}
                </div>

                <div class="venue-deadline">
                  ${escapeHtml(
                    deadlineText
                  )}
                </div>

              </div>

            </div>

          </button>

        </article>
      `
    );
  }


  grid
    .querySelectorAll(
      ".venue-card-button:not([disabled])"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const placeNo =
              Number(
                button.dataset.placeNo
              );


            const venue =
              sorted.find(
                item =>
                  Number(
                    item.placeNo
                  )
                  ===
                  placeNo
              );


            if (
              venue
            ) {

              openVenue(
                venue
              );
            }
          }
        );
      }
    );
}


// ============================================================
// OPEN VENUE
// ============================================================

function openVenue(
  venue,
  push = true
) {

  selectedVenue =
    venue;


  setText(
    "selectedVenueName",
    venue.place
    ||
    PLACE_NAMES[
      venue.placeNo
    ]
    ||
    `${venue.placeNo}場`
  );


  setText(
    "selectedVenueTitle",
    venue.title
    ||
    "開催中"
  );


  setText(
    "selectedVenueDay",
    venue.dayLabel
    ||
    (
      venue.day
        ? `${venue.day}日目`
        : "開催中"
    )
  );


  setText(
    "selectedVenuePeriod",
    venue.period
    ||
    formatDateSlash(
      selectedDate
    )
  );


  const gradeBadge =
    document.getElementById(
      "selectedVenueGrade"
    );


  if (
    gradeBadge
  ) {

    gradeBadge.textContent =
      venue.grade
      ||
      "一般";


    gradeBadge.className =
      `grade-badge ${getGradeClass(
        venue.grade
        ||
        "一般"
      )}`;
  }


  const nightBadge =
    document.getElementById(
      "selectedVenueNight"
    );


  if (
    nightBadge
  ) {

    nightBadge.classList.toggle(
      "hidden",
      !venue.night
    );
  }


  renderRaceButtons();


  showRaceList();


  if (
    push
  ) {

    pushUrl({

      date:
        selectedDate,

      place_no:
        venue.placeNo
    });
  }
}


// ============================================================
// 1R - 12R
// ============================================================

function renderRaceButtons() {

  const grid =
    document.getElementById(
      "raceButtonGrid"
    );


  if (
    !grid
  ) {

    return;
  }


  grid.innerHTML =
    "";


  for (
    let raceNo = 1;
    raceNo <= 12;
    raceNo++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "race-select-btn";


    button.innerHTML =
      `
        <strong>
          ${raceNo}R
        </strong>

        <span>
          比較を見る
        </span>
      `;


    button.addEventListener(
      "click",
      () =>
        openRace(
          raceNo
        )
    );


    grid.appendChild(
      button
    );
  }
}


// ============================================================
// OPEN RACE
// ============================================================

async function openRace(
  raceNo,
  push = true
) {

  if (
    !selectedVenue
  ) {

    return;
  }


  selectedRaceNo =
    raceNo;


  showRaceDetail();


  const place =
    selectedVenue.place
    ||
    PLACE_NAMES[
      selectedVenue.placeNo
    ]
    ||
    "";


  setText(
    "raceTitle",
    `${place} ${raceNo}R`
  );


  setText(
    "raceSubtitle",
    "BOAT RACE公式・実データ"
  );


  setText(
    "fetchStatus",
    "データ取得中..."
  );


  setText(
    "cacheStatus",
    ""
  );


  setRaceGradeBadge(
    selectedVenue.grade
  );


  clearRaceDetail();


  if (
    push
  ) {

    pushUrl({

      date:
        selectedDate,

      place_no:
        selectedVenue.placeNo,

      race_no:
        raceNo
    });
  }


  try {

    const url =
      `${API_URL}` +
      `?hiduke=${selectedDate}` +
      `&place_no=${selectedVenue.placeNo}` +
      `&race_no=${raceNo}`;


    const response =
      await fetch(
        url,
        {
          cache:
            "no-store"
        }
      );


    const cacheState =
      response.headers.get(
        "x-boat-cache"
      )
      ||
      "";


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


    const players =
      Array.isArray(
        data.players
      )
        ? data.players
        : [];


    setText(
      "raceTitle",
      `${
        data.race?.place
        ||
        place
      } ${
        data.race?.raceNo
        ||
        raceNo
      }R`
    );


    setText(
      "fetchStatus",
      `取得成功：${players.length}艇${
        data.before?.available
          ? "・直前情報あり"
          : "・直前情報未公開"
      }`
    );


    setText(
      "cacheStatus",
      cacheState
        ? `Cache ${cacheState}`
        : ""
    );


    renderQuickSummary(
      players
    );

    renderCompareTable(
      players
    );

    renderPlayerDetails(
      players
    );

    renderWeather(
      data.race?.weather
      ||
      {}
    );

    renderSources(
      data
    );

    renderAiText(
      data
    );

  } catch (
    error
  ) {

    console.error(
      "race error",
      error
    );


    setText(
      "fetchStatus",
      `取得失敗：${error.message}`
    );


    const wrap =
      document.getElementById(
        "compareTableWrap"
      );


    if (
      wrap
    ) {

      wrap.innerHTML =
        `
          <div class="loading-panel">
            ${escapeHtml(
              error.message
            )}
          </div>
        `;
    }
  }
}


// ============================================================
// QUICK SUMMARY
// ============================================================

function renderQuickSummary(
  players
) {

  const p1 =
    players.find(
      p =>
        Number(
          p.lane
        )
        === 1
    );


  const p2 =
    players.find(
      p =>
        Number(
          p.lane
        )
        === 2
    );


  const escapeRate =
    toNumber(
      p1?.courseStats?.escapeRate
    );


  const allowEscapeRate =
    toNumber(
      p2?.courseStats?.allowEscapeRate
    );


  setText(
    "inMark",
    ratingMark(
      escapeRate
    )
  );


  setText(
    "inText",
    p1
      ? `${p1.name} 逃げ率 ${percent(
          p1.courseStats?.escapeRate
        )}`
      : "データなし"
  );


  setText(
    "wallMark",
    ratingMark(
      allowEscapeRate
    )
  );


  setText(
    "wallText",
    p2
      ? `${p2.name} 逃がし率 ${percent(
          p2.courseStats?.allowEscapeRate
        )}`
      : "データなし"
  );


  const attackers =
    players
      .filter(
        p =>
          Number(
            p.lane
          )
          >= 3
      )
      .map(
        p => {

          const course =
            p.courseStats
            ||
            {};


          const firstRate =
            toNumber(
              course.firstRate
            )
            ||
            0;


          const makuri =
            toNumber(
              course.winningMethod?.makuriRate
            )
            ||
            0;


          const makuriSashi =
            toNumber(
              course.winningMethod?.makuriSashiRate
            )
            ||
            0;


          return {

            player:
              p,

            score:
              Math.max(
                firstRate,
                makuri + makuriSashi
              )
          };
        }
      )
      .sort(
        (
          a,
          b
        ) =>
          b.score -
          a.score
      );


  const top =
    attackers[
      0
    ];


  setText(
    "attackMark",
    top
      ? `${top.player.lane}号艇`
      : "―"
  );


  setText(
    "attackText",
    top
      ? `${
          top.player.name
        } / 1着 ${
          percent(
            top.player.courseStats?.firstRate
          )
        } / まくり ${
          percent(
            top.player.courseStats?.winningMethod?.makuriRate
          )
        }`
      : "データなし"
  );
}


// ============================================================
// COMPARE TABLE
// ============================================================

function renderCompareTable(
  players
) {

  const wrap =
    document.getElementById(
      "compareTableWrap"
    );


  if (
    !wrap
  ) {

    return;
  }


  const hasExhibition =
    players.some(
      p =>
        p.before?.available
        &&
        (
          p.before?.exhibitionTime !== null
          ||
          p.before?.startST !== null
          ||
          p.before?.startCourse !== null
        )
    );


  const rows = [

    {
      label:
        "級別",

      value:
        p =>
          value(
            p.class
          )
    },

    {
      label:
        "全国勝率",

      value:
        p =>
          value(
            p.national?.winRate
          )
    },

    {
      label:
        "当地勝率",

      value:
        p =>
          value(
            p.local?.winRate
          )
    },

    {
      label:
        "今節得点率",

      value:
        p =>
          value(
            p.series?.pointRate
          )
    },

    {
      label:
        "今節平均ST",

      type:
        "seriesST",

      value:
        p =>
          formatST(
            p.series?.averageST
          )
    },

    {
      label:
        "コース1着率",

      type:
        "courseFirst",

      value:
        p =>
          `${
            percent(
              p.courseStats?.firstRate
            )
          } (${
            value(
              p.courseStats?.entryCount
            )
          }走)`
    },

    {
      label:
        "逃げ / 逃がし",

      type:
        "escape",

      value:
        p =>
          Number(
            p.lane
          )
          === 1
            ? `逃 ${
                percent(
                  p.courseStats?.escapeRate
                )
              }`
            : `逃が ${
                percent(
                  p.courseStats?.allowEscapeRate
                )
              }`
    },

    {
      label:
        "コース平均ST",

      type:
        "courseST",

      value:
        p =>
          formatST(
            p.courseStats?.averageST
          )
    },

    {
      label:
        "差し率",

      value:
        p =>
          percent(
            p.courseStats?.winningMethod?.sashiRate
          )
    },

    {
      label:
        "まくり率",

      value:
        p =>
          percent(
            p.courseStats?.winningMethod?.makuriRate
          )
    },

    {
      label:
        "まくり差し率",

      value:
        p =>
          percent(
            p.courseStats?.winningMethod?.makuriSashiRate
          )
    },

    {
      label:
        "モーター2連率",

      type:
        "motor",

      value:
        p =>
          percent(
            p.motor?.secondRate
          )
    },

    {
      label:
        "直近1か月2連",

      type:
        "recentMotor",

      value:
        p =>
          percent(
            p.motor?.recent1Month?.secondRate
          )
    },

    {
      label:
        "機力トレンド",

      type:
        "trend",

      value:
        p =>
          motorTrendText(
            p
          )
    }
  ];


  if (
    hasExhibition
  ) {

    const insertIndex =
      rows.findIndex(
        row =>
          row.label ===
          "コース1着率"
      );


    const exhibitionRows = [

      {
        label:
          "展示タイム",

        type:
          "exhibitionTime",

        value:
          p =>
            formatExhibitionTime(
              p.before?.exhibitionTime
            )
      },

      {
        label:
          "展示ST",

        type:
          "exhibitionST",

        value:
          p =>
            formatST(
              p.before?.startST
            )
      },

      {
        label:
          "展示進入",

        value:
          p =>
            p.before?.startCourse
            !== null
            &&
            p.before?.startCourse
            !== undefined
              ? `${p.before.startCourse}C`
              : "―"
      }
    ];


    rows.splice(
      insertIndex,
      0,
      ...exhibitionRows
    );
  }


  let html =
    `
      <table>

        <thead>

          <tr>

            <th>
              比較項目
            </th>
    `;


  for (
    const player of players
  ) {

    html +=
      `
        <th>

          <div class="compare-name">
            ${escapeHtml(
              player.lane
            )}
            ${escapeHtml(
              player.name
            )}
          </div>

          <div class="compare-reg">
            ${escapeHtml(
              player.number
            )}
          </div>

        </th>
      `;
  }


  html +=
    `
          </tr>

        </thead>

        <tbody>
    `;


  for (
    const row of rows
  ) {

    html +=
      `
        <tr>

          <td>
            ${escapeHtml(
              row.label
            )}
          </td>
      `;


    for (
      const player of players
    ) {

      html +=
        `
          <td
            class="${compareCellClass(
              player,
              row.type
            )}"
          >
            ${escapeHtml(
              row.value(
                player
              )
            )}
          </td>
        `;
    }


    html +=
      `
        </tr>
      `;
  }


  html +=
    `
        </tbody>

      </table>
    `;


  wrap.innerHTML =
    html;
}


function compareCellClass(
  player,
  type
) {

  if (
    type === "seriesST"
  ) {

    return stClass(
      player.series?.averageST
    );
  }


  if (
    type === "courseST"
  ) {

    return stClass(
      player.courseStats?.averageST
    );
  }


  if (
    type === "exhibitionST"
  ) {

    return stClass(
      player.before?.startST
    );
  }


  if (
    type === "exhibitionTime"
  ) {

    return "";
  }


  if (
    type === "courseFirst"
  ) {

    return highClass(
      player.courseStats?.firstRate
    );
  }


  if (
    type === "motor"
  ) {

    return highClass(
      player.motor?.secondRate
    );
  }


  if (
    type === "recentMotor"
  ) {

    return highClass(
      player.motor?.recent1Month?.secondRate
    );
  }


  if (
    type === "escape"
  ) {

    const rate =
      Number(
        player.lane
      )
      === 1
        ? toNumber(
            player.courseStats?.escapeRate
          )
        : toNumber(
            player.courseStats?.allowEscapeRate
          );


    if (
      rate === null
    ) {

      return "";
    }


    if (
      rate >= 65
    ) {

      return "good";
    }


    if (
      rate < 40
    ) {

      return "bad";
    }


    return "warn";
  }


  if (
    type === "trend"
  ) {

    const trend =
      motorTrend(
        player
      );


    if (
      trend === null
    ) {

      return "";
    }


    if (
      trend >= 8
    ) {

      return "good";
    }


    if (
      trend <= -8
    ) {

      return "bad";
    }
  }


  return "";
}


// ============================================================
// PLAYER DETAILS
// ============================================================

function renderPlayerDetails(
  players
) {

  const wrap =
    document.getElementById(
      "playerDetails"
    );


  if (
    !wrap
  ) {

    return;
  }


  wrap.innerHTML =
    players
      .map(
        player => {

          const course =
            player.courseStats
            ||
            {};


          const recentMotor =
            player.motor?.recent1Month
            ||
            {};


          const races =
            Array.isArray(
              player.series?.races
            )
              ? player.series.races
              : [];


          const racesHtml =
            races
              .map(
                race =>
                  `${
                    escapeHtml(
                      race.day
                    )
                  }日 ${
                    escapeHtml(
                      race.raceNo
                    )
                  }R ${
                    escapeHtml(
                      race.course
                    )
                  }C ST${
                    escapeHtml(
                      race.st
                    )
                  } ${
                    escapeHtml(
                      resultText(
                        race.result
                      )
                    )
                  }`
              )
              .join(
                "<br>"
              )
              ||
              "―";


          const isOne =
            Number(
              player.lane
            )
            === 1;


          const exhibitionMetrics =
            player.before?.available
            &&
            (
              player.before?.exhibitionTime !== null
              ||
              player.before?.startST !== null
              ||
              player.before?.startCourse !== null
            )
              ? [
                  metric(
                    "展示タイム",
                    formatExhibitionTime(
                      player.before?.exhibitionTime
                    )
                  ),

                  metric(
                    "展示ST",
                    formatST(
                      player.before?.startST
                    )
                  ),

                  metric(
                    "展示進入",
                    player.before?.startCourse !== null
                    &&
                    player.before?.startCourse !== undefined
                      ? `${player.before.startCourse}C`
                      : "―"
                  )
                ].join(
                  ""
                )
              : "";


          return `
            <details class="player-detail">

              <summary>

                <span
                  class="lane-circle"
                  style="${laneStyle(
                    Number(
                      player.lane
                    )
                  )}"
                >
                  ${escapeHtml(
                    player.lane
                  )}
                </span>

                <span>

                  <span class="player-summary-name">
                    ${escapeHtml(
                      player.class
                      ||
                      ""
                    )}
                    ${escapeHtml(
                      player.name
                    )}
                  </span>

                  <span class="player-summary-sub">
                    登録 ${escapeHtml(
                      player.number
                    )}
                    /
                    ${escapeHtml(
                      player.branch
                      ||
                      ""
                    )}
                  </span>

                </span>

              </summary>


              <div class="detail-body">

                <div class="metrics">

                  ${metric(
                    "全国",
                    value(
                      player.national?.winRate
                    )
                  )}

                  ${metric(
                    "当地",
                    value(
                      player.local?.winRate
                    )
                  )}

                  ${metric(
                    "平均ST",
                    value(
                      player.start?.average
                    )
                  )}

                  ${metric(
                    "今節ST",
                    value(
                      player.series?.averageST
                    )
                  )}

                  ${metric(
                    "F/L",
                    `F${
                      value(
                        player.start?.flying
                      )
                    }/L${
                      value(
                        player.start?.late
                      )
                    }`
                  )}

                  ${metric(
                    "ST評価",
                    stEvaluation(
                      player
                    )
                  )}

                  ${exhibitionMetrics}

                  ${metric(
                    "モーター",
                    `${
                      value(
                        player.motor?.number
                      )
                    }号`
                  )}

                  ${metric(
                    "通算2連",
                    percent(
                      player.motor?.secondRate
                    )
                  )}

                  ${metric(
                    "直近1か月2連",
                    percent(
                      recentMotor.secondRate
                    )
                  )}

                  ${metric(
                    "機力トレンド",
                    motorTrendText(
                      player
                    )
                  )}

                  ${metric(
                    "コース1着",
                    `${
                      percent(
                        course.firstRate
                      )
                    } / ${
                      value(
                        course.entryCount
                      )
                    }走`
                  )}

                  ${metric(
                    isOne
                      ? "逃げ率"
                      : "逃がし率",

                    isOne
                      ? percent(
                          course.escapeRate
                        )
                      : percent(
                          course.allowEscapeRate
                        )
                  )}

                  ${metric(
                    "差し率",
                    percent(
                      course.winningMethod?.sashiRate
                    )
                  )}

                  ${metric(
                    "まくり率",
                    percent(
                      course.winningMethod?.makuriRate
                    )
                  )}

                  ${metric(
                    "得点率",
                    value(
                      player.series?.pointRate
                    )
                  )}

                  ${metric(
                    "順位",
                    `${
                      value(
                        player.series?.pointRank
                      )
                    }位`
                  )}

                </div>


                <div class="series">

                  <b>
                    今節成績
                  </b>

                  <br>

                  ${racesHtml}

                </div>


                <div class="comment">

                  <b>
                    選手コメント
                  </b>

                  <br>

                  ${escapeHtml(
                    player.comment?.text
                    ||
                    "コメントなし"
                  )}

                </div>

              </div>

            </details>
          `;
        }
      )
      .join(
        ""
      );
}


// ============================================================
// WEATHER
// ============================================================

function renderWeather(
  weather
) {

  const grid =
    document.getElementById(
      "weatherGrid"
    );


  if (
    !grid
  ) {

    return;
  }


  const rows = [

    [
      "風向",
      value(
        weather.windDirection
      )
    ],

    [
      "風速",
      unit(
        weather.windSpeed,
        "m"
      )
    ],

    [
      "波高",
      unit(
        weather.wave,
        "cm"
      )
    ],

    [
      "気温",
      unit(
        weather.airTemperature,
        "℃"
      )
    ],

    [
      "水温",
      unit(
        weather.waterTemperature,
        "℃"
      )
    ]
  ];


  grid.innerHTML =
    rows
      .map(
        (
          [
            key,
            val
          ]
        ) =>
          `
            <div>

              <dt>
                ${escapeHtml(
                  key
                )}
              </dt>

              <dd>
                ${escapeHtml(
                  val
                )}
              </dd>

            </div>
          `
      )
      .join(
        ""
      );
}


// ============================================================
// SOURCES
// ============================================================

function renderSources(
  data
) {

  const grid =
    document.getElementById(
      "sourceGrid"
    );


  if (
    !grid
  ) {

    return;
  }


  const rows = [

    [
      "BOAT RACE公式",
      data.meta?.raceSourceStatus
      === 200
        ? "OK"
        : "確認"
    ],

    [
      "選手コメント",
      `${value(
        data.comments?.count
      )}艇`
    ],

    [
      "直近モーター",
      `${value(
        data.recentMotors?.count
      )}艇`
    ],

    [
      "コース別",
      `${value(
        data.courseStats?.count
      )}艇`
    ]
  ];


  grid.innerHTML =
    rows
      .map(
        (
          [
            key,
            val
          ]
        ) =>
          `
            <div>

              <dt>
                ${escapeHtml(
                  key
                )}
              </dt>

              <dd>
                ${escapeHtml(
                  val
                )}
              </dd>

            </div>
          `
      )
      .join(
        ""
      );
}


// ============================================================
// AI TEXT
// ============================================================

function renderAiText(
  data
) {

  const textarea =
    document.getElementById(
      "aiText"
    );


  if (
    !textarea
  ) {

    return;
  }


  const players =
    data.players
    ||
    [];


  const lines = [

    `${data.race?.place || ""} ${data.race?.raceNo || ""}R`
  ];


  for (
    const player of players
  ) {

    const course =
      player.courseStats
      ||
      {};


    lines.push(
      [
        `${player.lane} ${player.name}`,

        `級 ${player.class || ""}`,

        `全国 ${value(
          player.national?.winRate
        )}`,

        `今節ST ${value(
          player.series?.averageST
        )}`,

        `得点率 ${value(
          player.series?.pointRate
        )}`,

        `コース1着 ${percent(
          course.firstRate
        )}(${value(
          course.entryCount
        )}走)`,

        Number(
          player.lane
        )
        === 1
          ? `逃げ ${percent(
              course.escapeRate
            )}`
          : `逃がし ${percent(
              course.allowEscapeRate
            )}`,

        `差し ${percent(
          course.winningMethod?.sashiRate
        )}`,

        `まくり ${percent(
          course.winningMethod?.makuriRate
        )}`,

        `M2連 ${percent(
          player.motor?.secondRate
        )}`,

        `直近M2連 ${percent(
          player.motor?.recent1Month?.secondRate
        )}`,

        `トレンド ${motorTrendText(
          player
        )}`,

        ...(
          player.before?.available
          &&
          (
            player.before?.exhibitionTime !== null
            ||
            player.before?.startST !== null
          )
            ? [
                `展示 ${formatExhibitionTime(
                  player.before?.exhibitionTime
                )}`,
                `展示ST ${formatST(
                  player.before?.startST
                )}`
              ]
            : []
        ),

        `コメント ${
          player.comment?.text
          ||
          ""
        }`
      ].join(
        " / "
      )
    );
  }


  textarea.value =
    lines.join(
      "\n"
    );
}


// ============================================================
// COPY
// ============================================================

async function copyAiText() {

  const textarea =
    document.getElementById(
      "aiText"
    );


  const text =
    textarea?.value
    ||
    "";


  if (
    !text
  ) {

    return;
  }


  try {

    await navigator.clipboard.writeText(
      text
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


// ============================================================
// VIEW HELPERS
// ============================================================

function showSchedule() {

  scheduleView?.classList.remove(
    "hidden"
  );

  raceListView?.classList.add(
    "hidden"
  );

  raceDetailView?.classList.add(
    "hidden"
  );
}


function showRaceList() {

  scheduleView?.classList.add(
    "hidden"
  );

  raceListView?.classList.remove(
    "hidden"
  );

  raceDetailView?.classList.add(
    "hidden"
  );
}


function showRaceDetail() {

  scheduleView?.classList.add(
    "hidden"
  );

  raceListView?.classList.add(
    "hidden"
  );

  raceDetailView?.classList.remove(
    "hidden"
  );
}


// ============================================================
// CLEAR DETAIL
// ============================================================

function clearRaceDetail() {

  currentRaceData =
    null;


  setText(
    "inMark",
    "―"
  );

  setText(
    "inText",
    "取得待ち"
  );

  setText(
    "wallMark",
    "―"
  );

  setText(
    "wallText",
    "取得待ち"
  );

  setText(
    "attackMark",
    "―"
  );

  setText(
    "attackText",
    "取得待ち"
  );


  const compare =
    document.getElementById(
      "compareTableWrap"
    );


  if (
    compare
  ) {

    compare.innerHTML =
      '<div class="loading-panel">データ読み込み中...</div>';
  }


  const playerDetails =
    document.getElementById(
      "playerDetails"
    );


  if (
    playerDetails
  ) {

    playerDetails.innerHTML =
      "";
  }


  const weather =
    document.getElementById(
      "weatherGrid"
    );


  if (
    weather
  ) {

    weather.innerHTML =
      "";
  }


  const sources =
    document.getElementById(
      "sourceGrid"
    );


  if (
    sources
  ) {

    sources.innerHTML =
      "";
  }


  const ai =
    document.getElementById(
      "aiText"
    );


  if (
    ai
  ) {

    ai.value =
      "";
  }


  setText(
    "copyState",
    "未コピー"
  );
}


// ============================================================
// URL
// ============================================================

function pushUrl(
  params
) {

  const url =
    new URL(
      location.href
    );


  url.search =
    "";


  for (
    const [
      key,
      val
    ] of Object.entries(
      params
    )
  ) {

    if (
      val !== null
      &&
      val !== undefined
      &&
      val !== ""
    ) {

      url.searchParams.set(
        key,
        val
      );
    }
  }


  history.pushState(
    null,
    "",
    url
  );
}


// ============================================================
// FORMAT / CALC
// ============================================================

function getTodayJST() {

  const parts =
    new Intl.DateTimeFormat(
      "ja-JP",
      {
        timeZone:
          "Asia/Tokyo",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit"
      }
    )
      .formatToParts(
        new Date()
      );


  const get =
    type =>
      parts.find(
        part =>
          part.type
          ===
          type
      )?.value
      ||
      "";


  return `${
    get(
      "year"
    )
  }${
    get(
      "month"
    )
  }${
    get(
      "day"
    )
  }`;
}


function addDays(
  yyyymmdd,
  days
) {

  const year =
    Number(
      yyyymmdd.slice(
        0,
        4
      )
    );


  const month =
    Number(
      yyyymmdd.slice(
        4,
        6
      )
    );


  const day =
    Number(
      yyyymmdd.slice(
        6,
        8
      )
    );


  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  date.setUTCDate(
    date.getUTCDate()
    +
    days
  );


  return `${
    date.getUTCFullYear()
  }${
    String(
      date.getUTCMonth()
      +
      1
    ).padStart(
      2,
      "0"
    )
  }${
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    )
  }`;
}


function formatDateSlash(
  yyyymmdd
) {

  const text =
    String(
      yyyymmdd
      ||
      ""
    );


  if (
    text.length !== 8
  ) {

    return "----/--/--";
  }


  return `${
    text.slice(
      0,
      4
    )
  }/${
    text.slice(
      4,
      6
    )
  }/${
    text.slice(
      6,
      8
    )
  }`;
}


function getGradeClass(
  grade
) {

  const value =
    String(
      grade
      ||
      ""
    )
      .toLowerCase();


  if (
    value === "sg"
  ) {

    return "grade-sg";
  }


  if (
    value === "pg1"
  ) {

    return "grade-pg1";
  }


  if (
    value === "g1"
  ) {

    return "grade-g1";
  }


  if (
    value === "g2"
  ) {

    return "grade-g2";
  }


  if (
    value === "g3"
  ) {

    return "grade-g3";
  }


  return "";
}


function setRaceGradeBadge(
  grade
) {

  const badge =
    document.getElementById(
      "raceGradeBadge"
    );


  if (
    !badge
  ) {

    return;
  }


  if (
    !grade
  ) {

    badge.classList.add(
      "hidden"
    );

    return;
  }


  badge.textContent =
    grade;


  badge.className =
    `grade-badge ${getGradeClass(
      grade
    )}`;
}


function ratingMark(
  rate
) {

  if (
    rate === null
  ) {

    return "―";
  }


  if (
    rate >= 65
  ) {

    return "◎";
  }


  if (
    rate >= 50
  ) {

    return "○";
  }


  if (
    rate >= 40
  ) {

    return "△";
  }


  return "×";
}


function stEvaluation(
  player
) {

  if (
    toNumber(
      player.start?.flying
    )
    >
    0
  ) {

    return "△ F持ち";
  }


  const average =
    toNumber(
      player.series?.averageST
    );


  if (
    average !== null
    &&
    average <= .11
  ) {

    return "🔥 踏めてる";
  }


  if (
    average !== null
    &&
    average <= .14
  ) {

    return "◎ 今節良";
  }


  if (
    average !== null
    &&
    average >= .18
  ) {

    return "△ 遅め";
  }


  return "○";
}


function stClass(
  st
) {

  const n =
    toNumber(
      st
    );


  if (
    n === null
  ) {

    return "";
  }


  if (
    n <= .12
  ) {

    return "good";
  }


  if (
    n >= .18
  ) {

    return "warn";
  }


  return "";
}


function highClass(
  value
) {

  const n =
    toNumber(
      value
    );


  if (
    n === null
  ) {

    return "";
  }


  if (
    n >= 50
  ) {

    return "good";
  }


  if (
    n <= 20
  ) {

    return "bad";
  }


  return "";
}


function motorTrend(
  player
) {

  const total =
    toNumber(
      player.motor?.secondRate
    );


  const recent =
    toNumber(
      player.motor?.recent1Month?.secondRate
    );


  if (
    total === null
    ||
    recent === null
  ) {

    return null;
  }


  return Number(
    (
      recent -
      total
    ).toFixed(
      1
    )
  );
}


function motorTrendText(
  player
) {

  const trend =
    motorTrend(
      player
    );


  if (
    trend === null
  ) {

    return "―";
  }


  if (
    trend > 0
  ) {

    return `↑ +${trend}pt`;
  }


  if (
    trend < 0
  ) {

    return `↓ ${trend}pt`;
  }


  return "→ 0pt";
}


function resultText(
  result
) {

  if (
    typeof result ===
    "number"
    ||
    /^\d+$/.test(
      String(
        result
      )
    )
  ) {

    return `${result}着`;
  }


  return String(
    result
    ??
    "―"
  );
}


function metric(
  key,
  val
) {

  return `
    <div class="metric">

      <span>
        ${escapeHtml(
          key
        )}
      </span>

      <strong>
        ${escapeHtml(
          val
        )}
      </strong>

    </div>
  `;
}


function laneStyle(
  lane
) {

  return ({
    1:
      "background:#fff;color:#111",

    2:
      "background:#222;color:#fff",

    3:
      "background:#d64545;color:#fff",

    4:
      "background:#3f6fc4;color:#fff",

    5:
      "background:#e6c33c;color:#111",

    6:
      "background:#3f9b64;color:#fff"

  })[
    lane
  ]
  ||
  "";
}


function toNumber(
  val
) {

  if (
    val === null
    ||
    val === undefined
    ||
    val === ""
  ) {

    return null;
  }


  const n =
    Number(
      val
    );


  return Number.isFinite(
    n
  )
    ? n
    : null;
}


function value(
  val
) {

  return val === null
    ||
    val === undefined
    ||
    val === ""
      ? "―"
      : String(
          val
        );
}


function percent(
  val
) {

  return val === null
    ||
    val === undefined
    ||
    val === ""
      ? "―"
      : `${val}%`;
}


function unit(
  val,
  suffix
) {

  return val === null
    ||
    val === undefined
    ||
    val === ""
      ? "―"
      : `${val}${suffix}`;
}


function formatExhibitionTime(
  val
) {

  if (
    val === null
    ||
    val === undefined
    ||
    val === ""
  ) {

    return "―";
  }


  const n =
    Number(
      val
    );


  if (
    Number.isFinite(
      n
    )
  ) {

    return n.toFixed(
      2
    );
  }


  return String(
    val
  );
}


function formatST(
  val
) {

  const n =
    toNumber(
      val
    );


  if (
    n === null
  ) {

    return value(
      val
    );
  }


  return n
    .toFixed(
      3
    )
    .replace(
      /^0/,
      ""
    );
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


function escapeHtml(
  value
) {

  return String(
    value
    ??
    ""
  ).replace(
    /[&<>"']/g,
    char => ({
      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#39;"
    })[
      char
    ]
  );
}


function showToast() {

  const toast =
    document.getElementById(
      "toast"
    );


  if (
    !toast
  ) {

    return;
  }


  toast.classList.add(
    "show"
  );


  setTimeout(
    () =>
      toast.classList.remove(
        "show"
      ),
    1300
  );
}
