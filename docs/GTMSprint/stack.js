/* Cards stack on scroll: each section sticks, the one underneath scales
   down and dims, and the next one slides over it. Phones use a lighter
   version. Reduced motion leaves the page in normal flow. */
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
  if (sections.length < 2) return;

  var root = document.documentElement;
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var phone = window.matchMedia("(max-width: 768px)");
  var nav = document.querySelector(".nav");
  var layoutQueued = false;
  var scrollQueued = false;
  var running = false;

  function clamp01(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  function navHeight() {
    return nav ? nav.offsetHeight : 0;
  }

  function clearInline() {
    sections.forEach(function (section) {
      section.style.top = "";
      section.style.removeProperty("--stack-top");
      section.style.removeProperty("--stack-i");
      section.style.removeProperty("--stack-p");
      section.style.removeProperty("--arrive");
    });
  }

  function measure() {
    if (!running) return;
    var vh = window.innerHeight;
    var navH = navHeight();
    var cover = vh - navH;
    sections.forEach(function (section, i) {
      section.style.setProperty("--stack-i", String(i + 1));
      var height = section.offsetHeight;
      var top;
      if (section.classList.contains("hero")) {
        top = height > vh ? vh - height : 0;
      } else if (height <= cover + 1) {
        top = navH;
      } else {
        top = vh - height;
      }
      section.style.setProperty("--stack-top", top + "px");
    });
    paint();
  }

  function paint() {
    if (!running) return;
    var vh = window.innerHeight;
    var navH = navHeight();
    var travel = vh - navH;
    if (travel < 1) travel = 1;

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var top = section.getBoundingClientRect().top;
      var arrive = i === 0 ? 0 : clamp01((vh - top) / travel);
      var covered = 0;
      if (i < sections.length - 1) {
        var nextTop = sections[i + 1].getBoundingClientRect().top;
        covered = clamp01((vh - nextTop) / travel);
      }
      section.style.setProperty("--arrive", arrive.toFixed(4));
      section.style.setProperty("--stack-p", covered.toFixed(4));
    }
  }

  function requestMeasure() {
    if (!running || layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(function () {
      layoutQueued = false;
      measure();
    });
  }

  function requestPaint() {
    if (!running || scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      paint();
    });
  }

  function start() {
    if (motion.matches) {
      stop();
      return;
    }
    if (running) {
      requestMeasure();
      return;
    }
    running = true;
    root.classList.add("is-stacking");
    measure();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestMeasure);
  }

  function stop() {
    running = false;
    root.classList.remove("is-stacking");
    window.removeEventListener("scroll", requestPaint);
    window.removeEventListener("resize", requestMeasure);
    clearInline();
  }

  function onMotion() {
    if (motion.matches) stop();
    else start();
  }

  function onPhone() {
    requestMeasure();
  }

  if (typeof motion.addEventListener === "function") {
    motion.addEventListener("change", onMotion);
    phone.addEventListener("change", onPhone);
  } else if (typeof motion.addListener === "function") {
    motion.addListener(onMotion);
    phone.addListener(onPhone);
  }

  if (typeof ResizeObserver === "function") {
    var observer = new ResizeObserver(function () {
      requestMeasure();
    });
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  window.addEventListener("load", requestMeasure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestMeasure);
  }

  start();
})();
