import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onSuccess: () => void;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadType, setUploadType] = useState<string>("TRANSCRIPT");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, { file }) => {
      setFiles(prev => prev.map(f => 
        f.name === file.name 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ));
      
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });
    },
    onError: (error, { file }) => {
      setFiles(prev => prev.map(f => 
        f.name === file.name 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
      
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(2),
      progress: 0,
      status: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      try {
        await uploadMutation.mutateAsync({ 
          file: new File([file], file.name, { type: file.type }), 
          type: uploadType 
        });
      } catch (error) {
        // Error handling is done in the mutation
      }
    }

    // Check if all uploads were successful
    const allSuccessful = files.every(f => f.status === 'success');
    if (allSuccessful && files.length > 0) {
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  const getFileIcon = (file: UploadFile) => {
    if (file.status === 'success') {
      return <CheckCircle className="h-5 w-5 text-secondary" />;
    } else if (file.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    } else {
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Document Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Document Type</label>
        <Select value={uploadType} onValueChange={setUploadType}>
          <SelectTrigger data-testid="select-upload-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
            <SelectItem value="DEGREE_AUDIT">Degree Audit</SelectItem>
            <SelectItem value="ARTICULATION_AGREEMENT">Articulation Agreement</SelectItem>
            <SelectItem value="OTHER">Other Document</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        data-testid="file-dropzone"
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        {isDragActive ? (
          <div>
            <p className="text-primary font-medium">Drop files here...</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, CSV, TXT files up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Files to Upload</h4>
          {files.map(file => (
            <div 
              key={file.id} 
              className="flex items-center space-x-3 p-3 border rounded-lg"
              data-testid={`upload-file-${file.id}`}
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate" data-testid={`file-name-${file.id}`}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground ml-2">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="mt-2" />
                )}
                
                {file.status === 'error' && file.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {file.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {file.status === 'success' && (
                  <p className="text-xs text-secondary mt-1">Upload complete</p>
                )}
              </div>
              
              {file.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  data-testid={`remove-file-${file.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Actions */}
      {files.length > 0 && (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setFiles([])}
            disabled={uploadMutation.isPending}
            data-testid="button-clear-files"
          >
            Clear All
          </Button>
          <Button 
            onClick={uploadFiles}
            disabled={files.length === 0 || uploadMutation.isPending || files.every(f => f.status !== 'pending')}
            data-testid="button-upload-files"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      )}

      {/* Upload Guidelines */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <h4 className="font-medium">Upload Guidelines</h4>
            <ul className="text-sm space-y-1">
              <li>• PDF files are preferred for transcripts and official documents</li>
              <li>• CSV files can be used for course data imports</li>
              <li>• Maximum file size is 10MB per file</li>
              <li>• Files will be automatically processed for text extraction</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
