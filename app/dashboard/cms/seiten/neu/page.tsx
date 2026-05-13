"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NeueInfoSeitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value;
    const res = await fetch("/api/cms/seiten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: get("title"), slug: get("slug"), body: get("body") }),
    });
    if (res.ok) { router.push("/dashboard/cms"); router.refresh(); }
    else { const j = await res.json(); setError(j.error ?? "Fehler."); setLoading(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cms" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Neue Info-Seite</h1>
      </div>
      {error && <div className="alert alert-error"><span>{error}</span></div>}
      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Titel *</span></label>
            <input name="title" type="text" className="input input-bordered" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Slug * (URL-Pfad, z.B. "ueber-uns")</span></label>
            <input name="slug" type="text" className="input input-bordered font-mono" required pattern="[a-z0-9-]+" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Inhalt *</span></label>
            <textarea name="body" className="textarea textarea-bordered" rows={12} required />
          </div>
          <div className="card-actions justify-end">
            <Link href="/dashboard/cms" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Erstellen"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
