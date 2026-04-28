import { Bell, Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  return (
    <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, properties, agents…"
            className="w-full h-10 pl-10 pr-16 rounded-lg bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:bg-background focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button className="relative h-10 w-10 rounded-lg flex items-center justify-center hover:bg-muted focus:bg-muted focus:outline-none transition-colors">
            <Bell className="h-[18px] w-[18px] text-foreground/80" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
          </button>

          <div className="h-8 w-px bg-border mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-muted focus:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent hover:border-border/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                    AR
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-sm font-semibold">Ali Raza</p>
                  <p className="text-[11px] text-muted-foreground">Senior Agent</p>
                </div>
                <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-md shadow-elevated border border-border">
              <DropdownMenuLabel className="font-semibold text-sm">My account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border h-px" />
              <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors">Preferences</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground transition-colors">Billing</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border h-px" />
              <DropdownMenuItem className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger font-medium transition-colors">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
