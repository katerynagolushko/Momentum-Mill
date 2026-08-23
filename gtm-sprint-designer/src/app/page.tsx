import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Public count is A+B only, live from the table — C rows never counted.
  const citableCount = await prisma.case.count({ where: { conf: { in: ["A", "B"] } } });
  const user = await getSessionUser();

  return (
    <main className="hero">
      <div className="kicker">Momentum Mill · GTM Sprint</div>
      <h1>One outbound experiment. Four weeks. Kill criteria set before you send.</h1>
      <p>
        Tell us what you sell and who you think buys it. You get a single 4-week outbound
        experiment — narrowed ICP, list source, message angle, weekly plan sized to your hours —
        with pre-registered numeric kill criteria and evidence from real, documented founder
        experiments.
      </p>
      <Link href={user ? "/designer" : "/login"}>
        <button className="btn">{user ? "Open the designer" : "Sign in to design yours"}</button>
      </Link>
      <p className="count-note">
        Built on {citableCount} documented founder GTM experiments (verified tiers only). Every
        evidence card links to its source.
      </p>
    </main>
  );
}
