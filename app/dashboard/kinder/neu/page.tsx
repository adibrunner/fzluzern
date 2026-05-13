"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NeuesKindPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      dateOfBirth: (form.elements.namedItem("dateOfBirth") as HTMLInputElement).value,
      emergencyName: (form.elements.namedItem("emergencyName") as HTMLInputElement).value,
      emergencyPhone: (form.elements.namedItem("emergencyPhone") as HTMLInputElement).value,
      medicalNotes: (form.elements.namedItem("medicalNotes") as HTMLTextAreaElement).value,
    };
    const res = await fetch("/api/kinder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      router.push("/dashboard/kinder");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Speichern.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/kinder" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Kind hinzufügen</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Vorname</span></label>
              <input name="firstName" type="text" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Nachname</span></label>
              <input name="lastName" type="text" className="input input-bordered" required />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Geburtsdatum</span></label>
            <input name="dateOfBirth" type="date" className="input input-bordered" required />
          </div>

          <div className="divider text-sm">Notfallkontakt</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Name</span></label>
              <input name="emergencyName" type="text" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Telefon</span></label>
              <input name="emergencyPhone" type="tel" className="input input-bordered" />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Medizinische Hinweise</span></label>
            <textarea name="medicalNotes" className="textarea textarea-bordered" rows={3} placeholder="Allergien, Medikamente, etc." />
          </div>

          <div className="card-actions justify-end">
            <Link href="/dashboard/kinder" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Speichern"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
