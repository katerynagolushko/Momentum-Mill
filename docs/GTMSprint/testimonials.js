/* Testimonials. Each slide is a photo. The carousel does not advance on its own. */
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
      portrait: "/public/photos/demoday-winners.jpg",
      alt: "Min Thant Kyaw and his LuminoCare co-founder with the winner cheque",
      video: "",
      poster: ""
    },
    {
      // Hidden until his quote is ready. The photo stays at /public/testimonials/sam-coyne.jpg.
      show: false,
      placeholder: true,
      quote: "",
      name: "Sam Coyne",
      role: "Founder at CounterLabs",
      credit: "GTM Sprint 2026 winner (Emerging Ventures)",
      linkedin: "https://www.linkedin.com/in/sam-coyne-8870541a6",
      portrait: "/public/testimonials/sam-coyne.jpg",
      alt: "Sam Coyne presenting CounterLabs at GTM Sprint",
      video: "",
      poster: ""
    },
    {
      show: true,
      quote:
        "As a sponsor, GTM Sprint delivered real value for Needle. More than 20 founders used our product during the week, and around 10 of them landed meetings with their ICP. It's rare to see a programme where founders utilized tools so well and so fast.",
      name: "Onur Eken",
      role: "Founder at Needle",
      credit: "Sponsor",
      linkedin: "https://www.linkedin.com/in/oeken",
      portrait: "/public/testimonials/onur-eken.jpg",
      alt: "Onur Eken presenting Needle at GTM Sprint",
      video: "",
      poster: ""
    },
    {
      show: true,
      quote:
        "I haven't seen teams make so much progress in such a short period of time. In one week founders went from cold outreach to real customer conversations, pilots and pre-orders. Most startups take months to get there, if they ever do.",
      name: "Sarwech Shar",
      role: "AI and Growth at VEED",
      credit: "Mentor and Judge",
      linkedin: "https://www.linkedin.com/in/sarwech",
      portrait: "/public/testimonials/sarwech-shar.jpg",
      alt: "Sarwech Shar",
      video: "",
      poster: ""
    },
    {
      show: true,
      quote:
        "GTM Sprint pushed us to stop polishing and start talking to users. In one week we got 30 new signups with 70% weekly retention, and learned more about who our product is for than in the months before.",
      name: "Raveena M.",
      role: "Founder at Inkless",
      credit: "GTM Sprint Finalist",
      linkedin: "https://www.linkedin.com/in/raveena-m-19a272342",
      portrait: "/public/testimonials/inkless-founder.jpg",
      alt: "Raveena M. speaking at GTM Sprint",
      video: "",
      poster: ""
    },
    {
      show: true,
      quote:
        "I've talked to 300+ founders, and in early-stage investing you never know whether a founder can do the hardest job: selling. At GTM Sprint I watched teams do outreach, get creative when their first approach didn't work, and turn conversations into contracts in one week. This is a game changer for early-stage investing.",
      name: "Leonardo Zussner",
      role: "Scout at EWOR",
      credit: "Partner",
      linkedin: "https://www.linkedin.com/in/leonardozussner/",
      portrait: "/public/testimonials/leonardo-zussner.jpg",
      alt: "Leonardo Zussner",
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
      photo.alt = quote.alt || quote.name || "";
      photo.width = 1240;
      photo.height = 1000;
      if (quote.logo) photo.className = "is-logo";
      if (quote.fit) photo.style.objectFit = quote.fit;
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

  var phoneQuery = window.matchMedia("(max-width: 640px)");
  function phone() { return phoneQuery.matches; }

  function videos() {
    return track.querySelectorAll("video");
  }

  function mark(active) {
    dotButtons.forEach(function (dot, i) {
      if (i === active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    var nodes = track.children;
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].hidden = false;
      if (i === active) nodes[i].removeAttribute("aria-hidden");
      else nodes[i].setAttribute("aria-hidden", "true");
    }
    videos().forEach(function (video, i) {
      if (i === active && !reduce) {
        video.muted = true;
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function scrollToSlide(i, behavior) {
    var slide = track.children[i];
    if (!slide) return;
    var left = slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
    left -= Math.max(0, (viewport.clientWidth - slide.clientWidth) / 2);
    viewport.scrollTo({ left: left, behavior: behavior || "auto" });
  }

  function go(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    if (phone()) {
      track.style.transform = "none";
      scrollToSlide(index, reduce ? "auto" : "smooth");
    } else {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
    }
    mark(index);
  }

  if ("IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (entries) {
      if (!phone()) return;
      var best = null;
      entries.forEach(function (entry) {
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      });
      if (!best || best.intersectionRatio < 0.55) return;
      var i = Array.prototype.indexOf.call(track.children, best.target);
      if (i < 0 || i === index) return;
      index = i;
      mark(index);
    }, { root: viewport, threshold: [0.55, 0.75] });
    Array.prototype.forEach.call(track.children, function (slide) { seen.observe(slide); });
  }

  phoneQuery.addEventListener("change", function () {
    if (phone()) {
      track.style.transform = "none";
      scrollToSlide(index, "auto");
    } else {
      viewport.scrollLeft = 0;
      go(index);
    }
  });

  var startX = 0;
  var dragging = false;
  viewport.addEventListener("pointerdown", function (event) {
    if (phone() || event.target.closest("a, button")) return;
    dragging = true;
    startX = event.clientX;
  });
  viewport.addEventListener("pointerup", function (event) {
    if (phone() || !dragging) return;
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
  video.muted = true;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  var play = video.play();
  if (play && play.catch) play.catch(function () {});
}
