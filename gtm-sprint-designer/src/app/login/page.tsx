import Header from "@/components/Header";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Header title="Sign in" subtitle="No passwords. We email you a link." />
      <main className="container">
        <section className="card" style={{ maxWidth: 480 }}>
          {error === "expired" && (
            <p className="error-text" style={{ marginBottom: 12 }}>
              That link has expired or was already used. Request a fresh one.
            </p>
          )}
          <LoginForm />
        </section>
      </main>
    </>
  );
}
