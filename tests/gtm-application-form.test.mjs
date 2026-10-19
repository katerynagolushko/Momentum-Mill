import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  REVENUE_OPTIONS,
  STEADY_STAGE,
  deckFileError,
  deckLinkError,
  emailDomain,
  emailDomainReachable,
  emailError,
  linkedinError,
  normalizeWebAddress,
  websiteError,
  websiteHost,
  websiteHostReachable,
} from "../docs/GTMSprint/application/validate.js";

const html = fs.readFileSync(new URL("../docs/GTMSprint/application/index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../docs/GTMSprint/application/application.css", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../docs/GTMSprint/application/application.js", import.meta.url), "utf8");

test("form column is centered and the selected yes/no mark is white", () => {
  const applyRule = css.match(/\.apply\s*\{([^}]+)\}/);
  assert.ok(applyRule);
  assert.match(applyRule[1], /margin:\s*0\s+auto/);

  const unchecked = css.match(/\.check__mark\s*\{([^}]+)\}/);
  assert.ok(unchecked);
  assert.match(unchecked[1], /border-radius:\s*50%/);
  assert.match(unchecked[1], /background:\s*transparent/);

  const checked = css.match(/\.check input:checked \+ \.check__mark\s*\{([^}]+)\}/);
  assert.ok(checked);
  assert.match(checked[1], /background:\s*#fff\b/);
  assert.match(checked[1], /border-color:\s*#fff\b/);
});

test("steady revenue is the real stage option and chips are required only then", () => {
  assert.equal(STEADY_STAGE, "Steady revenue, want to grow it");
  assert.match(html, new RegExp(`<option>\\s*${STEADY_STAGE}\\s*</option>`));
  assert.match(html, /id="revenue-field"/);
  assert.match(app, /STEADY_STAGE/);
  assert.equal(REVENUE_OPTIONS.length, 5);
  for (const option of REVENUE_OPTIONS) {
    assert.match(option.value, /MRR$/);
    assert.ok(html.includes(`value="${option.value}"`));
    assert.ok(html.includes(`>${option.label}<`));
  }
});

test("deck accepts a link and a file on the existing submit path", () => {
  assert.match(html, /id="f-deck"/);
  assert.match(html, /type="file"/);
  assert.match(html, /name="attachment"/);
  assert.match(html, /Paste a link, upload a file, or both/);
  assert.match(app, /Content-Type": "application\/json"/);
  assert.match(app, /new FormData\(\)/);
  assert.match(app, /append\("attachment"/);
  assert.match(app, /cfg\.endpoint/);
  assert.doesNotMatch(app, /BLOB_|AWS_|supabase|uploadthing|cloudinary/i);
});

test("email rejects malformed and obvious fake addresses", () => {
  assert.equal(emailError("kate@momentummill.com"), "");
  assert.equal(emailError("founder+sprint@startup.io"), "");
  assert.equal(emailError("person@startup.co.uk"), "");
  assert.equal(emailError("test@gmail.com"), "");
  assert.equal(emailError(""), "Add an email address.");
  assert.equal(emailError("asdf"), "Enter a valid email address.");
  assert.equal(emailError("kate@domain"), "Enter a valid email address.");
  assert.equal(emailError("a@b.c"), "Enter a valid email address.");
  assert.equal(emailError("bad..dot@x.com"), "Enter a valid email address.");
  assert.equal(emailError("test@test.com"), "Use an email address you actually read.");
  assert.equal(emailError("example@example.com"), "Use an email address you actually read.");
  assert.equal(emailError("noreply@momentummill.com"), "Use an email address you actually read.");
  assert.equal(emailError("user@mailinator.com"), "Use an email address you actually read.");
  assert.equal(emailDomain("Kate@MomentumMill.com"), "momentummill.com");
  assert.equal(emailDomain("asdf"), "");
});

test("website requires a real host and allows a missing scheme", () => {
  assert.equal(websiteError("acme.com", true), "");
  assert.equal(websiteError("https://acme.com/pricing", true), "");
  assert.equal(websiteError("www.acme.co.uk", true), "");
  assert.equal(websiteError("my-startup.vercel.app", true), "");
  assert.equal(websiteError("https://docs.google.com/presentation/d/abc", true), "");
  assert.equal(websiteError("", false), "");
  assert.equal(websiteError("", true), "Add a website or product link.");
  assert.equal(websiteError("asdf", true), "Enter a real website, like acme.com.");
  assert.equal(websiteError("http://asdf", true), "Enter a real website, like acme.com.");
  assert.equal(websiteError("example.com", true), "Enter a real website, like acme.com.");
  assert.equal(websiteError("javascript:alert(1)", true), "Enter a real website, like acme.com.");
  assert.equal(websiteError("http://localhost:3000", true), "Enter a real website, like acme.com.");
  assert.equal(websiteHost("acme.com"), "acme.com");
  assert.equal(websiteHost("asdf"), "");
  assert.match(normalizeWebAddress("acme.com/about"), /^https:\/\/acme\.com\/about$/);
});

test("linkedin accepts profile and company URLs only", () => {
  assert.equal(linkedinError("", false), "");
  assert.match(linkedinError("", true), /LinkedIn/);
  assert.equal(linkedinError("https://www.linkedin.com/in/kateryna-golushko", true), "");
  assert.equal(linkedinError("linkedin.com/in/kateryna-golushko", false), "");
  assert.equal(linkedinError("https://uk.linkedin.com/company/momentum-mill/", true), "");
  assert.equal(linkedinError("https://www.linkedin.com/school/university-of-oxford", true), "");
  assert.equal(linkedinError("https://www.linkedin.com/in/name?trk=public", true), "");
  assert.equal(linkedinError("https://www.linkedin.com/pub/john-doe/1/1/1", true), "");
  assert.match(linkedinError("asdf", true), /LinkedIn/);
  assert.match(linkedinError("https://google.com/in/name", true), /LinkedIn/);
  assert.match(linkedinError("https://linkedin.com", true), /LinkedIn/);
  assert.match(linkedinError("https://www.linkedin.com/feed/", true), /LinkedIn/);
  assert.match(linkedinError("https://linkedin.com.evil.com/in/name", true), /LinkedIn/);
  assert.match(linkedinError("https://lnkd.in/abcdef", true), /LinkedIn/);
});

test("deck link and file rules", () => {
  assert.equal(deckLinkError(""), "");
  assert.equal(deckLinkError("https://docsend.com/view/abc"), "");
  assert.match(deckLinkError("asdf"), /deck link/);
  assert.equal(deckFileError(null), "");
  assert.equal(deckFileError({ name: "deck.pdf", size: 1000 }), "");
  assert.equal(deckFileError({ name: "deck.PDF", size: 1000 }), "");
  assert.equal(deckFileError({ name: "deck.pptx", size: 1000 }), "");
  assert.equal(deckFileError({ name: "deck.key", size: 100 }), "");
  assert.match(deckFileError({ name: "deck.docx", size: 1000 }), /PDF/);
  assert.match(deckFileError({ name: "deck.pdf.exe", size: 1000 }), /PDF/);
  assert.match(deckFileError({ name: "deck.pdf", size: 10 * 1024 * 1024 + 1 }), /10 MB/);
});

test("dns reachability fails closed only on a definitive answer", () => {
  assert.equal(emailDomainReachable(null, null, null), null);
  assert.equal(emailDomainReachable({ Status: 3 }, null, null), false);
  assert.equal(emailDomainReachable({ Status: 0, Answer: [{ type: 15 }] }, { Status: 0 }, { Status: 0 }), true);
  assert.equal(emailDomainReachable({ Status: 0, Answer: [] }, { Status: 0, Answer: [{ type: 1 }] }, { Status: 0 }), true);
  assert.equal(emailDomainReachable({ Status: 0, Answer: [] }, { Status: 0, Answer: [] }, { Status: 0, Answer: [] }), false);
  assert.equal(emailDomainReachable({ Status: 2 }, null, null), null);
  assert.equal(websiteHostReachable({ Status: 3 }, null), false);
  assert.equal(websiteHostReachable({ Status: 0, Answer: [{ type: 1 }] }, { Status: 0 }), true);
  assert.equal(websiteHostReachable({ Status: 0, Answer: [] }, { Status: 0, Answer: [] }), false);
  assert.equal(websiteHostReachable(null, null), null);
});
