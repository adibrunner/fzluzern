"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NeuerNewsBeitragPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value;
    const publish = (form.elements.namedItem("publish") as HTMLInputElement)?.checked;

    const res = await fetch("/api/cms/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: get("title"), body: get("body"), publish }),
    });

    if (res.ok) {
      router.push("/dashboard/cms");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cms" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Neuer News-Beitrag</h1>
      </div>
      {error && <div className="alert alert-error"><span>{error}</span></div>}
      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Titel *</span></label>
            <input name="title" type="text" className="input input-bordered" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Inhalt *</span></label>
            <textarea name="body" className="textarea textarea-bordered" rows={10} required />
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input name="publish" type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Sofort veröffentlichen</span>
            </label>
          </div>
          <div className="card-actions justify-end">
            <Link href="/dashboard/cms" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Speichern"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
