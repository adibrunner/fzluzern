"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Phase { id: string; name: string }

export default function NeueAktivitaetPage() {
  const router = useRouter();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/phasen").then((r) => r.json()).then((d) => setPhases(d.phases ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;

    const res = await fetch("/api/aktivitaeten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: get("title"),
        description: get("description"),
        phaseId: get("phaseId"),
        capacity: Number(get("capacity")),
        minAge: get("minAge") ? Number(get("minAge")) : null,
        maxAge: get("maxAge") ? Number(get("maxAge")) : null,
        location: get("location"),
        startDate: get("startDate") || null,
        endDate: get("endDate") || null,
      }),
    });

    if (res.ok) {
      router.push("/dashboard/aktivitaeten");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Erstellen.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/aktivitaeten" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Neue Aktivität</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Titel *</span></label>
            <input name="title" type="text" className="input input-bordered" required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Beschreibung</span></label>
            <textarea name="description" className="textarea textarea-bordered" rows={4} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Kursphase *</span></label>
            <select name="phaseId" className="select select-bordered" required>
              <option value="">Bitte wählen</option>
              {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Startdatum</span></label>
              <input name="startDate" type="date" className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Enddatum</span></label>
              <input name="endDate" type="date" className="input input-bordered" />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Ort</span></label>
            <input name="location" type="text" className="input input-bordered" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Kapazität *</span></label>
              <input name="capacity" type="number" min={1} className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mindestalter</span></label>
              <input name="minAge" type="number" min={0} max={25} className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Maximalalter</span></label>
              <input name="maxAge" type="number" min={0} max={25} className="input input-bordered" />
            </div>
          </div>

          <div className="card-actions justify-end">
            <Link href="/dashboard/aktivitaeten" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Erstellen"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
