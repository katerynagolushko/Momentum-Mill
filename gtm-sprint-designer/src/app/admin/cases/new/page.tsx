import { redirect } from "next/navigation";
import Header from "@/components/Header";
import CaseForm from "../../CaseForm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  if (!(await requireAdmin())) redirect("/login");
  return (
    <>
      <Header title="Add corpus case" subtitle="Preserve the source's numbers verbatim. Blank = not stated." />
      <main className="container">
        <section className="card card-lg">
          <CaseForm mode="new" />
        </section>
      </main>
    </>
  );
}
