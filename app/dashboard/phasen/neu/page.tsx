"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NeuePhasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value;

    const res = await fetch("/api/phasen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: get("name"),
        registrationStart: get("registrationStart") || null,
        registrationEnd: get("registrationEnd") || null,
        allocationDate: get("allocationDate") || null,
        executionStart: get("executionStart") || null,
        executionEnd: get("executionEnd") || null,
      }),
    });

    if (res.ok) {
      router.push("/dashboard/phasen");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Erstellen.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/phasen" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Neue Kursphase</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Name der Phase *</span></label>
            <input name="name" type="text" className="input input-bordered" required placeholder="z.B. Sommer 2025" />
          </div>

          <div className="divider text-sm">Zeiträume (optional)</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Anmeldung Start</span></label>
              <input name="registrationStart" type="date" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Anmeldung Ende</span></label>
              <input name="registrationEnd" type="date" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Zuteilungsdatum</span></label>
              <input name="allocationDate" type="date" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Durchführung Start</span></label>
              <input name="executionStart" type="date" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Durchführung Ende</span></label>
              <input name="executionEnd" type="date" className="input input-bordered" />
            </div>
          </div>

          <div className="card-actions justify-end">
            <Link href="/dashboard/phasen" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Erstellen"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
