// POST /api/validate/invite
// Body: { email, relationship }
// Creates a validator record and returns { id }

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, relationship } = await req.json() as { email: string; relationship: string };

  if (!email || !relationship) {
    return NextResponse.json({ error: "email and relationship required" }, { status: 400 });
  }

  // Cap at 5 validators
  const { count } = await supabase
    .from("validators")
    .select("id", { count: "exact", head: true })
    .eq("learner_id", user.id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Maximum 5 validators allowed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("validators")
    .insert({
      learner_id: user.id,
      email,
      relationship,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
