"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrierenPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const res = await fetch("/api/auth/profil-erstellen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, supabaseId: data.user.id }),
      });
      if (!res.ok) {
        setError("Profil konnte nicht erstellt werden.");
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h1 className="text-2xl font-bold mb-2">Registrierung erfolgreich!</h1>
            <p className="text-base-content/70 mb-4">
              Bitte bestätigen Sie Ihre E-Mail-Adresse. Sie erhalten eine E-Mail mit einem Bestätigungslink.
            </p>
            <Link href="/auth/anmelden" className="btn btn-primary">Zur Anmeldung</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">Registrieren</h1>
          <p className="text-center text-base-content/60 mb-6">Portal Freizeit Luzern</p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Vorname</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Nachname</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">E-Mail</span></label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Passwort</span></label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">Mindestens 8 Zeichen</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Registrieren"}
            </button>
          </form>

          <div className="divider">oder</div>
          <p className="text-center text-sm">
            Bereits registriert?{" "}
            <Link href="/auth/anmelden" className="link link-primary">Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
