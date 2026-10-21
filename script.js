/* ==========================================================
   Кенесары Қасымұлы — 3D презентация (тек HTML/CSS/JS)
   ========================================================== */
(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const DURATION = 1150;
  let cur = 0;
  let busy = false;

  const $ = (s) => document.querySelector(s);
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- Dots ---------- */
  const dotsEl = $("#dots");
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("data-label", s.dataset.title || "Слайд " + (i + 1));
    b.setAttribute("aria-label", s.dataset.title || "Слайд " + (i + 1));
    b.addEventListener("click", () => go(i));
    dotsEl.appendChild(b);
  });
  $("#total").textContent = pad(total);

  function updateUI() {
    $("#cur").textContent = pad(cur + 1);
    $("#slideName").textContent = slides[cur].dataset.title || "";
    $("#progressBar").style.width = ((cur + 1) / total) * 100 + "%";
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle("active", i === cur));
    $("#prevBtn").disabled = cur === 0;
    $("#nextBtn").disabled = cur === total - 1;
    document.title = (cur + 1) + "/" + total + " — " + (slides[cur].dataset.title || "Кенесары хан");
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) {}
  }

  function go(n) {
    if (busy || n === cur || n < 0 || n >= total) return;
    busy = true;
    const dir = n > cur ? "next" : "prev";
    const from = slides[cur];
    const to = slides[n];
    from.classList.remove("active");
    from.classList.add("leaving", "out-" + dir);
    to.classList.add("active", "in-" + dir);
    cur = n;
    updateUI();
    onEnter(to);
    setTimeout(() => {
      from.classList.remove("leaving", "out-next", "out-prev");
      to.classList.remove("in-next", "in-prev");
      busy = false;
    }, DURATION);
  }
  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  $("#nextBtn").addEventListener("click", next);
  $("#prevBtn").addEventListener("click", prev);
  document.querySelectorAll("[data-go]").forEach((el) =>
    el.addEventListener("click", () => go(parseInt(el.dataset.go, 10)))
  );

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ": e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp": e.preventDefault(); prev(); break;
      case "Home": go(0); break;
      case "End": go(total - 1); break;
      case "f": case "F": toggleFs(); break;
    }
  });

  /* ---------- Wheel ---------- */
  let wheelLock = 0;
  window.addEventListener("wheel", (e) => {
    if (e.target.closest("#map, .place-list")) return;
    const sc = e.target.closest(".content");
    if (sc && sc.scrollHeight > sc.clientHeight + 4) {
      const atTop = sc.scrollTop <= 0;
      const atBottom = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2;
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }
    const now = Date.now();
    if (now < wheelLock || Math.abs(e.deltaY) < 25) return;
    wheelLock = now + DURATION + 250;
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });

  /* ---------- Touch swipe ---------- */
  let tx = 0, ty = 0, tOnMap = false;
  window.addEventListener("touchstart", (e) => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    tOnMap = !!e.target.closest("#map");
  }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (tOnMap) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? next() : prev();
  }, { passive: true });

  /* ---------- Fullscreen ---------- */
  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen && document.exitFullscreen();
  }
  $("#fsBtn").addEventListener("click", toggleFs);

  /* ---------- Parallax + tilt ---------- */
  const root = document.documentElement;
  window.addEventListener("mousemove", (e) => {
    root.style.setProperty("--mx", (e.clientX / innerWidth - 0.5).toFixed(3));
    root.style.setProperty("--my", (e.clientY / innerHeight - 0.5).toFixed(3));
  });
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 14).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 16).toFixed(2) + "deg) translateZ(10px)";
      el.style.setProperty("--px", x * 100 + "%");
      el.style.setProperty("--py", y * 100 + "%");
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* ---------- 3D year (layered extrusion) ---------- */
  document.querySelectorAll(".year3d").forEach((el) => {
    const y = el.dataset.year;
    let html = "";
    for (let i = 14; i >= 1; i--) {
      const shade = Math.round(40 + (14 - i) * 4);
      html += '<span style="transform:translateZ(-' + i * 2.2 + 'px);color:rgb(' + (shade + 40) + "," + (shade + 15) + "," + Math.round(shade / 2) + ')">' + y + "</span>";
    }
    html += '<span class="yf">' + y + "</span>";
    el.innerHTML = html;
  });

  /* ---------- Flip cards ---------- */
  document.querySelectorAll(".flip").forEach((f) => {
    f.addEventListener("click", () => f.classList.toggle("flipped"));
    f.addEventListener("keydown", (e) => { if (e.key === "Enter") f.classList.toggle("flipped"); });
  });

  /* ---------- Count-up ---------- */
  function countUp(scope) {
    scope.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const start = performance.now() + 700;
      const dur = 1800;
      el.textContent = "0";
      function step(t) {
        const p = Math.min(Math.max((t - start) / dur, 0), 1);
        const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString("ru-RU");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ==========================================================
     TIMELINE — Тарихқа саяхат
     ========================================================== */
  const timeline = [
    { y: "1837", tag: "Бастама", t: "Көтерілістің басталуы",
      x: "Кенесары Қасымұлы Көкшетау мен Ақмола өңірлерінде патша бекіністеріне, казак станицаларына шабуыл жасап, ұлт-азаттық көтерілісті бастады. Ол Батыс Сібір әкімшілігіне хат жолдап, тартып алынған жерлерді қайтаруды және бекіністер салуды тоқтатуды талап етті." },
    { y: "1838", tag: "Жеңіс", t: "Ақмола бекінісінің өртелуі",
      x: "1838 жылдың көктемінде Кенесары сарбаздары Ақмола бекінісін қоршап, өртеп жіберді. Бұл жеңіс көтерілістің беделін арттырып, оған Орта жүз бен Кіші жүздің көптеген рулары қосылды." },
    { y: "1840", tag: "Келіссөз", t: "Дипломатия мен күш жинау",
      x: "Кенесары Орынбор әкімшілігімен хат алмасып, Абылай хан заманындағы жерлерді қайтаруды, бекіністерді жоюды талап етті. Осы жылдары ол Торғай, Ырғыз өңірлеріне орнығып, әскерін нығайтты." },
    { y: "1841", tag: "Хандық", t: "Кенесары хан сайланды",
      x: "Үш жүздің өкілдері Кенесарыны ақ киізге көтеріп, бүкіл қазақтың ханы етіп сайлады. Сол жылы ол Қоқан хандығына қарсы жорық жасап, Созақ, Жаңақорған бекіністерін алды, оңтүстік қазақтарын Қоқан езгісінен босатуға ұмтылды." },
    { y: "1843", tag: "Қарсылық", t: "Жазалаушы отрядтар",
      x: "Патша үкіметі көтерілісті басу үшін әскери отрядтар жіберді. Алайда Кенесары әскері шебер маневр жасап, ашық шайқастан жалтарып, жазалаушылардың жоспарын сәтсіздікке ұшыратты." },
    { y: "1844", tag: "Шайқас", t: "Жантөрин жасағының талқандалуы",
      x: "1844 жылдың жазында Кенесары патшаны жақтаған сұлтан Ахмет Жантөриннің жасағын Ұлқаяқ өзені бойында талқандады. Бұл хан әскерінің ең ірі жеңістерінің бірі болды." },
    { y: "1845", tag: "Қоршау", t: "Бекіністер шебі",
      x: "Патша үкіметі Торғай мен Ырғыз өзендері бойында жаңа бекіністер салып, Кенесарының көшіп-қону аймағын тарылтты. Хан оңтүстікке қарай ығысуға мәжбүр болды." },
    { y: "1846", tag: "Жетісу", t: "Жетісуға көшу",
      x: "Кенесары ханның ордасы Жетісуға, Іле өзенінің бойына көшті. Ұлы жүз қазақтарының бір бөлігі оны қолдады, бірақ кейбір сұлтандар патша жағына шықты. Хан қырғыздарды бірлесіп күресуге шақырды." },
    { y: "1847", tag: "Аяқталу", t: "Ханның қаза табуы",
      x: "Қырғыз манаптарымен соғыс басталып, Тоқмақ маңындағы Кекілік-Сеңгір (Майтөбе) шайқасында Кенесары хан тұтқынға түсіп, қаза тапты. Онымен бірге Наурызбай батыр мен көптеген серіктері де шейіт болды." },
  ];
  let tlIdx = 0;
  let tlTimer = null;
  const tlNodes = $("#tlNodes");
  timeline.forEach((it, i) => {
    const b = document.createElement("button");
    b.className = "tl-node";
    b.innerHTML = "<i></i>" + it.y;
    b.addEventListener("click", () => { stopTl(); showTl(i); });
    tlNodes.appendChild(b);
  });
  function showTl(i, instant) {
    tlIdx = (i + timeline.length) % timeline.length;
    const it = timeline[tlIdx];
    const card = $("#tlCard");
    const fill = () => {
      $("#tlYear").textContent = it.y;
      $("#tlTag").textContent = it.tag;
      $("#tlTitle").textContent = it.t;
      $("#tlText").textContent = it.x;
    };
    if (instant) fill();
    else {
      card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
      setTimeout(fill, 360);
    }
    Array.from(tlNodes.children).forEach((n, k) => {
      n.classList.toggle("active", k === tlIdx);
      n.classList.toggle("done", k < tlIdx);
    });
    $("#tlFill").style.width = (tlIdx / (timeline.length - 1)) * 100 + "%";
  }
  function stopTl() { clearInterval(tlTimer); tlTimer = null; $("#tlPlay").textContent = "▶ Автоойнату"; }
  $("#tlPrev").addEventListener("click", () => { stopTl(); showTl(tlIdx - 1); });
  $("#tlNext").addEventListener("click", () => { stopTl(); showTl(tlIdx + 1); });
  $("#tlPlay").addEventListener("click", () => {
    if (tlTimer) return stopTl();
    $("#tlPlay").textContent = "❚❚ Тоқтату";
    tlTimer = setInterval(() => showTl(tlIdx + 1), 4500);
  });
  showTl(0, true);

  /* ==========================================================
     MAP — Leaflet
     ========================================================== */
  const places = [
    { id: "kokshe", n: "Көкшетау", y: "1837", ll: [53.28, 69.39],
      x: "Көтеріліс басталған өңір. Кенесары сарбаздары Көкшетау округіндегі патша бекіністері мен казак станицаларына шабуыл жасады." },
    { id: "akmola", n: "Ақмола бекінісі", y: "1838", ll: [51.17, 71.43],
      x: "1838 жылы Кенесары әскері Ақмола бекінісін қоршап, өртеп жіберді. Бұл көтерілістің ең ірі жеңістерінің бірі болды." },
    { id: "turgai", n: "Торғай өңірі", y: "1840–1845", ll: [49.63, 63.5],
      x: "Хан ордасы орналасқан негізгі өңір. Мұнда әскер жасақталып, қару-жарақ жасалды, егін егілді." },
    { id: "ulytau", n: "Ұлытау — Сарыарқа", y: "1841", ll: [48.65, 67.0],
      x: "1841 жылы үш жүздің өкілдері Кенесарыны ақ киізге көтеріп, бүкіл қазақтың ханы етіп сайлады. Ұлытау — қазақ хандарының киелі мекені." },
    { id: "sozak", n: "Созақ", y: "1841", ll: [44.13, 68.45],
      x: "Қоқан хандығының бекінісі. Кенесары әскері Созақты алып, оңтүстік қазақтарын Қоқан езгісінен босатуға тырысты." },
    { id: "zhanakorgan", n: "Жаңақорған", y: "1841", ll: [43.91, 67.25],
      x: "Сырдария бойындағы Қоқан бекінісі. Кенесары жорықтары кезінде алынды." },
    { id: "ulkayak", n: "Ұлқаяқ өзені", y: "1844", ll: [50.2, 62.6],
      x: "1844 жылы Кенесары патшаны жақтаған сұлтан Ахмет Жантөриннің жасағын осы өңірде талқандады." },
    { id: "irgiz", n: "Ырғыз", y: "1845", ll: [48.62, 61.26],
      x: "1845 жылы патша үкіметі Ырғыз бен Торғай бойында бекіністер салып, Кенесарының қонысын тарылтты." },
    { id: "ili", n: "Іле бойы — Жетісу", y: "1846", ll: [44.1, 77.3],
      x: "1846 жылы Кенесары Жетісуға көшті. Ұлы жүздің бір бөлігі оны қолдады, кейбір сұлтандар патша жағына шықты." },
    { id: "kekilik", n: "Кекілік-Сеңгір (Майтөбе)", y: "1847", ll: [42.84, 75.3], end: true,
      x: "1847 жылы Тоқмақ маңындағы шайқаста Кенесары хан қырғыз манаптарының тұтқынына түсіп, қаза тапты. Наурызбай батыр да осында шейіт болды." },
    { id: "omsk", n: "Омбы", y: "Әкімшілік", ll: [54.98, 73.37], ru: true,
      x: "Батыс Сібір генерал-губернаторлығының орталығы. Көтерілісті басуға отрядтар осы жерден жіберілді. Ханның басы осында жіберілді деген деректер бар." },
    { id: "orenburg", n: "Орынбор", y: "Әкімшілік", ll: [51.77, 55.1], ru: true,
      x: "Орынбор әкімшілігі. Кенесары мұндағы губернаторлармен хат алмасып, елшілер арқылы келіссөз жүргізді." },
  ];
  const routeIds = ["kokshe", "akmola", "turgai", "ulytau", "sozak", "zhanakorgan", "ulkayak", "irgiz", "ili", "kekilik"];
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));

  let map = null;
  const markers = {};
  let routeLine = null, ghostLine = null, rider = null, touring = false;
  const listEl = $("#placeList");
  const infoEl = $("#placeInfo");

  function setInfo(p) {
    infoEl.innerHTML = '<span class="pi-year">' + p.y + "</span><h3>" + p.n + "</h3><p>" + p.x + "</p>";
    infoEl.classList.remove("flash"); void infoEl.offsetWidth; infoEl.classList.add("flash");
    listEl.querySelectorAll(".place-btn").forEach((b) => b.classList.toggle("active", b.dataset.id === p.id));
  }

  places.forEach((p) => {
    const b = document.createElement("button");
    b.className = "place-btn" + (p.ru ? " ru" : "");
    b.dataset.id = p.id;
    b.innerHTML = "<em>" + p.y + "</em>" + p.n;
    b.addEventListener("click", () => focusPlace(p.id));
    listEl.appendChild(b);
  });

  function focusPlace(id) {
    const p = byId[id];
    setInfo(p);
    if (!map) return;
    touring = false;
    map.flyTo(p.ll, 7, { duration: 1.8 });
    setTimeout(() => markers[id] && markers[id].openPopup(), 1850);
  }

  function initMap() {
    if (typeof L === "undefined") {
      $("#map").innerHTML = '<div class="map-fallback">Карта жүктелмеді. Интернет байланысын тексеріңіз.<br>Оң жақтағы тізімнен орындарды көре аласыз.</div>';
      return;
    }
    map = L.map("map", { zoomControl: true, scrollWheelZoom: true, worldCopyJump: false, minZoom: 3, maxZoom: 11 }).setView([47.5, 67], 4);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles © Esri", maxZoom: 11,
    }).addTo(map);
    map.createPane("labels");
    map.getPane("labels").style.zIndex = 390;
    map.getPane("labels").style.pointerEvents = "none";
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      pane: "labels", maxZoom: 11, opacity: .75,
    }).addTo(map);

    // approximate territory 1841–1845
    const area = L.polygon([
      [53.6, 66.2], [52.6, 71.6], [50.2, 73.4], [47.4, 71.6], [45.2, 69.4], [43.6, 67.4], [45.0, 64.0], [47.2, 60.6], [50.0, 59.8], [52.2, 62.4],
    ], { color: "#d9b25a", weight: 2, dashArray: "8 8", fillColor: "#d9b25a", fillOpacity: 0.12 }).addTo(map);
    area.bindTooltip("Кенесары хандығының шамамен аумағы (1841–1845)", { permanent: false, direction: "center", className: "area-label" });

    // ghost route
    ghostLine = L.polyline(routeIds.map((id) => byId[id].ll), { color: "#f6e2a2", weight: 2, opacity: 0.35, dashArray: "2 8" }).addTo(map);

    places.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: '<div class="mk' + (p.ru ? " ru" : "") + (p.end ? " end" : "") + '"><i></i><b>' + p.n + "</b></div>",
        iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12],
      });
      const m = L.marker(p.ll, { icon }).addTo(map);
      m.bindPopup('<span class="py">' + p.y + "</span><h4>" + p.n + "</h4>" + p.x, { maxWidth: 280 });
      m.on("click", () => setInfo(p));
      markers[p.id] = m;
    });
  }

  function overview() {
    if (!map) return;
    touring = false;
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    if (rider) { map.removeLayer(rider); rider = null; }
    map.closePopup();
    map.flyToBounds(L.latLngBounds(places.map((p) => p.ll)).pad(0.08), { duration: 1.6 });
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function animateRider(a, b, ms) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      function step(t) {
        if (!touring) return resolve();
        const p = Math.min((t - t0) / ms, 1);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const ll = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
        rider.setLatLng(ll);
        const pts = routeLine.getLatLngs();
        pts[pts.length - 1] = L.latLng(ll);
        routeLine.setLatLngs(pts);
        if (p < 1) requestAnimationFrame(step); else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function tour() {
    if (!map) return;
    if (touring) { touring = false; $("#tourBtn").textContent = "▶ Жорық жолымен саяхат"; return; }
    touring = true;
    $("#tourBtn").textContent = "❚❚ Тоқтату";
    map.closePopup();
    if (routeLine) map.removeLayer(routeLine);
    if (rider) map.removeLayer(rider);
    const first = byId[routeIds[0]];
    routeLine = L.polyline([first.ll], { color: "#d9b25a", weight: 4, opacity: 0.95, lineCap: "round" }).addTo(map);
    rider = L.marker(first.ll, { icon: L.divIcon({ className: "", html: '<div class="rider">К</div>', iconSize: [40, 40], iconAnchor: [20, 20] }), zIndexOffset: 1000 }).addTo(map);
    map.flyTo(first.ll, 6, { duration: 1.6 });
    setInfo(first);
    await wait(1700);
    if (touring) markers[first.id].openPopup();
    await wait(2200);
    for (let i = 1; i < routeIds.length && touring; i++) {
      const a = byId[routeIds[i - 1]], b = byId[routeIds[i]];
      map.closePopup();
      const mid = [(a.ll[0] + b.ll[0]) / 2, (a.ll[1] + b.ll[1]) / 2];
      map.flyTo(mid, 5, { duration: 1.4 });
      routeLine.addLatLng(a.ll);
      await animateRider(a.ll, b.ll, 2200);
      if (!touring) break;
      map.flyTo(b.ll, 6, { duration: 1 });
      setInfo(b);
      await wait(1050);
      if (!touring) break;
      markers[b.id].openPopup();
      await wait(2600);
    }
    if (touring) {
      await wait(400);
      map.closePopup();
      map.flyToBounds(routeLine.getBounds().pad(0.15), { duration: 1.8 });
    }
    touring = false;
    $("#tourBtn").textContent = "▶ Жорық жолымен саяхат";
  }

  $("#tourBtn").addEventListener("click", tour);
  $("#overviewBtn").addEventListener("click", overview);

  /* ---------- Slide enter hooks ---------- */
  function onEnter(slide) {
    if (slide.classList.contains("slide-map") && map) {
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => { map.invalidateSize(); overview(); }, DURATION + 50);
    }
    if (slide.querySelector("[data-count]")) countUp(slide);
    if (!slide.contains($("#tlCard"))) stopTl();
    if (!slide.classList.contains("slide-map")) { touring = false; $("#tourBtn").textContent = "▶ Жорық жолымен саяхат"; }
    slide.querySelectorAll(".flip.flipped").forEach((f) => f.classList.remove("flipped"));
    const c = slide.querySelector(".content"); if (c) c.scrollTop = 0;
  }

  /* ---------- Gold dust particles ---------- */
  const cv = $("#dust");
  const ctx = cv.getContext("2d");
  let W, H, parts = [];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(init) {
    return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: Math.random() * 1.8 + 0.4, vy: Math.random() * 0.35 + 0.1, vx: (Math.random() - 0.5) * 0.25, a: Math.random() * Math.PI * 2, z: Math.random() };
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    const mx = parseFloat(root.style.getPropertyValue("--mx")) || 0;
    const my = parseFloat(root.style.getPropertyValue("--my")) || 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y -= p.vy; p.x += p.vx + Math.sin(p.a) * 0.15; p.a += 0.01;
      if (p.y < -10) parts[i] = spawn(false);
      const alpha = 0.35 + Math.sin(p.a * 3) * 0.3;
      const px = p.x + mx * 40 * p.z, py = p.y + my * 40 * p.z;
      ctx.beginPath();
      ctx.fillStyle = "rgba(246,226,162," + Math.max(alpha, 0.05) + ")";
      ctx.shadowColor = "rgba(217,178,90,.9)";
      ctx.shadowBlur = 8;
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  resize();
  parts = Array.from({ length: Math.min(80, Math.round(innerWidth / 18)) }, () => spawn(true));
  window.addEventListener("resize", () => { resize(); map && map.invalidateSize(); });
  loop();

  /* ---------- Start ---------- */
  initMap();
  const fromHash = parseInt((location.hash || "").replace("#", ""), 10);
  cur = fromHash >= 1 && fromHash <= total ? fromHash - 1 : 0;
  slides[cur].classList.add("active");
  updateUI();
  onEnter(slides[cur]);
  window.addEventListener("hashchange", () => {
    const n = parseInt((location.hash || "").replace("#", ""), 10);
    if (n >= 1 && n <= total && n - 1 !== cur) go(n - 1);
  });
})();
