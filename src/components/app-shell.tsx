import { Link } from "@tanstack/react-router";
import {
  Home,
  KanbanSquare,
  Mail,
  NotebookPen,
  Search,
  MessageSquare,
  UserCircle2,
  Settings,
  FileText,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoAsset from "@/assets/fumanai-logo.png.asset.json";
import markAsset from "@/assets/fumanai-mark.png";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/job", label: "Generate Application", icon: FileText },
  { to: "/tracker", label: "Job Tracker", icon: KanbanSquare },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/notes", label: "Meeting Notes", icon: NotebookPen },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/profiles", label: "Profiles", icon: UserCircle2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return (
    <div className="px-4">
      <img
        src={logoAsset.url}
        alt="FumanAI — Your Autonomous Dream Job Assistant"
        className="w-full max-w-[220px] select-none"
        draggable={false}
      />
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-6 flex flex-col gap-1 px-2">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:font-medium"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:bg-sidebar md:py-6">
        <Brand />
        <NavList />
        <div className="mt-auto px-4 py-4 text-[11px] text-sidebar-foreground/50">
          Your data stays in this browser.
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <img src={markAsset} alt="FumanAI" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-[Poppins] font-semibold tracking-tight">FumanAI</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="rounded-md p-2 hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground border-sidebar-border">
              <VisuallyHidden>
                <SheetTitle>FumanAI navigation</SheetTitle>
              </VisuallyHidden>
              <div className="py-6">
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 animate-in fade-in duration-300">{children}</main>
      </div>
    </div>
  );
}