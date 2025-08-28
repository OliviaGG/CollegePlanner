import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/upload/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Calendar, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Document } from "@shared/schema";

export default function Transcripts() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const transcripts = documents.filter((doc: Document) => doc.type === "TRANSCRIPT");
  const degreeAudits = documents.filter((doc: Document) => doc.type === "DEGREE_AUDIT");
  const otherDocs = documents.filter((doc: Document) => !["TRANSCRIPT", "DEGREE_AUDIT"].includes(doc.type));

  if (isLoading) {
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
          <h2 className="text-3xl font-bold tracking-tight">Transcripts & Documents</h2>
          <p className="text-muted-foreground">
            Upload and manage your academic documents
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <FileUpload onSuccess={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Transcripts ({transcripts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transcripts.map((doc: Document) => (
              <div key={doc.id} className="p-3 border rounded-lg" data-testid={`transcript-${doc.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.originalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.uploadedAt!), { addSuffix: true })}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{(doc.size / 1024).toFixed(1)} KB</Badge>
                      <Badge variant="outline">{doc.mimeType.split('/')[1].toUpperCase()}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-download-${doc.id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {transcripts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No transcripts uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your official transcripts to track completed courses
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Degree Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <span>Degree Audits ({degreeAudits.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {degreeAudits.map((doc: Document) => (
              <div key={doc.id} className="p-3 border rounded-lg" data-testid={`audit-${doc.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.originalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.uploadedAt!), { addSuffix: true })}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{(doc.size / 1024).toFixed(1)} KB</Badge>
                      <Badge variant="outline">{doc.mimeType.split('/')[1].toUpperCase()}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-download-${doc.id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {degreeAudits.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No degree audits uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload degree audits to track progress toward requirements
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-accent" />
              <span>Other Documents ({otherDocs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherDocs.map((doc: Document) => (
              <div key={doc.id} className="p-3 border rounded-lg" data-testid={`document-${doc.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.originalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.uploadedAt!), { addSuffix: true })}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{(doc.size / 1024).toFixed(1)} KB</Badge>
                      <Badge variant="outline">{doc.mimeType.split('/')[1].toUpperCase()}</Badge>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-download-${doc.id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {otherDocs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No other documents uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload articulation agreements and other planning documents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Transcripts</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Official transcripts from all institutions</li>
                <li>• PDF format preferred</li>
                <li>• Include course codes, titles, and grades</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-secondary">Degree Audits</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Current degree audit from your college</li>
                <li>• Shows completed requirements</li>
                <li>• Helps track remaining coursework</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-accent">Articulation Agreements</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Transfer agreements from Assist.org</li>
                <li>• Course equivalency documents</li>
                <li>• Major-specific requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
