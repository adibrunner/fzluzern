import { requireProfile } from "@/app/lib/auth";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { Role } from "@/app/generated/prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  const navLinks = getNavLinks(profile.role);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="navbar bg-primary text-primary-content shadow-md px-4">
        <div className="flex-1">
          <Link href="/dashboard" className="text-lg font-bold">
            Freizeit Luzern
          </Link>
        </div>
        <div className="flex-none gap-3">
          <span className="text-sm hidden sm:block opacity-80">
            {profile.firstName} {profile.lastName}
          </span>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary-content text-primary rounded-full w-9 flex items-center justify-center font-bold text-sm">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-50 mt-3 w-52 p-2 shadow">
              <li className="menu-title text-xs opacity-60">{roleLabel(profile.role)}</li>
              <li><Link href="/dashboard/profil">Mein Profil</Link></li>
              <li>
                <form action={signOut}>
                  <button type="submit" className="w-full text-left text-error">Abmelden</button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-base-200 border-r border-base-300 p-4 hidden md:block">
          <ul className="menu menu-md gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-base-100 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function roleLabel(role: Role) {
  return { PARENT: "Erziehungsberechtigte/r", INSTRUCTOR: "Leiter/in", ADMIN: "Administrator/in" }[role];
}

function getNavLinks(role: Role) {
  const common = [{ href: "/dashboard", label: "Übersicht" }];

  if (role === "PARENT") {
    return [
      ...common,
      { href: "/dashboard/kinder", label: "Meine Kinder" },
      { href: "/aktivitaeten", label: "Aktivitäten" },
      { href: "/dashboard/anmeldungen", label: "Anmeldungen" },
    ];
  }

  if (role === "INSTRUCTOR") {
    return [
      ...common,
      { href: "/dashboard/aktivitaeten", label: "Meine Aktivitäten" },
      { href: "/dashboard/teilnehmende", label: "Teilnehmende" },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...common,
      { href: "/dashboard/phasen", label: "Kursphasen" },
      { href: "/dashboard/aktivitaeten", label: "Alle Aktivitäten" },
      { href: "/dashboard/benutzende", label: "Benutzende" },
      { href: "/dashboard/cms", label: "CMS" },
      { href: "/dashboard/berichte", label: "Berichte" },
    ];
  }

  return common;
}
