import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertArticulationAgreementSchema } from "@shared/schema";
import { Info, ExternalLink, Plus, Trash2 } from "lucide-react";
import { fetchAssistInstitutions, fetchAgreements } from "@/lib/assist-api";
import type { Institution } from "@shared/schema";

const assistFormSchema = insertArticulationAgreementSchema.omit({ userId: true });

type AssistFormData = z.infer<typeof assistFormSchema>;

interface AssistFormProps {
  institutions: Institution[];
  onSuccess: () => void;
}

interface CourseMapping {
  id: string;
  sendingCourse: string;
  receivingCourse: string;
  units: number;
  notes?: string;
}

export default function AssistForm({ institutions, onSuccess }: AssistFormProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssistFormData>({
    resolver: zodResolver(assistFormSchema),
    defaultValues: {
      academicYear: "2023-2024",
      sourceType: "MANUAL",
      agreementData: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssistFormData) => {
      const response = await apiRequest("POST", "/api/articulation-agreements", {
        ...data,
        agreementData: {
          courseMappings,
          lastUpdated: new Date().toISOString(),
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articulation-agreements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Agreement added",
        description: "The articulation agreement has been saved to your profile.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save articulation agreement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addCourseMapping = () => {
    const newMapping: CourseMapping = {
      id: Math.random().toString(36).substring(2),
      sendingCourse: "",
      receivingCourse: "",
      units: 3,
    };
    setCourseMappings([...courseMappings, newMapping]);
  };

  const updateCourseMapping = (id: string, updates: Partial<CourseMapping>) => {
    setCourseMappings(prev => 
      prev.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const removeCourseMapping = (id: string) => {
    setCourseMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const loadFromAssistApi = async () => {
    const sendingId = form.getValues("sendingInstitutionId");
    const receivingId = form.getValues("receivingInstitutionId");
    const academicYear = form.getValues("academicYear");

    if (!sendingId || !receivingId || !academicYear) {
      toast({
        title: "Missing Information",
        description: "Please select sending and receiving institutions and academic year first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingApi(true);
    try {
      // Try to fetch from Assist.org API (this will likely fail due to API restrictions)
      const agreements = await fetchAgreements({
        sendingInstitutionId: institutions.find(i => i.id === sendingId)?.assistOrgId || "",
        receivingInstitutionId: institutions.find(i => i.id === receivingId)?.assistOrgId || "",
        academicYearId: "72", // This would need to be mapped from academic year
        categoryCode: "major"
      });

      if (agreements && agreements.length > 0) {
        form.setValue("sourceType", "API");
        form.setValue("assistOrgKey", agreements[0].key);
        toast({
          title: "Data loaded",
          description: "Agreement data has been loaded from Assist.org API.",
        });
      } else {
        toast({
          title: "No data found",
          description: "No articulation agreement found for the selected institutions and year.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "API Error",
        description: "Unable to load data from Assist.org. API access may be restricted. Please enter data manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const onSubmit = async (data: AssistFormData) => {
    if (activeTab === "manual" && courseMappings.length === 0) {
      toast({
        title: "No course mappings",
        description: "Please add at least one course mapping or switch to API import.",
        variant: "destructive",
      });
      return;
    }

    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <h4 className="font-medium">Assist.org Integration Status</h4>
            <p className="text-sm">
              API access is currently limited to educational institutions. 
              Manual data entry is the recommended approach for individual users.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://assist.org" target="_blank" rel="noopener noreferrer" data-testid="link-assist-help">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Assist.org for Reference
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sendingInstitutionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From (Community College)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sending-institution">
                        <SelectValue placeholder="Select community college" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutions.filter(inst => inst.type === "CCC").map(inst => (
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

            <FormField
              control={form.control}
              name="receivingInstitutionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To (Transfer Institution)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-receiving-institution">
                        <SelectValue placeholder="Select UC/CSU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutions.filter(inst => ["UC", "CSU"].includes(inst.type)).map(inst => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2023-2024" {...field} data-testid="input-academic-year" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Major (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} data-testid="input-major" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Data Entry Methods */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="manual" data-testid="tab-manual-entry">Manual Entry</TabsTrigger>
              <TabsTrigger value="api" data-testid="tab-api-import">API Import</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Course Mappings</h4>
                <Button type="button" onClick={addCourseMapping} size="sm" data-testid="button-add-mapping">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>

              {courseMappings.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No course mappings added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add course equivalencies between institutions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseMappings.map((mapping) => (
                    <div key={mapping.id} className="p-4 border rounded-lg space-y-3" data-testid={`mapping-${mapping.id}`}>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Course Mapping</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourseMapping(mapping.id)}
                          data-testid={`remove-mapping-${mapping.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium">Community College Course</label>
                          <Input
                            placeholder="e.g., MATH 1A"
                            value={mapping.sendingCourse}
                            onChange={(e) => updateCourseMapping(mapping.id, { sendingCourse: e.target.value })}
                            data-testid={`input-sending-course-${mapping.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Transfer Institution Course</label>
                          <Input
                            placeholder="e.g., MATH 21A"
                            value={mapping.receivingCourse}
                            onChange={(e) => updateCourseMapping(mapping.id, { receivingCourse: e.target.value })}
                            data-testid={`input-receiving-course-${mapping.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Units</label>
                          <Input
                            type="number"
                            min="1"
                            max="6"
                            value={mapping.units}
                            onChange={(e) => updateCourseMapping(mapping.id, { units: parseInt(e.target.value) || 3 })}
                            data-testid={`input-units-${mapping.id}`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <Input
                          placeholder="Additional requirements or notes"
                          value={mapping.notes || ""}
                          onChange={(e) => updateCourseMapping(mapping.id, { notes: e.target.value })}
                          data-testid={`input-notes-${mapping.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  API import requires valid institution selection and may not be available due to access restrictions.
                </AlertDescription>
              </Alert>

              <Button
                type="button"
                onClick={loadFromAssistApi}
                disabled={isLoadingApi}
                data-testid="button-load-api-data"
              >
                {isLoadingApi ? "Loading..." : "Load from Assist.org API"}
              </Button>

              <FormField
                control={form.control}
                name="assistOrgKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assist.org Agreement Key (if available)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 25330408" {...field} data-testid="input-assist-key" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-agreement">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              data-testid="button-save-agreement"
            >
              {createMutation.isPending ? "Saving..." : "Save Agreement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
