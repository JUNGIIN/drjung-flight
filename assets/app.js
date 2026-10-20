/* DR_Jung Flight: official tpwgts.com widget loader, 2026-10-20.
 * Reuses the existing index.html controls and calendar container.
 * No scraping, fake prices, API secrets, or periodic background polling.
 */
(() => {
  "use strict";

  const config = window.DRJUNG_FLIGHT_CONFIG || {};
  const host = document.getElementById("aviasales-calendar");
  const status = document.getElementById("widget-state");
  const buttons = Array.from(document.querySelectorAll(".destination[data-code]"));
  const oneWay = document.getElementById("one-way");
  const directOnly = document.getElementById("direct-only");
  const period = document.getElementById("period");

  if (!host || !status || !oneWay || !directOnly || !period || !buttons.length) {
    console.error("DR_Jung Flight: expected calendar elements are missing from index.html.");
    return;
  }

  function setStatus(kind, message, retry) {
    status.className = `widget-state ${kind}`;
    status.textContent = message;
    if (retry) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "destination";
      button.style.marginLeft = "12px";
      button.textContent = "다시 불러오기";
      button.addEventListener("click", loadCalendar);
      status.appendChild(button);
    }
  }

  let template;
  try {
    template = new URL(config.widgetUrl);
    if (template.protocol !== "https:" || template.hostname !== "tpwgts.com" ||
        template.port || template.username || template.password || template.pathname !== "/content") {
      throw new Error("Unexpected widget endpoint");
    }
    for (const key of ["shmarker", "trs", "origin", "destination", "promo_id", "campaign_id"]) {
      if (!template.searchParams.get(key)) throw new Error(`Missing widget parameter: ${key}`);
    }
  } catch (error) {
    setStatus("error", "config.js의 widgetUrl 설정을 확인하세요.", false);
    console.error("DR_Jung Flight: invalid widget configuration.", error);
    return;
  }

  const destinations = new Map(buttons.map(button => [button.dataset.code, button.dataset.name]));
  let destination = template.searchParams.get("destination");
  if (!destinations.has(destination)) destination = "TYO";
  oneWay.checked = template.searchParams.get("one_way") === "true";
  directOnly.checked = template.searchParams.get("only_direct") === "true";
  period.value = template.searchParams.get("period") === "month" ? "month" : "year";

  let generation = 0;
  let cleanup = () => {};

  function updateLabels() {
    const destinationName = destinations.get(destination) || destination;
    const labels = {
      "hero-destination-code": destination,
      "hero-destination-name": destinationName,
      "calendar-destination-name": destinationName
    };
    Object.entries(labels).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    buttons.forEach(button => {
      const active = button.dataset.code === destination;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function loadCalendar() {
    cleanup();
    const currentGeneration = ++generation;
    updateLabels();
    host.replaceChildren();
    host.setAttribute("aria-busy", "true");
    setStatus("loading", "Aviasales 가격달력을 불러오는 중입니다…", false);

    // Preserve all partner, project, currency, trip-length and appearance
    // parameters from the user's official code; change only UI-controlled fields.
    const url = new URL(template.href);
    url.searchParams.set("destination", destination);
    url.searchParams.set("one_way", String(oneWay.checked));
    url.searchParams.set("only_direct", String(directOnly.checked));
    url.searchParams.set("period", period.value);

    // Each request gets a separate mount. A late script from a previous
    // selection cannot append its widget into the new selection's mount.
    const mount = document.createElement("div");
    mount.dataset.calendarMount = String(currentGeneration);
    host.appendChild(mount);
    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = url.href;

    let timeout;
    let observer;
    let complete = false;
    const isCurrent = () => generation === currentGeneration;

    function finish(kind, message, retry) {
      if (!isCurrent() || complete) return;
      complete = true;
      window.clearTimeout(timeout);
      observer.disconnect();
      host.setAttribute("aria-busy", "false");
      setStatus(kind, message, retry);
    }

    function checkRenderedContainer() {
      if (!isCurrent()) return;
      // Presence is only a UI readiness signal. Cross-origin price data
      // cannot be inspected or validated here.
      const iframe = mount.querySelector("iframe");
      const hasOtherContent = Array.from(mount.children).some(element =>
        !["SCRIPT", "STYLE", "LINK", "IFRAME"].includes(element.tagName) &&
        element.getBoundingClientRect().height > 40
      );
      if ((iframe && (iframe.getAttribute("src") || iframe.hasAttribute("srcdoc"))) || hasOtherContent) {
        finish("hidden", "", false);
      }
    }

    observer = new MutationObserver(checkRenderedContainer);
    observer.observe(mount, { childList: true, subtree: true, attributes: true });
    script.onload = checkRenderedContainer;
    script.onerror = () => finish("error",
      "가격달력을 불러오지 못했습니다. 브라우저의 인터넷 연결, 광고 차단 및 Travelpayouts 프로젝트 상태를 확인하세요.", true);
    timeout = window.setTimeout(() => finish("error",
      "달력 로딩이 지연되고 있습니다. 인터넷 연결과 브라우저 차단 설정을 확인한 뒤 다시 불러오세요.", true), 25000);

    cleanup = () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      script.onload = null;
      script.onerror = null;
    };
    mount.appendChild(script);
  }

  buttons.forEach(button => {
    button.type = "button";
    button.addEventListener("click", () => {
      if (button.dataset.code === destination) return;
      destination = button.dataset.code;
      loadCalendar();
    });
  });
  [oneWay, directOnly, period].forEach(control => control.addEventListener("change", loadCalendar));
  window.addEventListener("pagehide", () => cleanup());
  loadCalendar();
})();
