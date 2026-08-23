import { z } from "zod";
import { STAGES, CHANNELS, ACVS } from "./constants";

export const DesignInputSchema = z.object({
  product: z.string().trim().min(1).max(500),
  icp: z.string().trim().min(1).max(500),
  stage: z.enum(STAGES),
  acv: z.enum(ACVS),
  channel: z.enum(CHANNELS),
  hoursPerWeek: z.number().int().min(1).max(40),
});
export type DesignInput = z.infer<typeof DesignInputSchema>;

// The experiment plan Claude must return. Shape mirrors the demo output exactly.
export const PlanSchema = z.object({
  hypothesis: z.string(),
  icp_narrowed: z.string(),
  channel: z.string(),
  list_source: z.string(),
  message_angle: z.string(),
  weekly_plan: z.array(z.string()).length(4),
  volume: z.string(),
  success_metric: z.string(),
  kill_criteria: z.array(z.string()).min(2),
  benchmark_context: z.string(),
  cited_cases: z.array(z.object({ id: z.string(), why: z.string() })).min(1),
  warning_from_failures: z.string(),
});
export type Plan = z.infer<typeof PlanSchema>;

export const VerdictInputSchema = z.object({
  verdict: z.enum(["scale", "iterate", "kill"]),
  actualVolume: z.string().trim().max(200),
  actualReplies: z.string().trim().max(200),
  actualMeetings: z.string().trim().max(200),
  actualNotes: z.string().trim().max(2000).optional().default(""),
});
export type VerdictInput = z.infer<typeof VerdictInputSchema>;
