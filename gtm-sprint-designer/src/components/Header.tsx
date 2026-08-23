import Link from "next/link";
import { getSessionUser, isAdmin } from "@/lib/auth";

export default async function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = await getSessionUser();
  return (
    <header className="site-header">
      <div>
        <div className="kicker">Momentum Mill · GTM Sprint</div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      <nav className="nav">
        {user ? (
          <>
            <Link href="/designer">Designer</Link>
            <Link href="/runs">My runs</Link>
            {isAdmin(user) && <Link href="/admin">Admin</Link>}
            <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
              <button className="btn btn-small btn-ghost" type="submit">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
