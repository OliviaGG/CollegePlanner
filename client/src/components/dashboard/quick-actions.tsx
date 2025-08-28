import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Handshake, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/transcripts">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-3 border border-border hover:bg-muted"
            data-testid="action-upload-transcript"
          >
            <div className="w-10 h-10 bg-scc-cardinal/10 rounded-lg flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-scc-cardinal" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Upload Transcript</div>
              <div className="text-sm text-muted-foreground">Import completed courses</div>
            </div>
          </Button>
        </Link>
        
        <Link href="/assist-data">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-3 border border-border hover:bg-muted"
            data-testid="action-import-assist-data"
          >
            <div className="w-10 h-10 bg-scc-blue/10 rounded-lg flex items-center justify-center mr-3">
              <Handshake className="h-5 w-5 text-scc-blue" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Import Assist.org Data</div>
              <div className="text-sm text-muted-foreground">Add articulation agreements</div>
            </div>
          </Button>
        </Link>
        
        <Link href="/course-planning">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-3 border border-border hover:bg-muted"
            data-testid="action-validate-plan"
          >
            <div className="w-10 h-10 bg-scc-green/10 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-scc-green" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Validate Plan</div>
              <div className="text-sm text-muted-foreground">Check prerequisites & requirements</div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
