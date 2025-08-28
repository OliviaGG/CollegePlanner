import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ArrowRight, CheckCircle, Clock } from "lucide-react";
import type { Course } from "@shared/schema";

interface PrerequisiteChainProps {
  courses: Course[];
}

export default function PrerequisiteChain({ courses }: PrerequisiteChainProps) {
  const prerequisiteMap = useMemo(() => {
    const map = new Map<string, Course[]>();
    
    courses.forEach(course => {
      if (course.prerequisites && course.prerequisites.length > 0) {
        const prereqCourses = course.prerequisites
          .map(prereqCode => courses.find(c => c.courseCode === prereqCode))
          .filter((c): c is Course => c !== undefined);
        
        if (prereqCourses.length > 0) {
          map.set(course.id, prereqCourses);
        }
      }
    });
    
    return map;
  }, [courses]);

  const coursesWithPrereqs = courses.filter(course => 
    prerequisiteMap.has(course.id)
  );

  const getStatusIcon = (course: Course) => {
    if (course.isCompleted) {
      return <CheckCircle className="h-4 w-4 text-secondary" />;
    } else if (course.semesterTaken) {
      return <Clock className="h-4 w-4 text-accent" />;
    }
    return <GitBranch className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = (course: Course) => {
    if (course.isCompleted) {
      return "bg-secondary/5 border-secondary/20";
    } else if (course.semesterTaken) {
      return "bg-accent/5 border-accent/20";
    }
    return "bg-muted/5 border-border";
  };

  if (coursesWithPrereqs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Prerequisites Chain</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No prerequisite relationships found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add prerequisite information to courses to see dependency chains
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5" />
          <span>Prerequisites Chain</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {coursesWithPrereqs.map(course => {
            const prerequisites = prerequisiteMap.get(course.id) || [];
            
            return (
              <div key={course.id} className="space-y-3" data-testid={`prereq-chain-${course.id}`}>
                {/* Course with prerequisites */}
                <div className={`p-4 rounded-lg border ${getStatusColor(course)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(course)}
                        <h4 className="font-medium" data-testid={`course-title-${course.id}`}>
                          {course.courseCode} - {course.title}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{course.units} units</Badge>
                        {course.category && (
                          <Badge variant="outline">{course.category}</Badge>
                        )}
                        {course.isCompleted && (
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                    <span>Requires completion of:</span>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    {prerequisites.map(prereq => (
                      <div 
                        key={prereq.id} 
                        className={`p-3 rounded-md border ${getStatusColor(prereq)}`}
                        data-testid={`prereq-${prereq.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(prereq)}
                            <span className="font-medium text-sm">
                              {prereq.courseCode} - {prereq.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {prereq.units} units
                            </Badge>
                            {prereq.isCompleted ? (
                              <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs">
                                ✓ Complete
                              </Badge>
                            ) : prereq.semesterTaken ? (
                              <Badge variant="outline" className="bg-accent/10 text-accent text-xs">
                                In Progress
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Not Taken
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Status */}
                <div className="ml-6">
                  {prerequisites.every(p => p.isCompleted) ? (
                    <div className="flex items-center space-x-2 text-sm text-secondary">
                      <CheckCircle className="h-4 w-4" />
                      <span>All prerequisites completed - Ready to take</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-destructive">
                      <Clock className="h-4 w-4" />
                      <span>
                        {prerequisites.filter(p => !p.isCompleted).length} prerequisite(s) remaining
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/5 rounded-lg border">
          <h4 className="font-medium mb-2">Prerequisite Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Courses with Prerequisites:</span>
              <div className="font-medium" data-testid="prereq-summary-total">
                {coursesWithPrereqs.length}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Prerequisites Met:</span>
              <div className="font-medium text-secondary" data-testid="prereq-summary-met">
                {coursesWithPrereqs.filter(course => {
                  const prereqs = prerequisiteMap.get(course.id) || [];
                  return prereqs.every(p => p.isCompleted);
                }).length}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Prerequisites Pending:</span>
              <div className="font-medium text-accent" data-testid="prereq-summary-pending">
                {coursesWithPrereqs.filter(course => {
                  const prereqs = prerequisiteMap.get(course.id) || [];
                  return !prereqs.every(p => p.isCompleted);
                }).length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
