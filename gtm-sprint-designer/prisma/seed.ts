import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

// yes/no/mixed with optional annotation, e.g. "yes - vendor showcase"
function normalizeFlag(raw: string): string {
  const head = raw.trim().toLowerCase().split(/[\s-]/)[0];
  if (head === "yes" || head === "no" || head === "mixed") return head;
  throw new Error(`Unrecognized flag value: "${raw}"`);
}

async function main() {
  const csvPath = path.join(__dirname, "..", "data", "cases_v2.csv");
  const records: Record<string, string>[] = parse(fs.readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true,
  });

  let count = 0;
  for (const r of records) {
    const data = {
      actor: r.actor ?? "",
      person: r.person ?? "",
      stage: r.stage ?? "",
      icp: r.icp ?? "",
      channel: r.channel ?? "",
      approach: r.approach ?? "",
      volume: r.volume ?? "",
      timeframe: r.timeframe ?? "",
      openRate: r.open_rate ?? "",
      replyRate: r.reply_rate ?? "",
      acceptOrPositive: r.accept_or_positive ?? "",
      meetings: r.meetings ?? "",
      outcome: r.outcome ?? "",
      verdict: r.verdict ?? "",
      lesson: r.lesson ?? "",
      url: r.url ?? "",
      conf: r.conf ?? "",
      flag: r.flag ?? "",
      flagNorm: normalizeFlag(r.flag ?? ""),
      origin: "seed",
    };
    await prisma.case.upsert({
      where: { id: r.case_id },
      create: { id: r.case_id, ...data },
      update: data,
    });
    count++;
  }

  const citable = await prisma.case.count({ where: { conf: { in: ["A", "B"] } } });
  console.log(`Seeded ${count} cases (${citable} citable A/B, ${count - citable} quarantine C).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
