import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function UserDetails({ locale }: { locale: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect(`/${locale}/auth/login`);
  }

  return JSON.stringify(data.claims, null, 2);
}

export default async function ProtectedPage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <UserDetails locale={params.locale} />
    </div>
  );
}
