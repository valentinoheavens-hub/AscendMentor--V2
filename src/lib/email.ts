// ─────────────────────────────────────────────────────────────────────────────
// Email — thin Resend wrapper. Server-side only.
// Sends via Resend when RESEND_API_KEY is set; otherwise logs and no-ops so
// flows never break in environments without email configured.
// ─────────────────────────────────────────────────────────────────────────────

const FROM = process.env.EMAIL_FROM ?? "AscendMentor AI <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "admin@ascendmentor.ai";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email] (no RESEND_API_KEY — skipped) to=${to} subject="${subject}"`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend error ${res.status}: ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

// ── Shared shell ──────────────────────────────────────────────────────────────

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#1A1A1A;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#222222;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px;">
          <tr><td align="center" style="padding-bottom:24px;">
            <span style="display:inline-block;background:#B8960C;color:#1A1A1A;font-weight:bold;font-size:14px;border-radius:8px;padding:8px 12px;">AscendMentor AI</span>
          </td></tr>
          <tr><td style="color:#F9F6F0;font-size:20px;font-weight:bold;padding-bottom:16px;" align="center">${title}</td></tr>
          <tr><td style="color:#B8B7AF;font-size:14px;line-height:1.7;">${bodyHtml}</td></tr>
          <tr><td style="padding-top:28px;color:#888780;font-size:11px;" align="center">
            Blackbelt Global Consulting Limited · <a href="mailto:support@ascendmentor.ai" style="color:#B8960C;">support@ascendmentor.ai</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 8px;"><tr><td style="background:#B8960C;border-radius:10px;">
    <a href="${href}" style="display:inline-block;color:#1A1A1A;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 28px;">${label}</a>
  </td></tr></table>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function sendApprovalEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: "You're in — welcome to AscendMentor AI 🥋",
    html: shell(
      "Your application is approved",
      `<p>Hi ${firstName || "there"},</p>
       <p>Welcome to AscendMentor AI. Your application has been reviewed and approved — your leadership mastery journey starts now.</p>
       <p>Your first step is the <strong>Clarity Assessment™</strong>: 26 questions, 10 minutes, and you'll have your baseline BGC Mastery Score™.</p>
       ${button(`${APP_URL}/dashboard`, "Open your dashboard")}`
    ),
  });
}

export async function sendDeclineEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: "Your AscendMentor AI application",
    html: shell(
      "About your application",
      `<p>Hi ${firstName || "there"},</p>
       <p>Thank you for applying to AscendMentor AI. We personally review every application, and at this time we weren't able to offer you access — the current programme is focused on founders and senior executives leading active organisations.</p>
       <p>If you believe we've misjudged your application, reply to this email and tell us more about your role and organisation. We do reconsider.</p>`
    ),
  });
}

export async function sendAdminNewApplicationEmail(applicant: {
  fullName: string | null;
  email: string;
  organisation: string | null;
  roleTitle: string | null;
  country: string | null;
}) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New application: ${applicant.fullName ?? applicant.email}`,
    html: shell(
      "New learner application",
      `<p>A new application has been submitted and is awaiting review.</p>
       <p>
         <strong>Name:</strong> ${applicant.fullName ?? "—"}<br/>
         <strong>Email:</strong> ${applicant.email}<br/>
         <strong>Organisation:</strong> ${applicant.organisation ?? "—"}<br/>
         <strong>Role:</strong> ${applicant.roleTitle ?? "—"}<br/>
         <strong>Country:</strong> ${applicant.country ?? "—"}
       </p>
       ${button(`${APP_URL}/admin/applications`, "Review application")}`
    ),
  });
}

export async function sendEnterpriseInquiryEmail(inquiry: {
  organisationName: string;
  contactName: string;
  contactEmail: string;
  teamSize: string | null;
  message: string | null;
}) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Enterprise inquiry: ${inquiry.organisationName}`,
    html: shell(
      "New enterprise inquiry",
      `<p>An institution has requested enterprise access.</p>
       <p>
         <strong>Organisation:</strong> ${inquiry.organisationName}<br/>
         <strong>Contact:</strong> ${inquiry.contactName} (${inquiry.contactEmail})<br/>
         <strong>Team size:</strong> ${inquiry.teamSize ?? "—"}
       </p>
       ${inquiry.message ? `<p style="border-left:3px solid #B8960C;padding-left:12px;">${inquiry.message}</p>` : ""}
       ${button(`${APP_URL}/admin/organisations`, "Open admin console")}`
    ),
  });
}
