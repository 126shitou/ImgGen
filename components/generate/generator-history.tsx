"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import type { GeneratedImage } from '@/components/generate/generator-page';

interface GeneratorHistoryProps {
  images: GeneratedImage[];
}

export const GeneratorHistory = ({ images }: GeneratorHistoryProps) => {
  const t = useTranslations();

  // Group images by date
  const groupedImages = images.reduce<Record<string, GeneratedImage[]>>((groups, image) => {
    const date = image.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm p-4">
      {Object.keys(groupedImages).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedImages).map(([date, dateImages]) => (
            <div key={date}>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">{date}</h3>
                <Badge variant="outline" className="ml-2">
                  {t('generator.history.imageCount', { count: dateImages.length })}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.prompt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{image.aspect_ratio}</Badge>
                          <Badge variant="outline">{image.num_inference_steps} {t('generator.history.steps')}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              {t('generator.history.actions.download')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t('generator.history.actions.regenerate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('generator.history.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
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
          <h3 className="text-lg font-medium mb-2">{t('generator.history.empty.title')}</h3>
          <p className="text-muted-foreground max-w-md">
            {t('generator.history.empty.description')}
          </p>
        </div>
      )}
    </div>
  );
};