"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { getImageStorage } from '@/lib/indexedDB';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { GeneratedImage } from '@/components/generate/generator-page';
import type { GeneratorFormValues } from '@/components/generate/generator-form';

interface GeneratorHistoryProps {
  images: GeneratedImage[];
  onRegenerate?: (values: GeneratorFormValues) => void;
}

export const GeneratorHistory = ({ images: initialImages, onRegenerate }: GeneratorHistoryProps) => {
  const t = useTranslations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [images, setImages] = useState<GeneratedImage[]>(initialImages);

  // 当组件挂载或刷新触发器变化时从 IndexedDB 加载图片
  useEffect(() => {
    const loadImagesFromIndexedDB = async () => {
      try {
        // 仅在客户端执行
        if (typeof window === 'undefined') return;

        const imageStorage = getImageStorage();
        const storedImages = await imageStorage.listAllImages();

        if (storedImages.length > 0) {
          const formattedImages: GeneratedImage[] = [];

          // 处理每个存储的图片
          for (const item of storedImages) {
            try {
              // 从IndexedDB获取图片Blob
              const imageData = await imageStorage.getImage(item.id);
              if (imageData && imageData.blob) {
                // 创建临时URL用于显示
                const objectUrl = imageStorage.createImageUrl(imageData.blob);

                formattedImages.push({
                  id: item.id,
                  url: objectUrl,
                  prompt: item.metadata.prompt || '',
                  aspect_ratio: item.metadata.aspect_ratio || '1:1',
                  seed: item.metadata.seed || 0,
                  num_inference_steps: item.metadata.num_inference_steps || 4,
                  timestamp: item.metadata.createdAt || new Date(),
                  star: item.metadata.star || false
                });
              }
            } catch (error) {
              console.error(`Error loading image ${item.id}:`, error);
            }
          }

          setImages(formattedImages);
        }
      } catch (error) {
        console.error('Error loading images from IndexedDB:', error);
      }
    };

    loadImagesFromIndexedDB();

    // 清理函数，卸载时释放所有对象URL
    return () => {
      images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [refreshTrigger]); // 当刷新触发器变化时重新加载

  // 当初始图片变化时更新图片状态
  useEffect(() => {
    // 如果初始图片变化（如切换标签或生成新图片），触发刷新
    setRefreshTrigger(prev => prev + 1);
  }, [initialImages]);

  // 下载图片
  const downloadImage = async (image: GeneratedImage) => {
    try {
      // 显示下载中提示
      toast({
        title: t('generator.history.downloading'),
        description: t('generator.history.downloadingDescription')
      });

      // 从IndexedDB获取图片数据
      const imageStorage = getImageStorage();
      const imageData = await imageStorage.getImage(image.id);

      if (!imageData || !imageData.blob) {
        throw new Error('Image data not found');
      }

      // 创建下载链接
      const url = URL.createObjectURL(imageData.blob);
      const a = document.createElement('a');

      // 获取原始图片格式
      const contentType = imageData.blob.type;
      let fileExtension = imageData.metadata.output_format || 'png';; // 默认值
      console.log("contentType++++", contentType);

      // 根据 MIME 类型确定文件扩展名
      if (contentType) {
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          fileExtension = 'jpg';
        } else if (contentType.includes('png')) {
          fileExtension = 'png';
        } else if (contentType.includes('webp')) {
          fileExtension = 'webp';
        } else if (contentType.includes('gif')) {
          fileExtension = 'gif';
        } else if (contentType.includes('svg')) {
          fileExtension = 'svg';
        }
      }
      console.log("imageData,", imageData);


      // 创建文件名（使用提示词的前30个字符）
      const promptSlug = image.prompt
        .slice(0, 30)
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');

      const date = new Date().toISOString().split('T')[0];
      const filename = `image-${promptSlug}-${date}.${fileExtension}`;

      // 设置下载属性
      a.href = url;
      a.download = filename;

      // 触发下载
      document.body.appendChild(a);
      a.click();

      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);

      // 显示错误消息
      toast({
        title: t('generator.history.downloadError'),
        description: t('generator.history.downloadErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  // 重新生成图片（填充表单参数）
  const regenerateImage = async (image: GeneratedImage) => {
    try {
      if (!onRegenerate) {
        toast({
          title: t('generator.history.regenerateError'),
          description: t('generator.history.regenerateErrorDescription'),
          variant: 'destructive'
        });
        return;
      }

      // 从IndexedDB获取完整的图片元数据
      const imageStorage = getImageStorage();
      const imageData = await imageStorage.getImage(image.id);

      if (!imageData) {
        throw new Error('Image data not found');
      }

      // 提取生成参数
      const { metadata } = imageData;

      // 创建表单值对象
      const formValues: GeneratorFormValues = {
        prompt: image.prompt,
        aspect_ratio: image.aspect_ratio,
        num_outputs: metadata.num_outputs || 1,
        num_inference_steps: image.num_inference_steps,
        seed: image.seed,
        useSeed: true, // 启用种子以使用相同的种子值
        output_format: metadata.output_format || 'webp',
        output_quality: metadata.output_quality || 80,
        megapixels: metadata.megapixels || '1',
      };

      // 调用重新生成函数
      onRegenerate(formValues);

      // 显示成功消息
      toast({
        title: t('generator.history.regenerateSuccess'),
        description: t('generator.history.regenerateSuccessDescription')
      });
    } catch (error) {
      console.error('Regenerate error:', error);

      // 显示错误消息
      toast({
        title: t('generator.history.regenerateError'),
        description: t('generator.history.regenerateErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  // 收藏/取消收藏图片
  const toggleStar = async (image: GeneratedImage) => {
    try {
      // 从IndexedDB获取图片数据
      const imageStorage = getImageStorage();
      const imageData = await imageStorage.getImage(image.id);

      if (!imageData) {
        throw new Error('Image data not found');
      }

      // 更新元数据中的star状态
      const updatedMetadata = {
        ...imageData.metadata,
        star: !image.star
      };

      // 重新存储图片，更新元数据
      await imageStorage.updateImageMetadata(image.id, updatedMetadata);

      // 更新本地状态
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === image.id ? { ...img, star: !img.star } : img
        )
      );

      // 显示成功消息
      toast({
        title: image.star ? t('generator.history.unstarSuccess') : t('generator.history.starSuccess'),
        description: image.star ? t('generator.history.unstarSuccessDescription') : t('generator.history.starSuccessDescription')
      });
    } catch (error) {
      console.error('Star toggle error:', error);

      // 显示错误消息
      toast({
        title: t('generator.history.starError'),
        description: t('generator.history.starErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  // 删除图片
  const deleteImage = async (id: string) => {
    try {
      // 首先释放要删除的图片的对象URL
      const imageToRemove = images.find(img => img.id === id);
      if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      // 从IndexedDB删除图片
      const imageStorage = getImageStorage();
      await imageStorage.deleteImage(id);

      // 从当前状态中移除图片
      setImages(prevImages => prevImages.filter(img => img.id !== id));

      // 触发刷新以重新从 IndexedDB 加载
      setRefreshTrigger(prev => prev + 1);

      // 显示成功消息
      toast({
        title: t('generator.history.deleteSuccess'),
        description: t('generator.history.deleteSuccessDescription')
      });
    } catch (error) {
      console.error('Delete error:', error);

      // 显示错误消息
      toast({
        title: t('generator.history.deleteError'),
        description: t('generator.history.deleteErrorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (id: string) => {
    setImageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Group images by date and sort each group by timestamp (newest first)
  const groupedImages = images.reduce<Record<string, GeneratedImage[]>>((groups, image) => {
    const date = image.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});
  
  // Sort each group by timestamp (newest first)
  Object.keys(groupedImages).forEach(date => {
    groupedImages[date].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });
  
  // Also sort the dates (keys) by newest first
  const sortedDates = Object.keys(groupedImages).sort((a, b) => {
    // Convert date strings to Date objects for comparison
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm p-4">
      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                {t('generator.history.deleteConfirmTitle')}
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('generator.history.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('generator.history.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => imageToDelete && deleteImage(imageToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('generator.history.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">{date}</h3>
                <Badge variant="outline" className="ml-2">
                  {t('generator.history.imageCount', { count: groupedImages[date].length })}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedImages[date].map((image: GeneratedImage) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      {image.star && (
                        <div className="absolute top-2 right-2 z-10">
                          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                        </div>
                      )}
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
                          {image.star && <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">★ {t('generator.history.starred')}</Badge>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => downloadImage(image)}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('generator.history.actions.download')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => regenerateImage(image)}
                              disabled={!onRegenerate}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t('generator.history.actions.regenerate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => toggleStar(image)}
                            >
                              <Star className={`h-4 w-4 mr-2 ${image.star ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              {image.star ? t('generator.history.actions.unstar') : t('generator.history.actions.star')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => openDeleteDialog(image.id)}
                            >
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
            <MoreHorizontal className="h-16 w-16 text-muted-foreground opacity-20" />
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