import { useQuery } from "@tanstack/react-query";
import ProgressOverview from "@/components/dashboard/progress-overview";
import SemesterTimeline from "@/components/dashboard/semester-timeline";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import TransferTargets from "@/components/dashboard/transfer-targets";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, <span data-testid="user-first-name">{(user as any)?.firstName || "Student"}</span>
        </h2>
        <p className="text-muted-foreground">
          Current Semester: <span className="font-medium">Spring 2024</span> • 
          <span className="ml-1" data-testid="user-institution">{(user as any)?.currentInstitution || "Sacramento City College"}</span> • 
          <span className="ml-1" data-testid="user-major">{(user as any)?.targetMajor || "Transfer Program"}</span>
        </p>
      </div>

      {/* Alerts Section */}
      <div className="space-y-3">
        <Alert className="bg-accent/10 border-accent/20">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <AlertDescription>
            <h4 className="font-medium text-accent-foreground mb-1">Registration Opens Soon</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Priority registration for Fall 2024 opens March 15th. Make sure your education plan is complete.
            </p>
            <button className="text-sm text-accent hover:underline" data-testid="button-view-registration">
              View Registration Info
            </button>
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-destructive/10 border-destructive/20">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <h4 className="font-medium text-destructive-foreground mb-1">Prerequisites Missing</h4>
            <p className="text-sm text-muted-foreground mb-2">
              MATH 2A requires completion of MATH 1A. Update your plan to include prerequisites.
            </p>
            <button className="text-sm text-destructive hover:underline" data-testid="button-fix-prerequisites">
              Fix Prerequisites
            </button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Progress */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressOverview stats={stats as any} />
          <SemesterTimeline />
        </div>

        {/* Right Column: Quick Actions & Info */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingDeadlines />
          <TransferTargets />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
