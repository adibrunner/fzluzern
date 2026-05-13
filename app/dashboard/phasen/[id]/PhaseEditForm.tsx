"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PHASE_STATUSES = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "REGISTRATION_OPEN", label: "Anmeldung offen" },
  { value: "REGISTRATION_CLOSED", label: "Anmeldung geschlossen" },
  { value: "ALLOCATION", label: "Zuteilung" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "REPORTING", label: "Abschluss" },
  { value: "ARCHIVED", label: "Archiviert" },
];

function fmtDate(d: Date | string | null) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

interface PhaseData {
  id: string;
  name: string;
  status: string;
  registrationStart: Date | null;
  registrationEnd: Date | null;
  allocationDate: Date | null;
  executionStart: Date | null;
  executionEnd: Date | null;
}

export default function PhaseEditForm({ phase }: { phase: PhaseData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value;

    const res = await fetch(`/api/phasen/${phase.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: get("name"),
        status: get("status"),
        registrationStart: get("registrationStart") || null,
        registrationEnd: get("registrationEnd") || null,
        allocationDate: get("allocationDate") || null,
        executionStart: get("executionStart") || null,
        executionEnd: get("executionEnd") || null,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Speichern.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/phasen" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Phase bearbeiten</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {success && <div className="alert alert-success"><span>Gespeichert.</span></div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Name *</span></label>
            <input name="name" type="text" className="input input-bordered" defaultValue={phase.name} required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Status</span></label>
            <select name="status" className="select select-bordered" defaultValue={phase.status}>
              {PHASE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Anmeldung Start</span></label>
              <input name="registrationStart" type="date" className="input input-bordered" defaultValue={fmtDate(phase.registrationStart)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Anmeldung Ende</span></label>
              <input name="registrationEnd" type="date" className="input input-bordered" defaultValue={fmtDate(phase.registrationEnd)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Zuteilungsdatum</span></label>
              <input name="allocationDate" type="date" className="input input-bordered" defaultValue={fmtDate(phase.allocationDate)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Durchführung Start</span></label>
              <input name="executionStart" type="date" className="input input-bordered" defaultValue={fmtDate(phase.executionStart)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Durchführung Ende</span></label>
              <input name="executionEnd" type="date" className="input input-bordered" defaultValue={fmtDate(phase.executionEnd)} />
            </div>
          </div>

          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Speichern"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
