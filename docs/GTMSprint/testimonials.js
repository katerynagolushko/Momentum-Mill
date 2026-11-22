/* Quotes for the homepage. Add an entry and set show: true to publish it.
   Entries with show: false stay in this file and are not rendered. */
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
      video: "/videos/min-luminocare.mp4",
      poster: "/videos/min-luminocare.jpg",
      width: 720,
      height: 980
    },
    {
      show: false,
      quote:
        "From Needle's perspective it was pretty good: 20+ people used our product, and around 10 got positive replies from leads. Thanks for hosting, well done!",
      name: "Onur Eken",
      role: "Needle",
      credit: "",
      linkedin: "",
      portrait: "",
      video: "",
      poster: ""
    }
  ];

  function addText(parent, className, text) {
    var node = document.createElement("p");
    node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function render(quote) {
    var article = document.createElement("article");
    article.className = "voice" + (quote.video ? " has-film" : "");

    if (quote.video) {
      var video = document.createElement("video");
      video.className = "slot voice__film";
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = quote.poster || "";
      video.src = quote.video;
      video.width = quote.width || 720;
      video.height = quote.height || 980;
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", quote.name + " at GTM Sprint");
      article.appendChild(video);
    }

    var panel = document.createElement("figure");
    panel.className = "voice__panel";

    var block = document.createElement("blockquote");
    block.textContent = quote.quote;
    panel.appendChild(block);

    var who = document.createElement("figcaption");
    who.className = "voice__who";

    if (quote.portrait) {
      var photo = document.createElement("img");
      photo.src = quote.portrait;
      photo.alt = "";
      photo.width = 200;
      photo.height = 200;
      who.appendChild(photo);
    }

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
    if (quote.role) addText(id, "voice__role", quote.role);
    if (quote.credit) addText(id, "voice__credit", quote.credit);
    who.appendChild(id);
    panel.appendChild(who);
    article.appendChild(panel);
    return article;
  }

  var mount = document.querySelector("[data-testimonials]");
  if (!mount) return;
  quotes.forEach(function (quote) {
    if (!quote.show) return;
    mount.appendChild(render(quote));
  });
})();
