/* Testimonials. To publish a clip, drop the file in /videos and set `video`
   (and `poster`) on that entry. The carousel loops it muted. A click opens
   the same file with sound. The carousel does not advance on its own. */
(function () {
  var quotes = [
    {
      show: true,
      quote:
        "Through GTM Sprint we opened a deal with a home care agency with 5 sites and £2M in revenue, and they're ready to pre-purchase at £20K per site. That's £100K of pipeline in one week.",
      name: "Min Thant Kyaw",
      role: "Co-founder at LuminoCare",
      credit: "GTM Sprint 2026 winner (Existing Ventures)",
      linkedin: "https://www.linkedin.com/in/min-thant-kyaw-3075901b7/",
      portrait: "/public/testimonials/min-thant-kyaw.jpg",
      video: "",
      poster: ""
    },
    {
      show: true,
      placeholder: true,
      quote: "",
      name: "CounterLabs",
      role: "Emerging Ventures winner",
      credit: "",
      linkedin: "https://counterlabs.ai",
      portrait: "",
      video: "",
      poster: ""
    },
    {
      show: true,
      quote:
        "From Needle's perspective it was pretty good: 20+ people used our product, and around 10 got positive replies from leads. Thanks for hosting, well done!",
      name: "Onur Eken",
      role: "Needle",
      credit: "Sponsor",
      linkedin: "https://www.linkedin.com/in/oeken",
      portrait: "",
      video: "/videos/onur-eken.mp4",
      poster: "/videos/onur-eken.jpg",
      focus: "68% 42%"
    },
    {
      show: true,
      placeholder: true,
      quote: "",
      name: "Sarwech Shar",
      role: "Senior Software Engineer at VEED",
      credit: "Built and sold Nocodelytics",
      linkedin: "https://www.linkedin.com/in/sarwech",
      portrait: "/public/mentors/sarwech-shar.jpg",
      video: "",
      poster: ""
    }
  ];

  var mount = document.querySelector("[data-testimonials]");
  if (!mount) return;
  var slides = quotes.filter(function (quote) { return quote.show; });
  if (!slides.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var root = document.createElement("div");
  root.className = "carousel";
  root.setAttribute("aria-roledescription", "carousel");
  root.setAttribute("aria-label", "Testimonials");

  var viewport = document.createElement("div");
  viewport.className = "carousel__viewport";
  var track = document.createElement("div");
  track.className = "carousel__track";
  if (!reduce) track.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";

  slides.forEach(function (quote, i) {
    var slide = document.createElement("article");
    slide.className = "voice" + (quote.placeholder ? " is-placeholder" : "");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (i + 1) + " of " + slides.length);

    var media = document.createElement("div");
    media.className = "voice__media";

    if (quote.video) {
      var video = document.createElement("video");
      video.className = "voice__film";
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = quote.poster || "";
      video.src = quote.video;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("loop", "");
      if (quote.focus) video.style.objectPosition = quote.focus;
      video.setAttribute("aria-label", (quote.name || "Speaker") + " at GTM Sprint");
      media.appendChild(video);
      var open = document.createElement("button");
      open.type = "button";
      open.className = "voice__expand";
      open.textContent = "Play with sound";
      open.addEventListener("click", function () {
        openClip(quote.video, quote.poster);
      });
      media.appendChild(open);
    } else if (quote.portrait) {
      var photo = document.createElement("img");
      photo.src = quote.portrait;
      photo.alt = quote.name ? quote.name : "";
      photo.width = 800;
      photo.height = 800;
      media.appendChild(photo);
    } else {
      var hold = document.createElement("p");
      hold.className = "voice__hold";
      hold.textContent = "Clip on the way";
      media.appendChild(hold);
    }

    var panel = document.createElement("figure");
    panel.className = "voice__panel";
    var block = document.createElement("blockquote");
    block.textContent = quote.quote || "Quote on the way";
    panel.appendChild(block);

    if (quote.name) {
      var who = document.createElement("figcaption");
      who.className = "voice__who";
      var id = document.createElement("div");
      var nameEl = document.createElement(quote.linkedin ? "a" : "p");
      nameEl.className = "voice__name";
      nameEl.textContent = quote.name;
      if (quote.linkedin) {
        nameEl.href = quote.linkedin;
        nameEl.target = "_blank";
        nameEl.rel = "noopener noreferrer";
      }
      id.appendChild(nameEl);
      if (quote.role) {
        var role = document.createElement("p");
        role.className = "voice__role";
        role.textContent = quote.role;
        id.appendChild(role);
      }
      if (quote.credit) {
        var credit = document.createElement("p");
        credit.className = "voice__credit";
        credit.textContent = quote.credit;
        id.appendChild(credit);
      }
      who.appendChild(id);
      panel.appendChild(who);
    }

    slide.appendChild(media);
    slide.appendChild(panel);
    track.appendChild(slide);
  });

  viewport.appendChild(track);

  var bar = document.createElement("div");
  bar.className = "carousel__bar";
  var prev = document.createElement("button");
  prev.type = "button";
  prev.className = "carousel__arrow";
  prev.setAttribute("aria-label", "Previous testimonial");
  prev.textContent = "←";
  var next = document.createElement("button");
  next.type = "button";
  next.className = "carousel__arrow";
  next.setAttribute("aria-label", "Next testimonial");
  next.textContent = "→";
  var dots = document.createElement("div");
  dots.className = "carousel__dots";
  var dotButtons = slides.map(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
    dot.addEventListener("click", function () { go(i); });
    dots.appendChild(dot);
    return dot;
  });
  prev.addEventListener("click", function () { go(index - 1); });
  next.addEventListener("click", function () { go(index + 1); });
  bar.appendChild(prev);
  bar.appendChild(dots);
  bar.appendChild(next);

  root.appendChild(viewport);
  root.appendChild(bar);
  mount.appendChild(root);

  function videos() {
    return track.querySelectorAll("video");
  }

  function go(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    dotButtons.forEach(function (dot, i) {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    var nodes = track.children;
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].hidden = false;
      if (i === index) nodes[i].removeAttribute("aria-hidden");
      else nodes[i].setAttribute("aria-hidden", "true");
    }
    videos().forEach(function (video, i) {
      if (i === index && !reduce) {
        video.muted = true;
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  var startX = 0;
  var dragging = false;
  viewport.addEventListener("pointerdown", function (event) {
    if (event.target.closest("a, button")) return;
    dragging = true;
    startX = event.clientX;
  });
  viewport.addEventListener("pointerup", function (event) {
    if (!dragging) return;
    dragging = false;
    var delta = event.clientX - startX;
    if (delta > 48) go(index - 1);
    else if (delta < -48) go(index + 1);
  });
  viewport.addEventListener("pointercancel", function () { dragging = false; });
  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
  });

  go(0);
})();

function openClip(src, poster) {
  var dialog = document.getElementById("clip-dialog");
  var video = dialog && dialog.querySelector("video");
  if (!dialog || !video) return;
  video.poster = poster || "";
  video.src = src;
  video.muted = false;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  var play = video.play();
  if (play && play.catch) play.catch(function () {});
}
