import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Designer from "./Designer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DesignerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const citableCount = await prisma.case.count({ where: { conf: { in: ["A", "B"] } } });

  return (
    <>
      <Header
        title="Experiment Designer"
        subtitle={`Built on ${citableCount} documented founder experiments (A/B verified tiers only). Every plan ships with pre-registered kill criteria.`}
      />
      <main className="container">
        <Designer />
      </main>
    </>
  );
}
