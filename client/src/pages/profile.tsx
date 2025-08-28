
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, School, User, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TargetSchool {
  id: string;
  institutionId: string;
  institutionName: string;
  major: string;
  targetDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  notes?: string;
}

export default function Profile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingTarget, setIsAddingTarget] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: institutions } = useQuery({
    queryKey: ["/api/institutions"],
  });

  const { data: targetSchools } = useQuery({
    queryKey: ["/api/target-schools"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditingProfile(false);
      toast({ title: "Profile updated successfully!" });
    },
  });

  const addTargetSchoolMutation = useMutation({
    mutationFn: async (targetData: any) => {
      const response = await fetch("/api/target-schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-schools"] });
      setIsAddingTarget(false);
      toast({ title: "Target school added successfully!" });
    },
  });

  const deleteTargetSchoolMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const response = await fetch(`/api/target-schools/${targetId}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-schools"] });
      toast({ title: "Target school removed" });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      currentInstitution: formData.get("currentInstitution"),
      targetMajor: formData.get("targetMajor"),
    };
    updateProfileMutation.mutate(profileData);
  };

  const handleAddTargetSchool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedInstitution = institutions?.find(
      (inst: any) => inst.id === formData.get("institutionId")
    );
    
    const targetData = {
      institutionId: formData.get("institutionId"),
      institutionName: selectedInstitution?.name,
      major: formData.get("major"),
      targetDate: formData.get("targetDate"),
      priority: formData.get("priority"),
      notes: formData.get("notes"),
    };
    addTargetSchoolMutation.mutate(targetData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-heading">
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your personal information and transfer goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user?.firstName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user?.lastName}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currentInstitution">Current Institution</Label>
                  <Input
                    id="currentInstitution"
                    name="currentInstitution"
                    defaultValue={user?.currentInstitution}
                  />
                </div>
                <div>
                  <Label htmlFor="targetMajor">Target Major</Label>
                  <Input
                    id="targetMajor"
                    name="targetMajor"
                    defaultValue={user?.targetMajor}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">First Name</Label>
                    <p className="font-medium">{user?.firstName || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Name</Label>
                    <p className="font-medium">{user?.lastName || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Institution</Label>
                  <p className="font-medium">{user?.currentInstitution || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Target Major</Label>
                  <p className="font-medium">{user?.targetMajor || "Not set"}</p>
                </div>
                <Button onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Schools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Transfer Targets</span>
              </div>
              <Dialog open={isAddingTarget} onOpenChange={setIsAddingTarget}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Target
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Target School</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTargetSchool} className="space-y-4">
                    <div>
                      <Label htmlFor="institutionId">Institution</Label>
                      <Select name="institutionId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions?.map((inst: any) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              {inst.name} ({inst.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        name="major"
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetDate">Target Transfer Date</Label>
                      <Input
                        id="targetDate"
                        name="targetDate"
                        type="date"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority" defaultValue="MEDIUM">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        name="notes"
                        placeholder="Any additional notes..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={addTargetSchoolMutation.isPending}>
                        Add Target
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingTarget(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {targetSchools?.length > 0 ? (
                targetSchools.map((target: TargetSchool) => (
                  <div
                    key={target.id}
                    className="p-3 border rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{target.institutionName}</h4>
                        <Badge
                          variant={
                            target.priority === "HIGH"
                              ? "destructive"
                              : target.priority === "MEDIUM"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {target.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Major: {target.major}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Target Date: {new Date(target.targetDate).toLocaleDateString()}
                      </p>
                      {target.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {target.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTargetSchoolMutation.mutate(target.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p>No target schools added yet</p>
                  <p className="text-sm">Click "Add Target" to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
