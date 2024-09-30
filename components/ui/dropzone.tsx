import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Define the props expected by the Dropzone component
interface DropzoneProps {
  onImageDrop: (base64Image: string) => void;
  previewUrl: string | null;
  className?: string;
}

// Create the Dropzone component receiving props
export function Dropzone({
  onImageDrop,
  previewUrl,
  className,
  ...props
}: DropzoneProps) {
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to file input element
  const [error, setError] = useState<string | null>(null); // Error message state

  // Function to handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Function to handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
    }
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageDrop(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please upload a valid image file.');
    }
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className={`border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50 ${className}`}
      {...props}
    >
      <CardContent
        className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs h-[300px] w-[300px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt="Uploaded image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center text-muted-foreground">
              <span className="font-medium">Drag Files to Upload or</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto flex h-8 space-x-2 px-0 pl-1 text-xs"
                onClick={handleButtonClick}
              >
                Click Here
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
            {error && <span className="text-red-500">{error}</span>}
          </>
        )}
      </CardContent>
    </Card>
  );
}