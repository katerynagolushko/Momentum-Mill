const shots = Array.from(document.querySelectorAll("[data-gallery]"));
const lightbox = document.getElementById("lightbox");
const img = lightbox.querySelector(".lightbox__img");
const count = lightbox.querySelector(".lightbox__count");

const items = shots.map((shot) => {
  const photo = shot.querySelector("img");
  return {
    src: photo.currentSrc || photo.src,
    alt: photo.alt || "",
  };
});

let index = 0;

function show(i) {
  index = (i + items.length) % items.length;
  img.src = items[index].src;
  img.alt = items[index].alt;
  count.textContent = `${index + 1} / ${items.length}`;
}

function open(i) {
  show(i);
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector("[data-lightbox-close]").focus();
}

function close() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  img.removeAttribute("src");
}

shots.forEach((shot) => {
  shot.addEventListener("click", () => {
    open(Number(shot.dataset.gallery));
  });
});

lightbox.querySelector("[data-lightbox-close]").addEventListener("click", close);
lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => {
  show(index - 1);
});
lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => {
  show(index + 1);
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) close();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") close();
  if (event.key === "ArrowLeft") show(index - 1);
  if (event.key === "ArrowRight") show(index + 1);
});

let touchX = null;
lightbox.addEventListener(
  "touchstart",
  (event) => {
    touchX = event.changedTouches[0].screenX;
  },
  { passive: true }
);
lightbox.addEventListener(
  "touchend",
  (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].screenX - touchX;
    touchX = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) show(index - 1);
    else show(index + 1);
  },
  { passive: true }
);
