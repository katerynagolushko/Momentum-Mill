export const STAGES = ["pre-revenue", "first customers", "under £20k MRR"] as const;

export const CHANNELS = [
  "cold email",
  "linkedin",
  "cold calling",
  "community/content",
  "not sure — recommend one",
] as const;

export const ACVS = ["under £1k", "£1k–£5k", "£5k–£20k", "£20k+"] as const;

export const BENCHMARKS = [
  { id: "BM-01", m: "avg cold email reply rate", v: "3.43% (top >10%)", src: "Instantly 2026" },
  { id: "BM-02", m: "meeting booking rate", v: "0.5-2% of sends", src: "Instantly 2026" },
  { id: "BM-04", m: "reply by list size", v: "<50 recipients 5.8% vs 1000+ 2.1%", src: "Belkins/Hunter via Cleverly" },
  { id: "BM-05", m: "contacts per company", v: "1-2 contacts 7.8% vs 10+ 3.8%", src: "Belkins" },
  { id: "BM-06", m: "personalization lift", v: "advanced up to 18% (~2x generic)", src: "Cleverly 2026" },
  { id: "BM-07", m: "hook types", v: "timeline 10.01% vs problem 4.39%; social proof 1.25% mtg", src: "Digital Bloom 2025" },
  { id: "BM-08", m: "follow-ups", v: "2-3 follow-ups = up to 42% of replies", src: "Cleverly 2026" },
  { id: "BM-10", m: "send cap", v: "30-50/inbox/day, warmup ramp", src: "Instantly" },
] as const;
