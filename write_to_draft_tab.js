(() => {
  const STORAGE_KEY = "bbExposureData";
  const ROW_SELECTOR = "div.styles__playerCell__t9GOA.styles__playerCell__SkGOd";
  const NAME_SELECTOR = ".styles__playerName__L3OEW";
  const TEAM_SELECTOR = ".styles__matchText__gJBgS";
  const RIGHT_SELECTOR = ".styles__rightSide__XSMnd";
  const CONTAINER_SELECTOR = ".ReactVirtualized__Grid__innerScrollContainer";
  const HEADER_SELECTOR = ".styles__playerListSortButtons__ZoyU5";
  const HEADER_BUTTON_CLASS = "styles__statButton__ZOhMP";
  const HEADER_LABEL_CLASS = "styles__label__DVl7Z";
  const HEADER_INJECTED_CLASS = "bbexposure-header";
  const STAT_CELL_CLASS = "styles__statCell__ksLs6";
  const STAT_VALUE_CLASS = "styles__statValue__W8Bi0";
  const INJECTED_CLASS = "bbexposure-cell";
  const OBSERVER_KEY = "__bbExposureObserver";
  const INTERVAL_KEY = "__bbExposureInterval";
  const TIMEOUT_KEY = "__bbExposureTimeout";

  const payload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (!payload) {
    console.warn("No saved exposure data found in localStorage.");
    return;
  }

  if (window[OBSERVER_KEY]) {
    window[OBSERVER_KEY].disconnect();
  }

  if (window[INTERVAL_KEY]) {
    clearInterval(window[INTERVAL_KEY]);
  }

  if (window[TIMEOUT_KEY]) {
    clearTimeout(window[TIMEOUT_KEY]);
  }

  function getRows() {
    return Array.from(document.querySelectorAll(ROW_SELECTOR));
  }

  function ensureHeader() {
    const headerRow = document.querySelector(HEADER_SELECTOR);
    headerRow.querySelector(`.${HEADER_INJECTED_CLASS}`)?.remove();

    const headerButton = document.createElement("button");
    headerButton.className = `${HEADER_BUTTON_CLASS} ${HEADER_INJECTED_CLASS}`;
    headerButton.disabled = true;
    headerButton.style.display = "flex";
    headerButton.style.justifyContent = "center";
    headerButton.style.position = "relative";
    headerButton.style.left = "-22px";


    const label = document.createElement("span");
    label.className = HEADER_LABEL_CLASS;
    label.textContent = "Exposure";
    label.style.textAlign = "center";
    label.style.width = "100%";

    headerButton.appendChild(label);
    headerRow.insertBefore(headerButton, headerRow.firstElementChild);
  }


  function applyExposure() {
    const rows = getRows();

    ensureHeader();

    rows.forEach(row => {
      const rightSide = row.querySelector(RIGHT_SELECTOR);
      const name = row.querySelector(NAME_SELECTOR)?.innerText?.trim() || "";
      const team = row.querySelector(TEAM_SELECTOR)?.innerText?.trim() || "";

      if (!rightSide || !name) return;

      // Remove our previous injected value so reruns stay clean.
      const existing = rightSide.querySelector(`.${INJECTED_CLASS}`);
      if (existing) existing.remove();

      // Prefer the more specific name+team match, then fall back to name only.
      const player =
        payload.byNameTeam?.[`${name}|${team}`] ||
        payload.byName?.[name] ||
        null;

      // Build a new stat cell that matches the existing right-side stats.
      const cell = document.createElement("div");
      cell.className = `${STAT_CELL_CLASS} ${INJECTED_CLASS}`;

      const value = document.createElement("p");
      value.className = STAT_VALUE_CLASS;
      value.textContent = player?.exposure || "--";

      cell.appendChild(value);
      rightSide.insertBefore(cell, rightSide.firstElementChild);
    });
  }

  function scheduleApply() {
    if (window[TIMEOUT_KEY]) {
      clearTimeout(window[TIMEOUT_KEY]);
    }

    // Debounce rapid DOM updates from scrolling and React rerenders.
    window[TIMEOUT_KEY] = setTimeout(() => {
      applyExposure();
    }, 25);
  }

  // Watch the virtualized list container so we can reapply on rerender.
  const container = document.querySelector(CONTAINER_SELECTOR);

  applyExposure();

  if (!container) {
    console.warn("Could not find a shared player-list container.");
    return;
  }

  const observer = new MutationObserver(() => {
    scheduleApply();
  });

  // Watch only the player list container so we ignore unrelated page changes.
  observer.observe(container, {
    childList: true,
    subtree: true
  });

  window[OBSERVER_KEY] = observer;
  window[INTERVAL_KEY] = setInterval(applyExposure, 1500);

  console.log("Exposure watcher started.");
})();
