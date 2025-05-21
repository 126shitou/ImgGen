"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

import {
  Download,
  ExternalLink
} from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { GeneratedImage } from '@/components/generate/generator-page';

export interface GeneratorOutputProps {
  images: GeneratedImage[];
  isGenerating: boolean;
}

export function GeneratorOutput({
  images,
  isGenerating,
}: GeneratorOutputProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const t = useTranslations();

  // 清理对象URL以防止内存泄漏
  useEffect(() => {
    return () => {
      // 组件卸载时清理所有对象URL
      images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);


  // Function to download image
  const downloadImage = async (imageUrl: string, promptText: string) => {
    // 如果已经是Blob URL，直接使用而不需要再次获取
    try {
      // Start download spinner
      toast({
        title: t('generator.output.toast.download.title') || 'Downloading...',
        description: t('generator.output.toast.download.downloading') || 'Your image is being downloaded.',
      });

      // Fetch the image
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create URL for download
      const url = window.URL.createObjectURL(blob);

      // Create anchor element for download
      const a = document.createElement('a');

      // Create filename from prompt (limited to first 30 chars) and add date
      const promptSlug = promptText
        .slice(0, 30)
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');

      const date = new Date().toISOString().split('T')[0];
      const filename = `image-${promptSlug}-${date}.png`;

      // Set download attributes
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);

      // Show error message
      toast({
        title: t('generator.output.toast.download.title') || 'Download Error',
        description: t('generator.output.toast.download.error') || 'Failed to download image.',
        variant: 'destructive'
      });
    }
  };

  const getGridCols = () => {
    return images.length === 1 ? 'grid-cols-1' :
      images.length === 2 ? 'grid-cols-2' :
        'grid-cols-2 md:grid-cols-3';
  };

  return (
    <div className="w-full min-h-[500px] bg-card rounded-xl border border-border shadow-sm p-4">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">
            {t('generator.output.generating')}
          </p>
        </div>
      ) : images.length > 0 ? (
        <div className={`grid ${getGridCols()} gap-4`}>
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-lg overflow-hidden group"
              >
                <Image
                  src={image.url}
                  alt={image.prompt}
                  width={500}
                  height={500}
                  className="object-cover w-full aspect-square"
                  priority={true}
                  unoptimized={true}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div className="flex justify-end">

                  </div>

                  <div>
                    <p className="text-white text-sm line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => downloadImage(image.url, image.prompt)}>
                      <Download className="h-4 w-4 mr-2" /> {t('generator.output.actions.download')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Image
              src="https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg"
              alt="Example image"
              width={80}
              height={80}
              className="rounded-full opacity-20"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">{t('generator.output.empty.title')}</h3>
          <p className="text-muted-foreground max-w-md">
            {t('generator.output.empty.description')}
          </p>
        </div>
      )}

      {/* Image Details Dialog */}
      <Dialog>
        <DialogContent className="max-w-2xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{t('generator.output.details.title')}</DialogTitle>
                <DialogDescription>
                  {t('generator.output.details.description')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    width={500}
                    height={500}
                    className="object-cover w-full"
                    priority={true}
                    unoptimized={true}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.prompt')}</h4>
                    <p className="text-sm">{selectedImage.prompt}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.imageUrl') || 'Image URL'}</h4>
                    <p className="text-xs text-muted-foreground truncate hover:text-clip">{selectedImage.url}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.aspectRatio')}</h4>
                      <Badge variant="outline">{selectedImage.aspect_ratio}</Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.seed')}</h4>
                      <Badge variant="outline">{selectedImage.seed}</Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.steps')}</h4>
                      <Badge variant="outline">{selectedImage.num_inference_steps}</Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('generator.output.details.generated')}</h4>
                      <Badge variant="outline">
                        {selectedImage.timestamp.toLocaleString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <Button className="w-full" onClick={() => downloadImage(selectedImage.url, selectedImage.prompt)}>
                      <Download className="h-4 w-4 mr-2" /> {t('generator.output.details.actions.download')}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.open(selectedImage.url, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" /> {t('generator.output.details.actions.openEditor')}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}