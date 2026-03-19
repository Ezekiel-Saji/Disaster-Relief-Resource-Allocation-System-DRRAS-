import { Search, AlertCircle, LogOut, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { InAppNotification } from "@/lib/page-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  activeNotification?: InAppNotification | null;
}

export function TopNav({ activeNotification }: TopNavProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 w-full overflow-visible">
      <div className="flex-1 flex max-w-xl items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search disasters, areas, or centers..." 
            className="w-full pl-9 bg-background border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {activeNotification ? (
          <div className="relative self-center">
            <div
              className={`group/emergency flex items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                activeNotification.urgent
                  ? "notification-emergency border-red-300/90 bg-linear-to-r from-red-50 via-white to-red-50/80 text-red-700"
                  : "border-amber-200/90 bg-linear-to-r from-amber-50 via-white to-amber-50/80 text-amber-700"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  activeNotification.urgent
                    ? "border-red-200 bg-red-100/90"
                    : "border-amber-200 bg-amber-100/90"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      activeNotification.urgent ? "bg-red-500 emergency-dot" : "bg-amber-500"
                    }`}
                  />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] opacity-85">
                    Alert
                  </p>
                </div>
                <p className="text-sm font-bold leading-none">
                  Emergency Alert
                </p>
              </div>
              <div className="pointer-events-none invisible absolute right-0 top-[calc(100%+0.8rem)] z-30 w-[22rem] translate-y-2 rounded-3xl border border-border/70 bg-background/98 p-4 text-left text-foreground opacity-0 shadow-2xl ring-1 ring-black/5 transition-all duration-200 group-hover/emergency:visible group-hover/emergency:translate-y-0 group-hover/emergency:opacity-100">
                <div className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-border/70 bg-background/98" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        activeNotification.urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                        Emergency Alert
                      </p>
                      <p className="text-sm font-bold">{activeNotification.title}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {activeNotification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
            <AlertCircle className="w-4 h-4" />
            Emergency Alert
          </Button>
        )}
        <div className="h-8 w-px bg-border mx-2"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 h-auto p-1.5 hover:bg-muted rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none mb-1">{user?.email || "Admin User"}</p>
              <p className="text-xs text-muted-foreground leading-none uppercase">{user?.role || "System Admin"}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
