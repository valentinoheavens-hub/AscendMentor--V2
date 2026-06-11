"use client";

import Link from "next/link";
import { Menu, LayoutDashboard, BarChart3, MessageSquare, Star, Settings, LogOut, Trophy, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  displayName: string;
  belt: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Clarity Assessment", icon: BarChart3 },
  { href: "/coaching", label: "BGC Coach", icon: MessageSquare },
  { href: "/progress", label: "My Progress", icon: Star },
  { href: "/validate", label: "Peer Validation", icon: Trophy },
  { href: "/upgrade", label: "Upgrade", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ displayName, belt }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </SheetTrigger>
      <SheetContent side="left" className="bg-card border-r border-border/50 p-0 w-64">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm font-display">A</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground leading-none">AscendMentor</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">AI by BGC</p>
          </div>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
          <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
          <div className="mt-2">
            <span className={cn("belt-badge text-[10px]", `belt-badge-${belt}`)}>
              {belt.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors group"
            >
              <Icon className="h-4 w-4 flex-shrink-0 group-hover:text-primary transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border/40 mt-auto">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
