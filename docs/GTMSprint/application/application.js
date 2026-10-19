import {
  STEADY_STAGE,
  emailError,
  linkedinError,
  websiteError,
  deckLinkError,
  deckFileError,
  normalizeWebAddress,
  emailDomain,
  websiteHost,
  emailDomainReachable,
  websiteHostReachable,
} from "./validate.js?v=20261019form4";

const cfg = window.FORM_CONFIG || {};
const form = document.getElementById("apply-form");
const blocks = form.querySelectorAll(".block");
const errorEl = document.getElementById("form-error");
const done = document.getElementById("done");
const revealed = {};
let pending = false;

function currentRole() {
  const selected = form.querySelector('input[name="role"]:checked');
  return selected ? selected.value : "";
}

function showError(errorId, message) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !message;
}

function markField(input, show) {
  if (!input) return;
  if (show) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function updateRevenueField() {
  const stage = document.getElementById("f-stage");
  const field = document.getElementById("revenue-field");
  const on = Boolean(stage && !stage.disabled && stage.value === STEADY_STAGE);
  field.hidden = !on;
  field.querySelectorAll("input").forEach((el) => {
    el.disabled = !on;
    el.required = on;
    if (!on) el.setCustomValidity("");
  });
  const group = document.getElementById("revenue-group");
  group.setAttribute("aria-required", on ? "true" : "false");
  if (!on) {
    showError("revenue-error", "");
    field.classList.remove("field--invalid");
    group.removeAttribute("aria-invalid");
  }
}

function showRole(role) {
  blocks.forEach((block) => {
    const on = (block.getAttribute("data-for") || "").split(" ").includes(role);
    block.hidden = !on;
    block.querySelectorAll("input, select, textarea").forEach((el) => {
      el.disabled = !on;
    });
  });
  const linkedin = document.getElementById("f-linkedin");
  if (linkedin) linkedin.required = role !== "founder";
  updateRevenueField();
  syncEmail(false);
  syncLinkedin(false);
  syncWebsite(false);
  syncDeck(false);
  syncRevenueError(false);
}

function syncText(input, errorId, key, message, revealNow) {
  if (!input || input.disabled) {
    if (input) input.setCustomValidity("");
    showError(errorId, "");
    markField(input, false);
    return;
  }
  input.setCustomValidity(message);
  if (message && revealNow) revealed[key] = true;
  const show = Boolean(message) && (revealNow || revealed[key]);
  showError(errorId, show ? message : "");
  markField(input, show);
}

function syncEmail(revealNow) {
  const input = document.getElementById("f-email");
  const message = !input || input.disabled ? "" : emailError(input.value);
  syncText(input, "f-email-error", "email", message, revealNow);
}

function syncLinkedin(revealNow) {
  const input = document.getElementById("f-linkedin");
  const message = !input || input.disabled ? "" : linkedinError(input.value, input.required);
  syncText(input, "f-linkedin-error", "linkedin", message, revealNow);
}

function syncWebsite(revealNow) {
  const input = document.getElementById("f-site");
  const message = !input || input.disabled ? "" : websiteError(input.value, input.required);
  syncText(input, "f-site-error", "website", message, revealNow);
}

function syncDeck(revealNow) {
  const link = document.getElementById("f-deck");
  const file = document.getElementById("f-deck-file");
  const field = document.getElementById("deck-field");
  const linkMessage = !link || link.disabled ? "" : deckLinkError(link.value);
  const fileMessage = !file || file.disabled ? "" : deckFileError(file.files && file.files[0]);
  if (link) link.setCustomValidity(link && link.disabled ? "" : linkMessage);
  if (file) file.setCustomValidity(file && file.disabled ? "" : fileMessage);
  const message = [linkMessage, fileMessage].filter(Boolean).join(" ");
  if (message && revealNow) revealed.deck = true;
  const show = Boolean(message) && (revealNow || revealed.deck);
  showError("f-deck-error", show ? message : "");
  markField(link, show && Boolean(linkMessage));
  markField(file, show && Boolean(fileMessage));
  if (field) field.classList.toggle("field--invalid", show);
}

function revenueMessage() {
  const stage = document.getElementById("f-stage");
  if (!stage || stage.disabled || stage.value !== STEADY_STAGE) return "";
  const picked = form.querySelector('input[name="monthly_revenue"]:checked');
  return picked ? "" : "Pick a revenue range.";
}

function syncRevenueError(revealNow) {
  const message = revenueMessage();
  const field = document.getElementById("revenue-field");
  const group = document.getElementById("revenue-group");
  field.querySelectorAll("input").forEach((radio) => {
    if (!radio.disabled) radio.setCustomValidity(message);
  });
  if (message && revealNow) revealed.revenue = true;
  const show = Boolean(message) && (revealNow || revealed.revenue);
  showError("revenue-error", show ? message : "");
  field.classList.toggle("field--invalid", show);
  if (show) group.setAttribute("aria-invalid", "true");
  else group.removeAttribute("aria-invalid");
}

function syncAll(revealNow) {
  syncEmail(revealNow);
  syncLinkedin(revealNow);
  syncWebsite(revealNow);
  syncDeck(revealNow);
  syncRevenueError(revealNow);
}

function updateDeckFile() {
  const input = document.getElementById("f-deck-file");
  const nameEl = document.getElementById("deck-file-name");
  const clearBtn = document.getElementById("deck-file-clear");
  const file = input.files && input.files[0];
  if (file && file.size) {
    nameEl.textContent = file.name;
    nameEl.classList.add("file__name--set");
    clearBtn.hidden = false;
  } else {
    nameEl.textContent = "PDF, PowerPoint, or Keynote · 10 MB max";
    nameEl.classList.remove("file__name--set");
    clearBtn.hidden = true;
  }
}

function selectedDeckFile() {
  const input = document.getElementById("f-deck-file");
  const file = input && !input.disabled && input.files && input.files[0];
  if (!file || !file.size) return null;
  return file;
}

function focusInvalid() {
  const bad = form.querySelector(":invalid");
  if (!bad) return;
  bad.focus();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  bad.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
}

function dnsQuery(name, type, signal) {
  return fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { Accept: "application/dns-json" },
    signal,
  })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
}

