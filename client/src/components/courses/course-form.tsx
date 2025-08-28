import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCourseSchema } from "@shared/schema";

const courseFormSchema = insertCourseSchema.extend({
  prerequisites: z.array(z.string()).optional(),
}).omit({ userId: true });

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  onSuccess: () => void;
}

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: institutions = [] } = useQuery({
    queryKey: ["/api/institutions"],
  });

  const { data: existingCourses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      courseCode: "",
      title: "",
      units: 3,
      description: "",
      category: "GENERAL_ED",
      isCompleted: false,
      prerequisites: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Course added",
        description: "The course has been added to your plan.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="courseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., MATH 1A" {...field} data-testid="input-course-code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    data-testid="input-units"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Calculus I" {...field} data-testid="input-course-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Course description..." 
                  className="resize-none" 
                  {...field} 
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
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

          <FormField
            control={form.control}
            name="institutionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-institution">
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {institutions.map((inst: any) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isCompleted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-completed"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Course completed</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Check if you have already completed this course
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-course">
            {isSubmitting ? "Adding..." : "Add Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
