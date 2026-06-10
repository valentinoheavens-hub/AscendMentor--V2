// Root page — immediately redirects based on auth state.
// Authenticated users → /dashboard, guests → /login

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Let middleware + dashboard layout handle onboarding/assessment routing
  redirect("/dashboard");
}
