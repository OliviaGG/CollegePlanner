import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@shared/schema";

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/activity"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "CREATE_COURSE":
      case "CREATE_PLAN":
        return Plus;
      case "UPLOAD_DOCUMENT":
        return Upload;
      case "UPDATE_COURSE":
        return CheckCircle;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "CREATE_COURSE":
      case "CREATE_PLAN":
        return "bg-secondary/10 text-secondary";
      case "UPLOAD_DOCUMENT":
        return "bg-primary/10 text-primary";
      case "UPDATE_COURSE":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity: ActivityLog) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm" data-testid={`activity-description-${activity.id}`}>
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                    {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : "Recently"}
                  </p>
                </div>
              </div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start by adding courses or uploading documents
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
