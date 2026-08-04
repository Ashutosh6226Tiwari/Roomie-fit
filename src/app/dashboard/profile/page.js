import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ProfileEditClient from "@/components/ProfileEditClient";

export const metadata = {
  title: "Edit Profile — RoomieMatch",
};

export default async function DashboardProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.is_verified !== true) {
    redirect("/onboarding");
  }

  return (
    <div className="flex-1 bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <ProfileEditClient profile={profile} />
      </div>
    </div>
  );
}
