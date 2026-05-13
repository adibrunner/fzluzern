import { requireProfile } from "@/app/lib/auth";
import ProfilForm from "./ProfilForm";

export default async function ProfilPage() {
  const profile = await requireProfile();
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Mein Profil</h1>
      <ProfilForm profile={profile} />
    </div>
  );
}
