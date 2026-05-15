"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  PARENT: "Erziehungsberechtigte/r",
  INSTRUCTOR: "Leiter/in",
  ADMIN: "Administrator/in",
};

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date;
}

export default function BenutzendeListe({
  profiles,
  currentQ,
  currentRolle,
  currentSort,
}: {
  profiles: Profile[];
  currentQ: string;
  currentRolle: string;
  currentSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function updateSearch(params: Record<string, string>) {
    const sp = new URLSearchParams();
    const merged = { q: currentQ, rolle: currentRolle, sort: currentSort, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }

  async function changeRole(profileId: string, newRole: string) {
    setUpdatingId(profileId);
    await fetch(`/api/benutzende/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUpdatingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs">Suche</span></label>
          <input
            type="text"
            className="input input-bordered input-sm w-48"
            placeholder="Name oder E-Mail"
            defaultValue={currentQ}
            onChange={(e) => updateSearch({ q: e.target.value })}
          />
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs">Rolle</span></label>
          <select
            className="select select-bordered select-sm"
            value={currentRolle}
            onChange={(e) => updateSearch({ rolle: e.target.value })}
          >
            <option value="">Alle Rollen</option>
            <option value="PARENT">Erziehungsberechtigte</option>
            <option value="INSTRUCTOR">Leiter/innen</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label py-1"><span className="label-text text-xs">Sortierung</span></label>
          <select
            className="select select-bordered select-sm"
            value={currentSort}
            onChange={(e) => updateSearch({ sort: e.target.value })}
          >
            <option value="">Name</option>
            <option value="email">E-Mail</option>
            <option value="role">Rolle</option>
          </select>
        </div>
        {isPending && <span className="loading loading-spinner loading-sm" />}
      </div>

      <p className="text-sm text-base-content/60">{profiles.length} Benutzende</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Registriert</th>
              <th>Rolle</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="text-center text-base-content/40 py-8">Keine Benutzenden gefunden.</td></tr>
            )}
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.lastName} {p.firstName}</td>
                <td className="text-sm">{p.email}</td>
                <td className="text-sm text-base-content/60">{p.phone ?? "–"}</td>
                <td className="text-sm text-base-content/60">{new Date(p.createdAt).toLocaleDateString("de-CH")}</td>
                <td>
                  <select
                    className="select select-bordered select-xs"
                    value={p.role}
                    disabled={updatingId === p.id}
                    onChange={(e) => changeRole(p.id, e.target.value)}
                  >
                    <option value="PARENT">Erziehungsberechtigte/r</option>
                    <option value="INSTRUCTOR">Leiter/in</option>
                    <option value="ADMIN">Administrator/in</option>
                  </select>
                  {updatingId === p.id && <span className="loading loading-spinner loading-xs ml-2" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
