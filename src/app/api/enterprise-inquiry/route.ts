// POST /api/enterprise-inquiry — public "For institutions" contact form.
// Stores the inquiry (service role) and notifies the admin by email.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEnterpriseInquiryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    organisationName?: string;
    contactName?: string;
    contactEmail?: string;
    phone?: string;
    country?: string;
    teamSize?: string;
    message?: string;
  };

  const organisationName = body.organisationName?.trim();
  const contactName = body.contactName?.trim();
  const contactEmail = body.contactEmail?.trim();

  if (!organisationName || !contactName || !contactEmail) {
    return NextResponse.json(
      { error: "Organisation, contact name and email are required" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("enterprise_inquiries").insert({
    organisation_name: organisationName,
    contact_name: contactName,
    contact_email: contactEmail,
    phone: body.phone?.trim() || null,
    country: body.country?.trim() || null,
    team_size: body.teamSize?.trim() || null,
    message: body.message?.trim() || null,
  });

  if (error) {
    console.error("[enterprise-inquiry] insert failed:", error.message);
    return NextResponse.json({ error: "Could not submit inquiry" }, { status: 500 });
  }

  await sendEnterpriseInquiryEmail({
    organisationName,
    contactName,
    contactEmail,
    teamSize: body.teamSize ?? null,
    message: body.message ?? null,
  });

  return NextResponse.json({ success: true });
}