function withDns(name, types) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  return Promise.all(types.map((type) => dnsQuery(name, type, controller.signal))).finally(() => clearTimeout(timer));
}

function reachabilityIssues() {
  const jobs = [];
  const email = document.getElementById("f-email");
  const site = document.getElementById("f-site");
  const deck = document.getElementById("f-deck");

  if (email && !email.disabled) {
    const domain = emailDomain(email.value);
    if (domain) {
      jobs.push(
        withDns(domain, ["MX", "A", "AAAA"]).then(([mx, a, aaaa]) => ({
          input: email,
          errorId: "f-email-error",
          key: "email",
          message:
            emailDomainReachable(mx, a, aaaa) === false
              ? "That email domain doesn't look reachable. Check for a typo."
              : "",
        })),
      );
    }
  }

  if (site && !site.disabled) {
    const host = websiteHost(site.value);
    if (host) {
      jobs.push(
        withDns(host, ["A", "AAAA"]).then(([a, aaaa]) => ({
          input: site,
          errorId: "f-site-error",
          key: "website",
          message:
            websiteHostReachable(a, aaaa) === false
              ? "That website doesn't look reachable. Check the address."
              : "",
        })),
      );
    }
  }

  if (deck && !deck.disabled && deck.value.trim()) {
    const host = websiteHost(deck.value);
    if (host) {
      jobs.push(
        withDns(host, ["A", "AAAA"]).then(([a, aaaa]) => ({
          input: deck,
          errorId: "f-deck-error",
          key: "deck",
          message:
            websiteHostReachable(a, aaaa) === false
              ? "That deck link doesn't look reachable. Check the address."
              : "",
        })),
      );
    }
  }

  if (!jobs.length) return Promise.resolve([]);
  return Promise.all(jobs);
}

function applyReachability(issues) {
  const bad = issues.filter((issue) => issue.message);
  bad.forEach((issue) => {
    revealed[issue.key] = true;
    issue.input.setCustomValidity(issue.message);
    showError(issue.errorId, issue.message);
    markField(issue.input, true);
    const field = issue.input.closest(".field");
    if (field) field.classList.add("field--invalid");
  });
  return bad;
}

function formPayload(file) {
  const role = currentRole();
  const data = { role: role === "gtm" ? "Mentor" : "Founder" };
  new FormData(form).forEach((value, key) => {
    if (key === "role" || key === "attachment") return;
    if (typeof value !== "string") return;
    let next = value;
    if ((key === "website" || key === "linkedin" || key === "deck") && value.trim()) {
      next = normalizeWebAddress(value);
    }
    if (key === "email") next = value.trim();
    data[key] = data[key] ? `${data[key]}; ${next}` : next;
  });
  if (file) data.deck_file = file.name;
  data._subject = `GTM Sprint application: ${data.role} - ${data.name || ""}`;
  data._template = "table";
  data._captcha = "false";
  return data;
}

