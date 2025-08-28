import { Bell, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">SCC EduPlan</h1>
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
