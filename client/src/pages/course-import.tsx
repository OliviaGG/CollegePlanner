import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Plus, X, BookOpen, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const courseSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  title: z.string().min(1, "Course title is required"),
  units: z.coerce.number().min(0.5).max(6),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  prerequisites: z.string().optional()
});

const bulkCourseSchema = z.object({
  coursesText: z.string().min(1, "Course data is required")
});

type CourseFormData = z.infer<typeof courseSchema>;
type BulkCourseFormData = z.infer<typeof bulkCourseSchema>;

export default function CourseImport() {
  const [importMode, setImportMode] = useState<"single" | "bulk">("single");
  const [previewCourses, setPreviewCourses] = useState<CourseFormData[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const singleForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseCode: "",
      title: "",
      units: 3,
      description: "",
      category: "",
      subcategory: "",
      prerequisites: ""
    }
  });

  const bulkForm = useForm<BulkCourseFormData>({
    resolver: zodResolver(bulkCourseSchema),
    defaultValues: {
      coursesText: ""
    }
  });

  const createCourseMutation = useMutation({
    mutationFn: async (course: CourseFormData) => {
      const response = await apiRequest("POST", "/api/courses", {
        ...course,
        prerequisites: course.prerequisites ? course.prerequisites.split(",").map(p => p.trim()) : [],
        userId: "demo-user-id"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course imported successfully",
        description: "The course has been added to your catalog."
      });
      singleForm.reset();
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import the course. Please try again.",
        variant: "destructive"
      });
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (courses: CourseFormData[]) => {
      const results = await Promise.all(courses.map(async course => {
        const response = await apiRequest("POST", "/api/courses", {
          ...course,
          prerequisites: course.prerequisites ? course.prerequisites.split(",").map(p => p.trim()) : [],
          userId: "demo-user-id"
        });
        return response.json();
      }));
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Bulk import successful",
        description: `${results.length} courses imported successfully.`
      });
      setPreviewCourses([]);
      bulkForm.reset();
    },
    onError: () => {
      toast({
        title: "Bulk import failed",
        description: "Some courses failed to import. Please check the format and try again.",
        variant: "destructive"
      });
    }
  });

  const onSingleSubmit = (data: CourseFormData) => {
    createCourseMutation.mutate(data);
  };

  const parseBulkCourses = (text: string): CourseFormData[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const courses: CourseFormData[] = [];

    for (const line of lines) {
      // Support multiple formats:
      // Format 1: "MATH 300|College Algebra|4|Prerequisites: MATH 120"
      // Format 2: "ENGL 101 - English Composition (3 units)"
      // Format 3: "BIOL 400, Human Anatomy, 4 units, Prerequisites: BIOL 310"
      
      try {
        let courseCode = "", title = "", units = 3, prerequisites = "";
        
        if (line.includes('|')) {
          const parts = line.split('|');
          courseCode = parts[0]?.trim() || "";
          title = parts[1]?.trim() || "";
          units = parseInt(parts[2]?.trim() || "3") || 3;
          prerequisites = parts[3]?.replace(/prerequisites?:\s*/i, "").trim() || "";
        } else if (line.includes(' - ')) {
          const [codeSection, rest] = line.split(' - ');
          courseCode = codeSection.trim();
          const unitsMatch = rest.match(/\((\d+(?:\.\d+)?)\s*units?\)/i);
          units = unitsMatch ? parseFloat(unitsMatch[1]) : 3;
          title = rest.replace(/\(\d+(?:\.\d+)?\s*units?\)/i, "").trim();
        } else if (line.includes(',')) {
          const parts = line.split(',').map(p => p.trim());
          courseCode = parts[0] || "";
          title = parts[1] || "";
          const unitsText = parts[2] || "";
          units = parseInt(unitsText.replace(/\D/g, "")) || 3;
          prerequisites = parts[3]?.replace(/prerequisites?:\s*/i, "").trim() || "";
        }

        if (courseCode && title) {
          courses.push({
            courseCode,
            title,
            units,
            description: "",
            category: "MAJOR_PREP",
            subcategory: courseCode.split(' ')[0] || "",
            prerequisites
          });
        }
      } catch (error) {
        console.warn("Failed to parse line:", line);
      }
    }

    return courses;
  };

  const onBulkPreview = (data: BulkCourseFormData) => {
    const parsed = parseBulkCourses(data.coursesText);
    setPreviewCourses(parsed);
  };

  const onBulkImport = () => {
    if (previewCourses.length > 0) {
      bulkCreateMutation.mutate(previewCourses);
    }
  };

  const loadSampleSCCData = () => {
    const sampleSCCCourses = `MATH 300|College Algebra|4|MATH 120
MATH 310|Trigonometry|4|MATH 300
MATH 400|Calculus I|5|MATH 310
MATH 410|Calculus II|5|MATH 400
ENGL 101|English Composition|3|
ENGL 102|Critical Thinking and Writing|3|ENGL 101
CHEM 305|General Chemistry I|5|MATH 300
CHEM 306|General Chemistry II|5|CHEM 305
PHYS 350|General Physics I|4|MATH 310
PHYS 360|General Physics II|4|PHYS 350, MATH 400
BIOL 300|Human Biology|3|
BIOL 310|Anatomy and Physiology I|4|BIOL 300
BIOL 320|Anatomy and Physiology II|4|BIOL 310
HIST 307|History of the United States I|3|
HIST 308|History of the United States II|3|
PSYC 300|General Psychology|3|
SPAN 101|Elementary Spanish I|4|
SPAN 102|Elementary Spanish II|4|SPAN 101
ART 300|Art Appreciation|3|
MUSC 300|Music Appreciation|3|
ECON 302|Principles of Macroeconomics|3|
ECON 304|Principles of Microeconomics|3|
POLI 301|Introduction to Government|3|
GEOG 300|Physical Geography|3|
ANTH 310|Cultural Anthropology|3|`;
    
    bulkForm.setValue("coursesText", sampleSCCCourses);
    const parsed = parseBulkCourses(sampleSCCCourses);
    setPreviewCourses(parsed);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-scc-cardinal" data-testid="text-page-title">SCC Course Import</h1>
          <p className="text-muted-foreground mt-2">
            Import course data from the Sacramento City College 2025-2026 catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={importMode === "single" ? "default" : "outline"}
            onClick={() => setImportMode("single")}
            data-testid="button-mode-single"
          >
            <Plus className="w-4 h-4 mr-2" />
            Single Course
          </Button>
          <Button
            variant={importMode === "bulk" ? "default" : "outline"}
            onClick={() => setImportMode("bulk")}
            data-testid="button-mode-bulk"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      </div>

      {importMode === "single" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Add SCC Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={singleForm.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SCC Course Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MATH 300" {...field} data-testid="input-course-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={singleForm.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Units</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" min="0.5" max="6" {...field} data-testid="input-units" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={singleForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GENERAL_ED">General Education</SelectItem>
                            <SelectItem value="MAJOR_PREP">Major Preparation</SelectItem>
                            <SelectItem value="ELECTIVE">Elective</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={singleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., College Algebra" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Course description from the catalog..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name="prerequisites"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prerequisites</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., MATH 120, ENGL 101"
                          {...field}
                          data-testid="input-prerequisites"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={createCourseMutation.isPending}
                  data-testid="button-import-single"
                >
                  {createCourseMutation.isPending ? "Importing..." : "Import Course"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {importMode === "bulk" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bulk Import Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Supported Formats:</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• <code>MATH 300|College Algebra|4|MATH 120</code></p>
                  <p>• <code>ENGL 101 - English Composition (3 units)</code></p>
                  <p>• <code>BIOL 400, Human Anatomy, 4 units, Prerequisites: BIOL 310</code></p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadSampleSCCData}
                  data-testid="button-load-sample"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Load Sample SCC Data
                </Button>
              </div>

              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkPreview)} className="space-y-4">
                  <FormField
                    control={bulkForm.control}
                    name="coursesText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste course data from SCC catalog here..."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                            data-testid="textarea-bulk-courses"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" data-testid="button-preview-bulk">
                    Preview Courses
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {previewCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Preview ({previewCourses.length} courses)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                  {previewCourses.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg"
                      data-testid={`preview-course-${index}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{course.courseCode}</Badge>
                          <Badge variant="secondary">{course.units} units</Badge>
                          {course.subcategory && (
                            <Badge variant="outline">{course.subcategory}</Badge>
                          )}
                        </div>
                        <h4 className="font-medium">{course.title}</h4>
                        {course.prerequisites && (
                          <p className="text-sm text-muted-foreground">
                            Prerequisites: {course.prerequisites}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = previewCourses.filter((_, i) => i !== index);
                          setPreviewCourses(updated);
                        }}
                        data-testid={`button-remove-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {previewCourses.length} courses ready to import
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewCourses([])}
                      data-testid="button-clear-preview"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={onBulkImport}
                      disabled={bulkCreateMutation.isPending}
                      data-testid="button-import-bulk"
                    >
                      {bulkCreateMutation.isPending ? "Importing..." : "Import All Courses"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}