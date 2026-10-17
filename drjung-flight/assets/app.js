(() => {
  const config = window.DRJUNG_FLIGHT_CONFIG || {};
  const origin = config.origin || "ICN";
  const marker = String(config.marker || "").trim();
  const widgetHost = document.getElementById("aviasales-calendar");
  const widgetState = document.getElementById("widget-state");
  const buttons = [...document.querySelectorAll(".destination")];
  const oneWay = document.getElementById("one-way");
  const directOnly = document.getElementById("direct-only");
  const period = document.getElementById("period");

  let destination = "TYO";
  let destinationName = "도쿄";

  function updateLabels() {
    document.getElementById("hero-destination-code").textContent = destination;
    document.getElementById("hero-destination-name").textContent = destinationName;
    document.getElementById("calendar-destination-name").textContent = destinationName;
  }

  function renderMissingMarker() {
    widgetHost.innerHTML = "";
    widgetState.className = "widget-state setup";
    widgetState.innerHTML = `
      <div class="setup-icon">✈</div>
      <div>
        <strong>가격달력 연결 준비가 완료되었습니다.</strong>
        <p>Travelpayouts에서 Partner ID(marker)를 발급받은 뒤 <code>config.js</code>의 <code>marker</code> 값만 입력하면 실제 Aviasales 가격달력이 표시됩니다.</p>
      </div>`;
  }

  function loadCalendar() {
    updateLabels();
    widgetHost.innerHTML = "";

    if (!marker) {
      renderMissingMarker();
      return;
    }

    widgetState.className = "widget-state loading";
    widgetState.textContent = "Aviasales 가격달력을 불러오는 중입니다…";

    const params = new URLSearchParams({
      marker,
      origin,
      destination,
      currency: config.currency || "krw",
      searchUrl: config.searchUrl || "hydra.aviasales.com",
      one_way: String(oneWay.checked),
      only_direct: String(directOnly.checked),
      locale: config.locale || "ko",
      period: period.value,
      range: "7,14",
      powered_by: "true",
      width: "800"
    });

    const script = document.createElement("script");
    script.async = true;
    script.charset = "UTF-8";
    script.src = `https://www.travelpayouts.com/calendar_widget/iframe.js?${params.toString()}`;
    script.onload = () => {
      widgetState.className = "widget-state hidden";
      widgetState.textContent = "";
    };
    script.onerror = () => {
      widgetState.className = "widget-state error";
      widgetState.innerHTML = "가격달력을 불러오지 못했습니다. 인터넷 연결, Travelpayouts Project 상태와 Partner ID를 확인하세요.";
    };
    widgetHost.appendChild(script);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      destination = button.dataset.code;
      destinationName = button.dataset.name;
      loadCalendar();
    });
  });

  [oneWay, directOnly, period].forEach((control) => control.addEventListener("change", loadCalendar));
  loadCalendar();
})();
