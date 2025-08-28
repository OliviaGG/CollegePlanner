import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseForm from "@/components/courses/course-form";
import PrerequisiteChain from "@/components/courses/prerequisite-chain";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, CheckCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";

export default function CoursePlanning() {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been removed from your plan.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ courseId, isCompleted }: { courseId: string; isCompleted: boolean }) => {
      const response = await apiRequest("PUT", `/api/courses/${courseId}`, { isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course updated",
        description: "Course completion status has been updated.",
      });
    },
  });

  const categorizedCourses = {
    completed: courses.filter((course: Course) => course.isCompleted),
    inProgress: courses.filter((course: Course) => !course.isCompleted && course.semesterTaken),
    planned: courses.filter((course: Course) => !course.isCompleted && !course.semesterTaken),
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Planning</h2>
          <p className="text-muted-foreground">
            Manage your courses and track prerequisites
          </p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-course">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <CourseForm onSuccess={() => setIsAddCourseOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
          <TabsTrigger value="prerequisites" data-testid="tab-prerequisites">Prerequisites</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completed Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Completed ({categorizedCourses.completed.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorizedCourses.completed.map((course: Course) => (
                  <div key={course.id} className="p-3 border rounded-lg bg-secondary/5" data-testid={`course-completed-${course.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.courseCode}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{course.units} units</Badge>
                          {course.grade && <Badge variant="outline">{course.grade}</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCompletionMutation.mutate({ courseId: course.id, isCompleted: false })}
                        data-testid={`button-uncomplete-${course.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categorizedCourses.completed.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No completed courses yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* In Progress Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <span>In Progress ({categorizedCourses.inProgress.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorizedCourses.inProgress.map((course: Course) => (
                  <div key={course.id} className="p-3 border rounded-lg bg-accent/5" data-testid={`course-progress-${course.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.courseCode}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{course.units} units</Badge>
                          <Badge variant="outline">{course.semesterTaken}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCompletionMutation.mutate({ courseId: course.id, isCompleted: true })}
                          data-testid={`button-complete-${course.id}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(course.id)}
                          data-testid={`button-delete-${course.id}`}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {categorizedCourses.inProgress.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No courses in progress
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Planned Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Planned ({categorizedCourses.planned.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorizedCourses.planned.map((course: Course) => (
                  <div key={course.id} className="p-3 border rounded-lg" data-testid={`course-planned-${course.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.courseCode}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{course.units} units</Badge>
                          {course.category && <Badge variant="outline">{course.category}</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(course.id)}
                        data-testid={`button-delete-${course.id}`}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                {categorizedCourses.planned.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No planned courses
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prerequisites">
          <PrerequisiteChain courses={courses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
