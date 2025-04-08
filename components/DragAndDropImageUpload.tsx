// components/DragAndDropImageUpload.tsx
'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

export default function DragAndDropImageUpload({
  onUpload,
}: {
  onUpload: (file: File) => Promise<string>;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        // Handle the returned URL as needed
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
  });

  return (
    <Card
      {...getRootProps()}
      className={`flex h-48 cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-4 transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
      }`}
    >
      <Input {...getInputProps()} />
      <UploadCloud className={`h-8 w-8 ${isUploading ? 'animate-pulse' : ''}`} />
      <p className="text-center text-sm text-muted-foreground">
        {isUploading
          ? 'Uploading...'
          : isDragActive
            ? 'Drop image here'
            : 'Drag image here or click to upload'}
      </p>
    </Card>
  );
}