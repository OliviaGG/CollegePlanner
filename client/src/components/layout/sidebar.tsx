import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Calendar,
  GitBranch,
  University,
  FileText,
  Handshake,
  Upload,
  BookOpen,
  Plus,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Course Timeline", href: "/course-planning", icon: Calendar },
  { name: "Prerequisites", href: "/course-planning", icon: GitBranch },
  { name: "Transfer Paths", href: "/course-planning", icon: University },
];

const dataNavigation = [
  { name: "Course Import", href: "/course-import", icon: BookOpen },
  { name: "Transcripts", href: "/transcripts", icon: FileText },
  { name: "Assist.org Data", href: "/assist-data", icon: Handshake },
  { name: "Document Upload", href: "/transcripts", icon: Upload },
];

export default function Sidebar() {
  const [location] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <aside className="w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Overview
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed Units</span>
              <span className="font-medium" data-testid="sidebar-completed-units">
                {stats?.completedUnits || 0}/{stats?.targetUnits || 60}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats?.completionPercentage || 0}%` }}
              />
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Transfer Ready:</span>
            <span className="font-medium text-secondary ml-1" data-testid="sidebar-transfer-status">
              Spring 2025
            </span>
          </div>
        </div>

        {/* Planning Navigation */}
        <nav className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Planning
          </h3>

          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )} data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <item.icon className="w-5 h-5" />
                  <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                </div>
              </Link>
            );
          })}
          {/* Added Semester Planning Link */}
          <Link href="/semester-planning">
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
              location === "/semester-planning"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )} data-testid="nav-semester-planning">
              <Calendar className="w-5 h-5" />
              <span className={location === "/semester-planning" ? "font-medium" : ""}>Semester Planning</span>
            </div>
          </Link>
        </nav>

        {/* Data Management Navigation */}
        <nav className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Data
          </h3>

          {dataNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )} data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <item.icon className="w-5 h-5" />
                  <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="pt-4 border-t border-border">
          <Link href="/course-planning">
            <Button className="w-full" data-testid="sidebar-add-course">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}