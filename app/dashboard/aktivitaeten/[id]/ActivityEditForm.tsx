"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUSES = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "PUBLISHED", label: "Veröffentlicht" },
  { value: "REGISTRATION", label: "Anmeldung offen" },
  { value: "ALLOCATION", label: "Zuteilung" },
  { value: "EXECUTION", label: "Durchführung" },
  { value: "REPORTING", label: "Abschluss" },
  { value: "ARCHIVED", label: "Archiviert" },
];

function fmtDate(d: Date | string | null) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

interface Reg {
  id: string;
  status: string;
  waitlistPos: number | null;
  child: { firstName: string; lastName: string; dateOfBirth: Date };
}

interface ActivityData {
  id: string; title: string; description: string | null; status: string;
  phaseId: string; capacity: number; minAge: number | null; maxAge: number | null;
  location: string | null; startDate: Date | null; endDate: Date | null;
}

interface PhaseData { id: string; name: string }

export default function ActivityEditForm({
  activity, phases, registrations, isAdmin,
}: {
  activity: ActivityData; phases: PhaseData[]; registrations: Reg[]; isAdmin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;

    const res = await fetch(`/api/aktivitaeten/${activity.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: get("title"),
        description: get("description"),
        status: get("status"),
        capacity: Number(get("capacity")),
        minAge: get("minAge") ? Number(get("minAge")) : null,
        maxAge: get("maxAge") ? Number(get("maxAge")) : null,
        location: get("location") || null,
        startDate: get("startDate") || null,
        endDate: get("endDate") || null,
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

  const confirmed = registrations.filter((r) => r.status === "CONFIRMED");
  const waitlisted = registrations.filter((r) => r.status === "WAITLISTED");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/aktivitaeten" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Aktivität bearbeiten</h1>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {success && <div className="alert alert-success"><span>Gespeichert.</span></div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Titel *</span></label>
            <input name="title" type="text" className="input input-bordered" defaultValue={activity.title} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Beschreibung</span></label>
            <textarea name="description" className="textarea textarea-bordered" rows={4} defaultValue={activity.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Status</span></label>
              <select name="status" className="select select-bordered" defaultValue={activity.status}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Kapazität *</span></label>
              <input name="capacity" type="number" min={1} className="input input-bordered" defaultValue={activity.capacity} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mindestalter</span></label>
              <input name="minAge" type="number" min={0} className="input input-bordered" defaultValue={activity.minAge ?? ""} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Maximalalter</span></label>
              <input name="maxAge" type="number" min={0} className="input input-bordered" defaultValue={activity.maxAge ?? ""} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Startdatum</span></label>
              <input name="startDate" type="date" className="input input-bordered" defaultValue={fmtDate(activity.startDate)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Enddatum</span></label>
              <input name="endDate" type="date" className="input input-bordered" defaultValue={fmtDate(activity.endDate)} />
            </div>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Ort</span></label>
            <input name="location" type="text" className="input input-bordered" defaultValue={activity.location ?? ""} />
          </div>
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Speichern"}
            </button>
          </div>
        </div>
      </form>

      {/* Participant list */}
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body">
          <h2 className="font-semibold text-lg mb-2">Teilnehmende ({confirmed.length} / {activity.capacity})</h2>
          {confirmed.length === 0 ? (
            <p className="text-sm text-base-content/60">Noch keine bestätigten Anmeldungen.</p>
          ) : (
            <table className="table table-sm">
              <thead><tr><th>Name</th><th>Geburtsdatum</th></tr></thead>
              <tbody>
                {confirmed.map((r) => (
                  <tr key={r.id}>
                    <td>{r.child.firstName} {r.child.lastName}</td>
                    <td>{new Date(r.child.dateOfBirth).toLocaleDateString("de-CH")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {waitlisted.length > 0 && (
            <>
              <div className="divider text-sm">Warteliste</div>
              <table className="table table-sm">
                <thead><tr><th>#</th><th>Name</th></tr></thead>
                <tbody>
                  {waitlisted.sort((a, b) => (a.waitlistPos ?? 0) - (b.waitlistPos ?? 0)).map((r) => (
                    <tr key={r.id}>
                      <td>{r.waitlistPos}</td>
                      <td>{r.child.firstName} {r.child.lastName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
