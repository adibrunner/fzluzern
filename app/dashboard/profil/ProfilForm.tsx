"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileData { id: string; firstName: string; lastName: string; email: string; phone: string | null; role: string }

export default function ProfilForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value;
    const res = await fetch("/api/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: get("firstName"), lastName: get("lastName"), phone: get("phone") }),
    });
    if (res.ok) { setSuccess(true); router.refresh(); }
    else { const j = await res.json(); setError(j.error ?? "Fehler."); }
    setLoading(false);
  }

  const roleLabels: Record<string, string> = { PARENT: "Erziehungsberechtigte/r", INSTRUCTOR: "Leiter/in", ADMIN: "Administrator/in" };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
      <div className="card-body space-y-4">
        {error && <div className="alert alert-error"><span>{error}</span></div>}
        {success && <div className="alert alert-success"><span>Profil aktualisiert.</span></div>}

        <div className="form-control">
          <label className="label"><span className="label-text">Rolle</span></label>
          <input type="text" className="input input-bordered" value={roleLabels[profile.role] ?? profile.role} disabled />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">E-Mail</span></label>
          <input type="email" className="input input-bordered" value={profile.email} disabled />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Vorname</span></label>
            <input name="firstName" type="text" className="input input-bordered" defaultValue={profile.firstName} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Nachname</span></label>
            <input name="lastName" type="text" className="input input-bordered" defaultValue={profile.lastName} required />
          </div>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Telefon</span></label>
          <input name="phone" type="tel" className="input input-bordered" defaultValue={profile.phone ?? ""} />
        </div>

        <div className="card-actions justify-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Speichern"}
          </button>
        </div>
      </div>
    </form>
  );
}
