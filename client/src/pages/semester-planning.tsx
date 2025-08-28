
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, BookOpen, Clock, CheckCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Course } from "@shared/schema";

interface SemesterCourse {
  id: string;
  courseCode: string;
  title: string;
  units: number;
  isCompleted: boolean;
  grade?: string;
}

interface Semester {
  id: string;
  term: "SPRING" | "SUMMER" | "FALL";
  year: number;
  courses: SemesterCourse[];
  totalUnits: number;
  isCompleted: boolean;
}

export default function SemesterPlanning() {
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Mock semester data - in real app this would come from API
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: "spring-2024",
      term: "SPRING",
      year: 2024,
      courses: [
        { id: "1", courseCode: "MATH 300", title: "College Algebra", units: 4, isCompleted: true, grade: "A" },
        { id: "2", courseCode: "ENGL 300", title: "College Composition", units: 3, isCompleted: true, grade: "B+" },
      ],
      totalUnits: 7,
      isCompleted: true
    },
    {
      id: "fall-2024",
      term: "FALL",
      year: 2024,
      courses: [
        { id: "3", courseCode: "MATH 310", title: "Pre-Calculus", units: 4, isCompleted: false },
        { id: "4", courseCode: "CS 300", title: "Intro to Programming", units: 4, isCompleted: false },
      ],
      totalUnits: 8,
      isCompleted: false
    }
  ]);

  const semesterForm = useForm({
    defaultValues: {
      term: "",
      year: new Date().getFullYear(),
    }
  });

  const courseForm = useForm({
    defaultValues: {
      courseCode: "",
      title: "",
      units: 3,
      semesterId: "",
    }
  });

  const onAddSemester = (data: any) => {
    const newSemester: Semester = {
      id: `${data.term.toLowerCase()}-${data.year}`,
      term: data.term,
      year: data.year,
      courses: [],
      totalUnits: 0,
      isCompleted: false
    };
    setSemesters([...semesters, newSemester].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const termOrder = { SPRING: 1, SUMMER: 2, FALL: 3 };
      return termOrder[a.term] - termOrder[b.term];
    }));
    setIsAddSemesterOpen(false);
    semesterForm.reset();
    toast({
      title: "Semester added",
      description: `${data.term} ${data.year} has been added to your plan.`,
    });
  };

  const onAddCourse = (data: any) => {
    const newCourse: SemesterCourse = {
      id: Math.random().toString(36).substr(2, 9),
      courseCode: data.courseCode,
      title: data.title,
      units: data.units,
      isCompleted: false
    };

    setSemesters(prev => prev.map(sem => {
      if (sem.id === data.semesterId) {
        const updatedCourses = [...sem.courses, newCourse];
        return {
          ...sem,
          courses: updatedCourses,
          totalUnits: updatedCourses.reduce((sum, course) => sum + course.units, 0)
        };
      }
      return sem;
    }));

    setIsAddCourseOpen(false);
    courseForm.reset();
    toast({
      title: "Course added",
      description: `${data.courseCode} has been added to your semester.`,
    });
  };

  const toggleCourseCompletion = (semesterId: string, courseId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semesterId) {
        const updatedCourses = sem.courses.map(course => 
          course.id === courseId 
            ? { ...course, isCompleted: !course.isCompleted }
            : course
        );
        return { ...sem, courses: updatedCourses };
      }
      return sem;
    }));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semesterId) {
        const updatedCourses = sem.courses.filter(course => course.id !== courseId);
        return {
          ...sem,
          courses: updatedCourses,
          totalUnits: updatedCourses.reduce((sum, course) => sum + course.units, 0)
        };
      }
      return sem;
    }));
  };

  const getTermDisplay = (term: string) => {
    return term.charAt(0) + term.slice(1).toLowerCase();
  };

  if (coursesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <h2 className="text-3xl font-bold tracking-tight">Semester Planning</h2>
          <p className="text-muted-foreground">
            Organize your courses by semester and year
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={semesters.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Course to Semester</DialogTitle>
              </DialogHeader>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onAddCourse)} className="space-y-4">
                  <FormField
                    control={courseForm.control}
                    name="semesterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {semesters.map(semester => (
                              <SelectItem key={semester.id} value={semester.id}>
                                {getTermDisplay(semester.term)} {semester.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={courseForm.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MATH 300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={courseForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., College Algebra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={courseForm.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Units</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="6" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Add Course</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSemesterOpen} onOpenChange={setIsAddSemesterOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Semester</DialogTitle>
              </DialogHeader>
              <Form {...semesterForm}>
                <form onSubmit={semesterForm.handleSubmit(onAddSemester)} className="space-y-4">
                  <FormField
                    control={semesterForm.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SPRING">Spring</SelectItem>
                            <SelectItem value="SUMMER">Summer</SelectItem>
                            <SelectItem value="FALL">Fall</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={semesterForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2020" 
                            max="2030" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Add Semester</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {semesters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No semesters planned yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first semester to organize your courses
            </p>
            <Button onClick={() => setIsAddSemesterOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Add Your First Semester
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((semester) => (
            <Card key={semester.id} className={`${semester.isCompleted ? 'bg-secondary/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {semester.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>{getTermDisplay(semester.term)} {semester.year}</span>
                  </CardTitle>
                  <Badge variant={semester.isCompleted ? "secondary" : "outline"}>
                    {semester.totalUnits} units
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {semester.courses.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No courses added</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        courseForm.setValue("semesterId", semester.id);
                        setIsAddCourseOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Course
                    </Button>
                  </div>
                ) : (
                  <>
                    {semester.courses.map((course) => (
                      <div key={course.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm">{course.courseCode}</h4>
                              <Badge variant="outline" className="text-xs">
                                {course.units} units
                              </Badge>
                              {course.isCompleted && course.grade && (
                                <Badge variant="secondary" className="text-xs">
                                  {course.grade}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCourseCompletion(semester.id, course.id)}
                              className="h-8 w-8 p-0"
                            >
                              {course.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-secondary" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCourse(semester.id, course.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        courseForm.setValue("semesterId", semester.id);
                        setIsAddCourseOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
