import Link from "next/link";
import { getProfile } from "@/app/lib/auth";

export default async function PublicNavbar() {
  const profile = await getProfile();

  return (
    <header className="navbar bg-primary text-primary-content px-6 shadow">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold">Freizeit Luzern</Link>
      </div>
      <div className="flex-none gap-2">
        <Link href="/aktivitaeten" className="btn btn-ghost btn-sm">Aktivitäten</Link>
        <Link href="/aktuelles" className="btn btn-ghost btn-sm">Aktuelles</Link>
        {profile ? (
          <Link href="/dashboard" className="btn btn-ghost btn-sm">Mein Bereich</Link>
        ) : (
          <Link href="/auth/anmelden" className="btn btn-ghost btn-sm">Anmelden</Link>
        )}
      </div>
    </header>
  );
}
