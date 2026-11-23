(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 800px)").matches;
  var hero = document.querySelector(mobile ? ".hero__media.is-tall" : ".hero__media.is-wide");
  if (hero) {
    var next = hero.getAttribute("data-src");
    if (next && hero.getAttribute("src") !== next) {
      if (!mobile) hero.setAttribute("preload", "auto");
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
  document.querySelectorAll("video.slot").forEach(function (video) {
    if (reduce) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    video.muted = true;
    var play = video.play();
    if (play && typeof play.catch === "function") play.catch(function () {});
  });
})();

(function () {
  function bind(dialog, closeSelector, onOpen) {
    if (!dialog) return;
    var video = dialog.querySelector("video");
    var closer = dialog.querySelector(closeSelector);
    function shut() {
      if (video) {
        video.pause();
      }
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else dialog.removeAttribute("open");
    }
    if (closer) closer.addEventListener("click", shut);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) shut();
    });
    dialog.addEventListener("close", function () {
      if (video) video.pause();
    });
    return { video: video, shut: shut };
  }

  var reel = document.getElementById("reel-dialog");
  bind(reel, "[data-reel-close]");
  document.querySelectorAll("[data-reel-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!reel) return;
      var video = reel.querySelector("video");
      if (typeof reel.showModal === "function") reel.showModal();
      else reel.setAttribute("open", "");
      if (video) {
        video.muted = true;
        video.currentTime = 0;
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      }
    });
  });

  var clip = document.getElementById("clip-dialog");
  bind(clip, "[data-clip-close]");
})();

(function () {
  var dialog = document.querySelector(".drawer");
  if (!dialog) return;
  var slot = dialog.querySelector(".drawer__body");
  var closer = dialog.querySelector(".drawer__x");
  var last = null;

  function text(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function fill(button) {
    var name = button.getAttribute("data-name") || "";
    var facts = (button.getAttribute("data-facts") || "").split("|").filter(Boolean);
    var win = button.getAttribute("data-win") || "";
    var logo = button.getAttribute("data-logo") || "";
    var face = button.getAttribute("data-face") === "serif" ? " is-serif" : "";
    var items = facts.map(function (fact) { return "<li>" + text(fact) + "</li>"; }).join("");
    slot.innerHTML =
      '<div class="drawer__main">' +
        '<div class="drawer__id">' +
          (logo ? '<img class="drawer__logo" alt="" src="' + text(logo) + '">' : "") +
          '<h2 id="drawer-title" class="' + face.trim() + '">' + text(name) + "</h2>" +
        "</div>" +
        '<p class="drawer__chip">' + text(button.getAttribute("data-market")) + "</p>" +
        '<p class="drawer__sprint">' + text(button.getAttribute("data-sprint")) + "</p>" +
        (win ? '<p class="drawer__win">' + text(win) + "</p>" : "") +
        '<ul class="drawer__facts">' + items + "</ul>" +
        '<p class="drawer__desc">' + text(button.getAttribute("data-desc")) + "</p>" +
      "</div>" +
      '<a class="btn drawer__go" href="' + text(button.getAttribute("data-url")) + '" target="_blank" rel="noopener noreferrer">Visit website ↗</a>';
  }

  document.querySelectorAll(".company").forEach(function (button) {
    button.addEventListener("click", function () {
      last = button;
      fill(button);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      closer.focus();
    });
  });

  closer.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    slot.innerHTML = "";
    if (last) last.focus();
  });
})();
