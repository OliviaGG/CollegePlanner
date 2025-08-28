import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import sccLogoUrl from "@assets/scc-logo-emblem-white.png";

export default function Header() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src={sccLogoUrl} 
              alt="Sacramento City College Logo" 
              className="w-10 h-10 object-contain"
              data-testid="scc-logo"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary leading-tight font-heading">SCC EduPlan</h1>
              <span className="text-xs text-muted-foreground font-serif">Sacramento City College</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium" data-testid="user-initials">
                {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0] || "U"}
              </span>
            </div>
            <span className="text-sm font-medium" data-testid="user-full-name">
              {(user as any)?.firstName} {(user as any)?.lastName || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}