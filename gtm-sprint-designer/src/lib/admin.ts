import { z } from "zod";
import { getSessionUser, isAdmin } from "./auth";
import type { User } from "@prisma/client";

export async function requireAdmin(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) return null;
  return user;
}

const flagWithNorm = z
  .string()
  .trim()
  .refine((v) => ["yes", "no", "mixed"].includes(v.toLowerCase().split(/[\s-]/)[0]), {
    message: "flag must start with yes, no, or mixed",
  });

// Every corpus field, verbatim strings; blanks allowed (blank = source didn't state it).
export const CaseFieldsSchema = z.object({
  actor: z.string().trim(),
  person: z.string().trim(),
  stage: z.string().trim(),
  icp: z.string().trim(),
  channel: z.string().trim(),
  approach: z.string().trim(),
  volume: z.string().trim(),
  timeframe: z.string().trim(),
  openRate: z.string().trim(),
  replyRate: z.string().trim(),
  acceptOrPositive: z.string().trim(),
  meetings: z.string().trim(),
  outcome: z.string().trim(),
  verdict: z.string().trim(),
  lesson: z.string().trim(),
  url: z.string().trim(),
  conf: z.enum(["A", "B", "C"]),
  flag: flagWithNorm,
});
export type CaseFields = z.infer<typeof CaseFieldsSchema>;

export function normalizeFlag(raw: string): string {
  return raw.trim().toLowerCase().split(/[\s-]/)[0];
}
