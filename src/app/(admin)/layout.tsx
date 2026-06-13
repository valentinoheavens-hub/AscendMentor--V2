import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "AscendMentor Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col bg-[#0d0d14]">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-xs font-semibold tracking-widest text-[#c9a84c] uppercase">
            AscendMentor
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">Admin Console</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/admin" exact>
            Overview
          </NavLink>
          <NavLink href="/admin/applications">Applications</NavLink>
          <NavLink href="/admin/learners">Learners</NavLink>
          <NavLink href="/admin/organisations">Organisations</NavLink>
          <NavLink href="/admin/inquiries">Inquiries</NavLink>
          <NavLink href="/admin/sessions">Sessions</NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/30 truncate">{user.email}</p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="mt-2 text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  );
}
