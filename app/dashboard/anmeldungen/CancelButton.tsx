"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelButton({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Anmeldung wirklich stornieren?")) return;
    setLoading(true);
    await fetch(`/api/anmeldungen/${registrationId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button className="btn btn-xs btn-error btn-outline" onClick={handleCancel} disabled={loading}>
      {loading ? <span className="loading loading-spinner loading-xs" /> : "Stornieren"}
    </button>
  );
}
