
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onScriptExtracted: (script: string, filename: string) => void;
  maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onScriptExtracted, 
  maxFiles = 5 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.txt');
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only TXT, PDF, DOC, and DOCX files are supported",
        variant: "destructive"
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Process files
    for (const file of validFiles) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let text = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text();
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll use a simple text extraction
        text = await extractPDFText(file);
      } else {
        // For DOC/DOCX files, extract as much text as possible
        text = await extractDocText(file);
      }
      
      if (text.trim()) {
        onScriptExtracted(text.trim(), file.name);
        toast({
          title: "File processed",
          description: `Successfully extracted text from ${file.name}`
        });
      } else {
        throw new Error('No text found in file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing failed",
        description: `Could not extract text from ${file.name}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractPDFText = async (file: File): Promise<string> => {
    // Simple PDF text extraction - in a real app you'd use pdf-parse or similar
    // For now, we'll return a placeholder that suggests manual copying
    return `PDF file uploaded: ${file.name}\n\nPlease copy and paste the text content manually for now. Full PDF text extraction will be available in a future update.`;
  };

  const extractDocText = async (file: File): Promise<string> => {
    // Simple DOC text extraction - in a real app you'd use mammoth.js or similar
    return `Document uploaded: ${file.name}\n\nPlease copy and paste the text content manually for now. Full document text extraction will be available in a future update.`;
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
      <CardContent className="p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Script Files</h3>
          <p className="text-sm text-gray-500 mb-4">
            Support for TXT, PDF, DOC, and DOCX files
          </p>
          
          <Button onClick={triggerFileSelect} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
