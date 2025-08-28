import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SemesterTimeline() {
  const semesters = [
    {
      id: "spring-2024",
      name: "Spring 2024",
      status: "current",
      courses: [
        { name: "MATH 1A - Calculus I", units: 4 },
        { name: "CS 31A - Intro to Programming", units: 4 },
        { name: "ENGL 1A - Composition", units: 4 },
        { name: "HIST 17A - US History", units: 3 },
      ],
      totalUnits: 15,
    },
    {
      id: "fall-2024",
      name: "Fall 2024",
      status: "planned",
      courses: [
        { name: "MATH 2A - Calculus II", units: 4 },
        { name: "CS 31B - Advanced Programming", units: 4 },
        { name: "PHYS 4A - Physics I", units: 4 },
        { name: "ENGL 1B - Critical Thinking", units: 4 },
      ],
      totalUnits: 16,
    },
    {
      id: "spring-2025",
      name: "Spring 2025",
      status: "transfer",
      courses: [],
      totalUnits: 0,
    },
  ];

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Semester Timeline</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="link" size="sm" data-testid="button-edit-timeline">
              Edit Timeline
            </Button>
            <Button size="sm" data-testid="button-add-semester">
              Add Semester
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {semesters.map((semester, index) => (
            <div key={semester.id} className="relative" data-testid={`semester-${semester.id}`}>
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    semester.status === "current" ? "bg-primary" :
                    semester.status === "planned" ? "bg-muted-foreground" :
                    "bg-accent"
                  }`} />
                  {index < semesters.length - 1 && (
                    <div className="w-px h-16 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium" data-testid={`semester-name-${semester.id}`}>
                      {semester.name}
                    </h4>
                    <Badge 
                      variant={
                        semester.status === "current" ? "default" :
                        semester.status === "planned" ? "secondary" :
                        "outline"
                      }
                      data-testid={`semester-status-${semester.id}`}
                    >
                      {semester.status === "current" ? "Current" :
                       semester.status === "planned" ? "Planned" :
                       "Transfer Ready"}
                    </Badge>
                  </div>
                  
                  {semester.courses.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {semester.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex items-center space-x-2" data-testid={`course-${semester.id}-${courseIndex}`}>
                            <div className={`w-2 h-2 rounded-full ${
                              semester.status === "current" ? "bg-secondary" : "bg-muted-foreground"
                            }`} />
                            <span>{course.name}</span>
                            <span className="text-muted-foreground">({course.units} units)</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Total: <span className="font-medium" data-testid={`semester-total-${semester.id}`}>
                          {semester.totalUnits} units
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ready to transfer to UC/CSU with completed requirements
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
