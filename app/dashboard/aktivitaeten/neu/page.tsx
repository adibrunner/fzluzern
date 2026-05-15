"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Phase { id: string; name: string }
interface Execution { startDate: string; endDate: string; location: string; notes: string }

export default function NeueAktivitaetPage() {
  const router = useRouter();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([{ startDate: "", endDate: "", location: "", notes: "" }]);

  useEffect(() => {
    fetch("/api/phasen").then((r) => r.json()).then((d) => setPhases(d.phases ?? []));
  }, []);

  function addExecution() {
    setExecutions((prev) => [...prev, { startDate: "", endDate: "", location: "", notes: "" }]);
  }
  function removeExecution(i: number) {
    setExecutions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateExecution(i: number, field: keyof Execution, value: string) {
    setExecutions((prev) => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;

    const validExecutions = executions.filter((ex) => ex.startDate);

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
        executions: validExecutions,
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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/aktivitaeten" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Neue Aktivität</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body space-y-4">
            <h2 className="font-semibold">Grunddaten</h2>

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

            <div className="form-control">
              <label className="label"><span className="label-text">Standard-Ort</span></label>
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
          </div>
        </div>

        {/* Executions */}
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Durchführungsdaten</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addExecution}>+ Termin hinzufügen</button>
            </div>

            {executions.map((ex, i) => (
              <div key={i} className="border border-base-300 rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Termin {i + 1}</span>
                  {executions.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeExecution(i)}>Entfernen</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Startdatum *</span></label>
                    <input type="date" className="input input-bordered input-sm" value={ex.startDate} onChange={(e) => updateExecution(i, "startDate", e.target.value)} required={i === 0} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Enddatum</span></label>
                    <input type="date" className="input input-bordered input-sm" value={ex.endDate} onChange={(e) => updateExecution(i, "endDate", e.target.value)} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Ort (optional)</span></label>
                    <input type="text" className="input input-bordered input-sm" value={ex.location} onChange={(e) => updateExecution(i, "location", e.target.value)} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Hinweis</span></label>
                    <input type="text" className="input input-bordered input-sm" value={ex.notes} onChange={(e) => updateExecution(i, "notes", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/aktivitaeten" className="btn btn-ghost">Abbrechen</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
}