function postApplication(data, file) {
  // Text-only applications stay JSON, the path already in production.
  // A deck file goes to the same FormSubmit endpoint as multipart FormData
  // (field name "attachment", 10 MB combined limit). No extra storage or env.
  if (file) {
    const body = new FormData();
    Object.keys(data).forEach((key) => body.append(key, data[key]));
    body.append("attachment", file, file.name);
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    });
  }
  return fetch(cfg.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
}

function showDone(role, note) {
  form.hidden = true;
  done.hidden = false;
  done.querySelectorAll("[data-done]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-done") !== role;
  });
  const noteEl = document.getElementById("done-note");
  if (note) {
    noteEl.textContent = note;
    noteEl.hidden = false;
  }
  done.focus();
  window.scrollTo({ top: 0 });
}

function sendApplication() {
  const role = currentRole();
  const file = selectedDeckFile();
  const data = formPayload(file);
  const btn = form.querySelector(".form__submit");
  btn.disabled = true;
  btn.textContent = "Sending...";
  return postApplication(data, file)
    .then((response) => {
      if (!response.ok) throw new Error("bad status");
      showDone(role);
    })
    .catch(() => {
      showDone(role, "Your answers didn't send. Email them to kateryna@momentummill.com.");
    });
}

function releaseSubmit() {
  pending = false;
  const btn = form.querySelector(".form__submit");
  btn.disabled = false;
  btn.textContent = "Submit application";
}

form.addEventListener("change", (event) => {
  if (event.target.name === "role") {
    showRole(event.target.value);
    if (history.replaceState) history.replaceState(null, "", `?as=${event.target.value}`);
  }
  if (event.target.id === "f-stage") {
    updateRevenueField();
    syncRevenueError(false);
  }
  if (event.target.name === "monthly_revenue") syncRevenueError(true);
  if (event.target.id === "f-deck-file") {
    updateDeckFile();
    syncDeck(true);
  }
});

["f-email", "f-linkedin", "f-site", "f-deck"].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => {
    if (id === "f-email") syncEmail(true);
    if (id === "f-linkedin") syncLinkedin(true);
    if (id === "f-site") syncWebsite(true);
    if (id === "f-deck") syncDeck(true);
  });
  input.addEventListener("input", () => {
    if (id === "f-email") syncEmail(false);
    if (id === "f-linkedin") syncLinkedin(false);
    if (id === "f-site") syncWebsite(false);
    if (id === "f-deck") syncDeck(false);
  });
});

document.getElementById("deck-file-clear").addEventListener("click", () => {
  const input = document.getElementById("f-deck-file");
  input.value = "";
  updateDeckFile();
  syncDeck(false);
});

const preset = new URLSearchParams(location.search).get("as");
if (preset === "founder" || preset === "gtm") {
  const radio = form.querySelector(`input[name="role"][value="${preset}"]`);
  if (radio) radio.checked = true;
}
showRole(currentRole());
window.addEventListener("pageshow", () => {
  updateRevenueField();
  syncRevenueError(false);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (pending) return;
  errorEl.hidden = true;
  const role = currentRole();
  if (!role) {
    errorEl.textContent = "Pick Founder or Mentor first.";
    errorEl.hidden = false;
    return;
  }

  updateRevenueField();
  syncAll(true);
  if (!form.checkValidity()) {
    form.classList.add("form--checked");
    errorEl.textContent = "Please fix the highlighted fields.";
    errorEl.hidden = false;
    focusInvalid();
    return;
  }

  pending = true;
  const btn = form.querySelector(".form__submit");
  btn.disabled = true;
  btn.textContent = "Checking...";
  reachabilityIssues()
    .then((issues) => {
      const bad = applyReachability(issues);
      if (bad.length || !form.checkValidity()) {
        form.classList.add("form--checked");
        errorEl.textContent = "Please fix the highlighted fields.";
        errorEl.hidden = false;
        releaseSubmit();
        focusInvalid();
        return;
      }
      return sendApplication();
    })
    .catch(() => {
      releaseSubmit();
      errorEl.textContent = "Please fix the highlighted fields.";
      errorEl.hidden = false;
    });
});
