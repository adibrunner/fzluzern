"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  activityId: string;
  children: { id: string; firstName: string; lastName: string }[];
  existingRegistrations: { childId: string; status: string }[];
  spotsLeft: number;
}

export default function AnmeldenButton({ activityId, children, existingRegistrations, spotsLeft }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const existingMap = Object.fromEntries(existingRegistrations.map((r) => [r.childId, r.status]));

  async function handleRegister(childId: string) {
    setLoading(childId);
    setMessage(null);
    const res = await fetch("/api/anmeldungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, childId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: data.status === "WAITLISTED" ? "Kind auf Warteliste eingetragen." : "Kind erfolgreich angemeldet!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: data.error ?? "Fehler bei der Anmeldung." });
    }
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} py-2 text-sm`}>
          {message.text}
        </div>
      )}
      {children.map((child) => {
        const existing = existingMap[child.id];
        const isRegistered = existing && existing !== "CANCELLED";
        return (
          <div key={child.id} className="flex items-center justify-between gap-3 p-3 bg-base-200 rounded-lg">
            <span className="font-medium text-sm">{child.firstName} {child.lastName}</span>
            {isRegistered ? (
              <span className={`badge badge-sm ${existing === "CONFIRMED" ? "badge-success" : existing === "WAITLISTED" ? "badge-warning" : "badge-ghost"}`}>
                {existing === "CONFIRMED" ? "Angemeldet" : existing === "WAITLISTED" ? "Warteliste" : existing}
              </span>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleRegister(child.id)}
                disabled={loading === child.id}
              >
                {loading === child.id ? <span className="loading loading-spinner loading-xs" /> : spotsLeft > 0 ? "Anmelden" : "Auf Warteliste"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
