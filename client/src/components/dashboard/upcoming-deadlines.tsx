import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpcomingDeadlines() {
  const deadlines = [
    {
      id: "registration",
      title: "Registration Priority",
      date: "March 15, 2024",
      daysRemaining: 5,
      priority: "high",
    },
    {
      id: "financial-aid",
      title: "Financial Aid Application",
      date: "March 30, 2024",
      daysRemaining: 20,
      priority: "medium",
    },
    {
      id: "uc-application",
      title: "UC Application",
      date: "November 30, 2024",
      daysRemaining: 260,
      priority: "low",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-accent";
      case "low": return "bg-primary";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline.id} className="flex items-start space-x-3" data-testid={`deadline-${deadline.id}`}>
            <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(deadline.priority)}`} />
            <div className="flex-1">
              <div className="font-medium text-sm" data-testid={`deadline-title-${deadline.id}`}>
                {deadline.title}
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`deadline-date-${deadline.id}`}>
                {deadline.date}
              </div>
              <div className="text-xs text-muted-foreground" data-testid={`deadline-remaining-${deadline.id}`}>
                {deadline.daysRemaining} days remaining
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
