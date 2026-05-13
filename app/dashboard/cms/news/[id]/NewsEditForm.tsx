"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostData { id: string; title: string; body: string; publishedAt: Date | null }

export default function NewsEditForm({ post }: { post: PostData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value;
    const publish = (form.elements.namedItem("publish") as HTMLInputElement)?.checked;

    const res = await fetch(`/api/cms/news/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: get("title"), body: get("body"), publish }),
    });

    if (res.ok) { setSuccess(true); router.refresh(); }
    else { const j = await res.json(); setError(j.error ?? "Fehler."); }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cms" className="btn btn-ghost btn-sm">← Zurück</Link>
        <h1 className="text-2xl font-bold">Beitrag bearbeiten</h1>
      </div>
      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {success && <div className="alert alert-success"><span>Gespeichert.</span></div>}
      <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Titel *</span></label>
            <input name="title" type="text" className="input input-bordered" defaultValue={post.title} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Inhalt *</span></label>
            <textarea name="body" className="textarea textarea-bordered" rows={10} defaultValue={post.body} required />
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input name="publish" type="checkbox" className="checkbox checkbox-primary" defaultChecked={!!post.publishedAt} />
              <span className="label-text">Veröffentlicht</span>
            </label>
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
