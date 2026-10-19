const JUNK_TLDS = new Set([
  "asdf",
  "qwerty",
  "qwer",
  "test",
  "fake",
  "invalid",
  "example",
  "localhost",
  "none",
  "nope",
  "aaaa",
  "zzzz",
]);

const HARD_JUNK_LABELS = new Set(["example", "localhost", "invalid", "asdf", "qwerty"]);

const SOFT_JUNK_BRANDS = new Set(["test", "fake", "none", "nope"]);

const SOFT_JUNK_TLDS = new Set(["com", "org", "net", "test"]);

const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "throwawaymail.com",
  "fakeinbox.com",
  "mailnesia.com",
  "emailfake.com",
];

const NOREPLY_LOCALS = new Set([
  "noreply",
  "no-reply",
  "no_reply",
  "donotreply",
  "do-not-reply",
  "do_not_reply",
]);

const IDENTICAL_JUNK = new Set([
  "test",
  "fake",
  "asdf",
  "qwerty",
  "none",
  "nope",
  "nobody",
  "noemail",
  "example",
]);

const DECK_EXTENSIONS = new Set(["pdf", "ppt", "pptx", "key"]);

export const MAX_DECK_BYTES = 10 * 1024 * 1024;

export const STEADY_STAGE = "Steady revenue, want to grow it";

export const REVENUE_OPTIONS = [
  { value: "Under $1k MRR", label: "Under $1k" },
  { value: "$1–10k MRR", label: "$1–10k" },
  { value: "$10–50k MRR", label: "$10–50k" },
  { value: "$50–100k MRR", label: "$50–100k" },
  { value: "$100k+ MRR", label: "$100k+" },
];

function clean(value) {
  return String(value ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function isDnsHost(host) {
  if (!host || host.length > 253 || host === "localhost") return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(host);
}

function labelsOf(host) {
  return host.toLowerCase().replace(/\.$/, "").split(".").filter(Boolean);
}

function brandLabel(host) {
  const labels = labelsOf(host);
  if (labels[0] === "www") return labels[1] || "";
  return labels[0] || "";
}

export function junkHost(host) {
  const labels = labelsOf(host);
  if (labels.length < 2) return true;
  const tld = labels[labels.length - 1];
  if (JUNK_TLDS.has(tld)) return true;
  if (labels.some((label) => HARD_JUNK_LABELS.has(label))) return true;
  const brand = brandLabel(host);
  if (SOFT_JUNK_BRANDS.has(brand) && SOFT_JUNK_TLDS.has(tld)) return true;
  return false;
}

function isDisposable(domain) {
  return DISPOSABLE_DOMAINS.some((item) => domain === item || domain.endsWith(`.${item}`));
}

function isObviousFakeEmail(local, domain) {
  if (NOREPLY_LOCALS.has(local)) return true;
  if (isDisposable(domain) || junkHost(domain)) return true;
  const brand = brandLabel(domain);
  if (IDENTICAL_JUNK.has(local) && (local === brand || IDENTICAL_JUNK.has(brand))) return true;
  return false;
}

function splitEmail(value) {
  const v = clean(value);
  if (!v || /\s/.test(v) || v.includes("..")) return null;
  const at = v.indexOf("@");
  if (at <= 0 || at !== v.lastIndexOf("@")) return null;
  const local = v.slice(0, at);
  const domain = v.slice(at + 1).toLowerCase();
  if (local.length > 64 || domain.length > 253) return null;
  if (local.startsWith(".") || local.endsWith(".")) return null;
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return null;
  if (!isDnsHost(domain)) return null;
  if (JUNK_TLDS.has(domain.split(".").pop())) return null;
  return { local: local.toLowerCase(), domain };
}

export function emailError(value) {
  if (!clean(value)) return "Add an email address.";
  const parts = splitEmail(value);
  if (!parts) return "Enter a valid email address.";
  if (isObviousFakeEmail(parts.local, parts.domain)) return "Use an email address you actually read.";
  return "";
}

export function emailDomain(value) {
  if (emailError(value)) return "";
  const parts = splitEmail(value);
  return parts ? parts.domain : "";
}

export function parseWebUrl(value) {
  const v = clean(value);
  if (!v || /[\s<>]/.test(v) || v.startsWith("//") || v.startsWith("\\\\")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v)) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function websiteError(value, required) {
  const v = clean(value);
  if (!v) return required ? "Add a website or product link." : "";
  const url = parseWebUrl(v);
  if (!url || url.username || url.password) return "Enter a real website, like acme.com.";
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!isDnsHost(host) || junkHost(host)) return "Enter a real website, like acme.com.";
  return "";
}

export function websiteHost(value) {
  if (websiteError(value, false)) return "";
  const url = parseWebUrl(value);
  if (!url) return "";
  return url.hostname.toLowerCase().replace(/\.$/, "");
}

export function normalizeWebAddress(value) {
  const url = parseWebUrl(value);
  if (!url) return clean(value);
  return url.href;
}

function linkedInSlug(slug, min) {
  if (!slug || slug.length < min || slug.length > 100) return false;
  return /^[\p{L}\p{N}][\p{L}\p{N}._-]{0,99}$/u.test(slug);
}

export function linkedinError(value, required) {
  const v = clean(value);
  if (!v) return required ? "Add a LinkedIn profile or company page." : "";
  const url = parseWebUrl(v);
  const host = url ? url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "") : "";
  const linkedInHost = host === "linkedin.com" || /^[a-z0-9-]+\.linkedin\.com$/.test(host);
  const parts = url ? url.pathname.split("/").filter(Boolean) : [];
  const kind = parts[0] || "";
  let ok = false;
  if (url && linkedInHost && ["in", "company", "school", "showcase"].includes(kind)) {
    ok = linkedInSlug(parts[1], 2);
  } else if (url && linkedInHost && kind === "pub") {
    ok = parts.length >= 2 && parts.length <= 6 && parts.slice(1).every((part) => linkedInSlug(part, 1));
  }
  if (!ok) return "Enter a LinkedIn profile or company URL, like linkedin.com/in/your-name.";
  return "";
}

export function deckLinkError(value) {
  if (!clean(value)) return "";
  if (websiteError(value, true)) return "Enter a deck link, like https://docsend.com/view/...";
  return "";
}

export function deckFileError(file) {
  if (!file || !file.size) return "";
  const name = String(file.name || "");
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  if (!DECK_EXTENSIONS.has(ext)) return "Upload a PDF, PowerPoint, or Keynote.";
  if (file.size > MAX_DECK_BYTES) return "That deck is over 10 MB. Use a smaller file or paste a link.";
  return "";
}

function dnsStatus(record) {
  if (!record || typeof record.Status !== "number") return null;
  return record.Status;
}

function dnsHasAnswers(record) {
  return Boolean(record && Array.isArray(record.Answer) && record.Answer.length);
}

export function emailDomainReachable(mx, a, aaaa) {
  if (dnsStatus(mx) === 3 || dnsStatus(a) === 3 || dnsStatus(aaaa) === 3) return false;
  if (dnsHasAnswers(mx) || dnsHasAnswers(a) || dnsHasAnswers(aaaa)) return true;
  if (dnsStatus(mx) === 0 && dnsStatus(a) === 0 && dnsStatus(aaaa) === 0) return false;
  return null;
}

export function websiteHostReachable(a, aaaa) {
  if (dnsStatus(a) === 3 || dnsStatus(aaaa) === 3) return false;
  if (dnsHasAnswers(a) || dnsHasAnswers(aaaa)) return true;
  if (dnsStatus(a) === 0 && dnsStatus(aaaa) === 0) return false;
  return null;
}
