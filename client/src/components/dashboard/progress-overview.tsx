import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgressOverviewProps {
  stats?: {
    completedUnits: number;
    targetUnits: number;
    completionPercentage: number;
  };
}

export default function ProgressOverview({ stats }: ProgressOverviewProps) {
  const gePercentage = 60;
  const majorPercentage = 50;
  const totalPercentage = stats?.completionPercentage || 70;

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Transfer Progress</CardTitle>
          <Button variant="link" size="sm" data-testid="button-view-detailed-progress">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* General Education */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--muted))" 
                  strokeWidth="8" 
                  fill="none"
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="226" 
                  strokeDashoffset={226 - (226 * gePercentage / 100)} 
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" data-testid="progress-ge-percentage">{gePercentage}%</span>
              </div>
            </div>
            <h4 className="font-medium">General Ed</h4>
            <p className="text-sm text-muted-foreground" data-testid="progress-ge-units">18/30 units</p>
          </div>
          
          {/* Major Prep */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--muted))" 
                  strokeWidth="8" 
                  fill="none"
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="226" 
                  strokeDashoffset={226 - (226 * majorPercentage / 100)} 
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" data-testid="progress-major-percentage">{majorPercentage}%</span>
              </div>
            </div>
            <h4 className="font-medium">Major Prep</h4>
            <p className="text-sm text-muted-foreground" data-testid="progress-major-units">12/24 units</p>
          </div>
          
          {/* Total Units */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--muted))" 
                  strokeWidth="8" 
                  fill="none"
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="226" 
                  strokeDashoffset={226 - (226 * totalPercentage / 100)} 
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" data-testid="progress-total-percentage">{totalPercentage}%</span>
              </div>
            </div>
            <h4 className="font-medium">Total Units</h4>
            <p className="text-sm text-muted-foreground" data-testid="progress-total-units">
              {stats?.completedUnits || 42}/{stats?.targetUnits || 60} units
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
