import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssistForm from "@/components/assist/assist-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, ExternalLink, Info, Handshake } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ArticulationAgreement } from "@shared/schema";

export default function AssistData() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["/api/articulation-agreements"],
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["/api/institutions"],
  });

  const manualAgreements = agreements.filter((agreement: ArticulationAgreement) => agreement.sourceType === "MANUAL");
  const apiAgreements = agreements.filter((agreement: ArticulationAgreement) => agreement.sourceType === "API");
  const uploadedAgreements = agreements.filter((agreement: ArticulationAgreement) => agreement.sourceType === "UPLOAD");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h2 className="text-3xl font-bold tracking-tight">Assist.org Data</h2>
          <p className="text-muted-foreground">
            Manage articulation agreements and transfer pathways
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-agreement">
              <Plus className="h-4 w-4 mr-2" />
              Add Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Articulation Agreement</DialogTitle>
            </DialogHeader>
            <AssistForm institutions={institutions} onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* API Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <h4 className="font-medium">Assist.org API Status</h4>
            <p className="text-sm">
              API access is currently limited to educational institutions. Public access is expected during the 2026-2027 academic year.
              For now, you can manually input articulation data or upload PDF agreements.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://assist.org" target="_blank" rel="noopener noreferrer" data-testid="link-assist-org">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Assist.org
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="agreements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agreements" data-testid="tab-agreements">Agreements</TabsTrigger>
          <TabsTrigger value="institutions" data-testid="tab-institutions">Institutions</TabsTrigger>
        </TabsList>

        <TabsContent value="agreements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Manual Agreements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  <span>Manual Entry ({manualAgreements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {manualAgreements.map((agreement: ArticulationAgreement) => (
                  <div key={agreement.id} className="p-3 border rounded-lg" data-testid={`agreement-manual-${agreement.id}`}>
                    <div className="space-y-2">
                      <h4 className="font-medium">{agreement.major || "General Transfer"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {institutions.find(i => i.id === agreement.sendingInstitutionId)?.name} → {" "}
                        {institutions.find(i => i.id === agreement.receivingInstitutionId)?.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{agreement.academicYear}</Badge>
                        <Badge variant="outline">{agreement.sourceType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(agreement.createdAt!), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {manualAgreements.length === 0 && (
                  <div className="text-center py-8">
                    <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No manual agreements yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manually enter articulation data from Assist.org
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Agreements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5 text-secondary" />
                  <span>API Import ({apiAgreements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {apiAgreements.map((agreement: ArticulationAgreement) => (
                  <div key={agreement.id} className="p-3 border rounded-lg" data-testid={`agreement-api-${agreement.id}`}>
                    <div className="space-y-2">
                      <h4 className="font-medium">{agreement.major || "General Transfer"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {institutions.find(i => i.id === agreement.sendingInstitutionId)?.name} → {" "}
                        {institutions.find(i => i.id === agreement.receivingInstitutionId)?.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{agreement.academicYear}</Badge>
                        <Badge variant="outline">{agreement.sourceType}</Badge>
                        {agreement.assistOrgKey && (
                          <Badge variant="secondary">Key: {agreement.assistOrgKey}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {apiAgreements.length === 0 && (
                  <div className="text-center py-8">
                    <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No API agreements yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      API access coming in 2026-2027
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uploaded Agreements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5 text-accent" />
                  <span>Uploaded ({uploadedAgreements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadedAgreements.map((agreement: ArticulationAgreement) => (
                  <div key={agreement.id} className="p-3 border rounded-lg" data-testid={`agreement-upload-${agreement.id}`}>
                    <div className="space-y-2">
                      <h4 className="font-medium">{agreement.major || "General Transfer"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {institutions.find(i => i.id === agreement.sendingInstitutionId)?.name} → {" "}
                        {institutions.find(i => i.id === agreement.receivingInstitutionId)?.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{agreement.academicYear}</Badge>
                        <Badge variant="outline">{agreement.sourceType}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {uploadedAgreements.length === 0 && (
                  <div className="text-center py-8">
                    <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No uploaded agreements yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload PDF agreements from Assist.org
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="institutions">
          <Card>
            <CardHeader>
              <CardTitle>California Educational Institutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutions.map((institution: any) => (
                  <div key={institution.id} className="p-4 border rounded-lg" data-testid={`institution-${institution.id}`}>
                    <div className="space-y-2">
                      <h4 className="font-medium">{institution.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          institution.type === "CCC" ? "default" :
                          institution.type === "UC" ? "secondary" : "outline"
                        }>
                          {institution.type}
                        </Badge>
                        {institution.abbreviation && (
                          <Badge variant="outline">{institution.abbreviation}</Badge>
                        )}
                      </div>
                      {institution.assistOrgId && (
                        <p className="text-xs text-muted-foreground">
                          Assist.org ID: {institution.assistOrgId}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
