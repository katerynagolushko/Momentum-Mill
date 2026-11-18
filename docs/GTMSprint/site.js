(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 800px)").matches;
  var hero = document.querySelector(mobile ? ".hero__media.is-tall" : ".hero__media.is-wide");
  if (hero) {
    var next = hero.getAttribute("data-src");
    if (next && hero.getAttribute("src") !== next) {
      hero.setAttribute("src", next);
      hero.load();
    }
    if (reduce) {
      hero.removeAttribute("autoplay");
      hero.pause();
    } else {
      hero.setAttribute("autoplay", "");
      var play = hero.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    }
  }
  if (!reduce) return;
  document.querySelectorAll("video.slot").forEach(function (video) {
    video.removeAttribute("autoplay");
    video.pause();
  });
})();
