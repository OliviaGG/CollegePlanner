import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function TransferTargets() {
  const { data: targetSchools } = useQuery({
    queryKey: ["/api/target-schools"],
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompletionPercentage = () => {
    // Mock completion percentage - in real app, calculate based on courses
    return Math.floor(Math.random() * 30) + 70;
  };

  const getColorClass = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-red-100 text-red-700", 
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-orange-100 text-orange-700"
    ];
    return colors[index % colors.length];
  };

  const targets = targetSchools?.map((school: any, index: number) => ({
    id: school.id,
    name: school.institutionName,
    major: school.major,
    initials: getInitials(school.institutionName),
    completion: getCompletionPercentage(),
    color: getColorClass(index),
  })) || [];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Transfer Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {targets.map((target) => (
          <div key={target.id} className="flex items-center justify-between p-3 rounded-lg border border-border" data-testid={`transfer-target-${target.id}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${target.color}`}>
                <span className="text-xs font-bold" data-testid={`target-initials-${target.id}`}>
                  {target.initials}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm" data-testid={`target-name-${target.id}`}>
                  {target.name}
                </div>
                <div className="text-xs text-muted-foreground" data-testid={`target-major-${target.id}`}>
                  {target.major}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary" data-testid={`target-completion-${target.id}`}>
                {target.completion}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full p-3 border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
          data-testid="button-add-transfer-target"
          onClick={() => window.location.href = '/profile'}
        >
          + Add Transfer Target
        </Button>
      </CardContent>
    </Card>
  );
}
