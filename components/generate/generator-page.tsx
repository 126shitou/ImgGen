"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratorForm } from '@/components/generate/generator-form';
import { GeneratorOutput } from '@/components/generate/generator-output';
import { GeneratorHistory } from '@/components/generate/generator-history';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getImageStorage } from '@/lib/indexedDB';

export type GeneratedImage = {
  id: string;
  url: string; // This will now store the base64 data URL, not the original URL
  prompt: string;
  aspect_ratio: string;
  seed: number;
  num_inference_steps: number;
  timestamp: Date;
};

// Mock history of previously generated images
const mockHistory: GeneratedImage[] = [
  // ... existing code ...
];

const GeneratorPage = () => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>(mockHistory);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();
  const t = useTranslations();

  // Function to generate images using Replicate API
  // 初始化 IndexedDB 存储
  useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      // 加载历史记录
      const loadHistory = async () => {
        try {
          const imageStorage = getImageStorage();
          const images = await imageStorage.listAllImages();

          if (images.length > 0) {
            const formattedImages = [];

            // 处理每个存储的图片
            for (const item of images) {
              try {
                // 从IndexedDB获取图片Blob
                const imageData = await imageStorage.getImage(item.id);
                if (imageData && imageData.blob) {
                  // 创建临时URL用于显示
                  const objectUrl = imageStorage.createImageUrl(imageData.blob);

                  formattedImages.push({
                    id: item.id,
                    url: objectUrl, // 使用临时对象URL而不是原始URL
                    prompt: item.metadata.prompt || '',
                    aspect_ratio: item.metadata.aspect_ratio || '1:1',
                    seed: item.metadata.seed || 0,
                    num_inference_steps: item.metadata.num_inference_steps || 4,
                    timestamp: item.metadata.createdAt || new Date(),
                  });
                }
              } catch (error) {
                console.error(`Error loading image ${item.id}:`, error);
              }
            }

            setHistory(formattedImages);
          }
        } catch (error) {
          console.error('Error loading history from IndexedDB:', error);
        }
      };

      loadHistory();
    }
  }, []);

  const generateImages = async (formData: any) => {

    // 检查用户是否已登录，未登录则不执行生成
    if (!isAuthenticated) {
      return;
    }

    setIsGenerating(true);
    const tk = process.env.NEXT_PUBLIC_TK

    let sd: any = {
      prompt: formData.prompt,
      go_fast: true,
      megapixels: formData.megapixels,
      num_outputs: formData.num_outputs,
      aspect_ratio: formData.aspect_ratio,
      output_format: formData.output_format,
      output_quality: formData.output_quality,
      num_inference_steps: formData.num_inference_steps || 1
    }
    if (formData.useSeed) sd.seed = formData.seed


    try {
      // Call Replicate API using the rewrite rule defined in next.config.mjs
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'wait',
          'Authorization': `Bearer ${tk}`
        },
        body: JSON.stringify({
          userId: session.user.id, formData: sd
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const imageDataUrls = await response.json();
      const newImages: GeneratedImage[] = [];
      const imageStorage = getImageStorage();

      // 处理每个生成的图片
      for (let i = 0; i < imageDataUrls.length; i++) {
        const dataUrl = imageDataUrls[i];

        // 将 dataUrl 转换为 Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // 生成唯一ID
        const id = `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`;

        // 存储图片到 IndexedDB，不存储原始URL
        const metadata = {
          prompt: formData.prompt,
          aspect_ratio: formData.aspect_ratio,
          seed: formData.useSeed ? formData.seed : Math.floor(Math.random() * 1000000),
          num_inference_steps: formData.num_inference_steps || 4,
          output_format: formData.output_format,
          // 不存储原始URL，只存储相关元数据
          createdAt: new Date()
        };

        await imageStorage.storeImageBlob(blob, metadata);

        // 创建临时对象URL用于显示
        const objectUrl = imageStorage.createImageUrl(blob);

        // 创建图片对象用于显示
        newImages.push({
          id,
          url: objectUrl, // 使用临时对象URL而不是原始URL
          prompt: formData.prompt,
          aspect_ratio: formData.aspect_ratio,
          seed: metadata.seed,
          num_inference_steps: formData.num_inference_steps || 4,
          timestamp: new Date(),
        });
      }

      setGeneratedImages(newImages);
      setHistory(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error('Error generating images:', error);
      // You might want to display an error message to the user
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 md:py-16">
      <div className="w-full max-w-[98vw] 2xl:max-w-[1800px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">{t('generator.title')}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {t('generator.description')}
          </p>
        </motion.div>

        {!isAuthenticated && (
          <Alert className="max-w-3xl mx-auto mb-8 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <LockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">{t('generator.authRequired')}</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              <p className="mb-4">{t('generator.authDescription')}</p>
              <Button onClick={() => router.push('/auth/login?redirect=/generate')} variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800">
                {t('generator.loginToContinue')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Generator Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <GeneratorForm
              onGenerate={generateImages}
              isGenerating={isGenerating}
              isDisabled={!isAuthenticated}
            />
          </div>

          {/* Right Column: Output and History */}
          <div className="lg:col-span-7 xl:col-span-8">
            <Tabs defaultValue="output" className="w-full">
              <TabsList className="mb-6 bg-background border border-border rounded-md p-1 w-fit">
                <TabsTrigger
                  value="output"
                  className="text-sm font-medium py-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t('generator.tabs.output')}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="text-sm font-medium py-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t('generator.tabs.history')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="output">
                <GeneratorOutput
                  images={generatedImages}
                  isGenerating={isGenerating}
                />
              </TabsContent>

              <TabsContent value="history">
                <GeneratorHistory
                  images={history}
                  onRegenerate={(formValues) => {
                    // 切换到输出标签
                    const tabsList = document.querySelector('[role="tablist"]');
                    const outputTab = tabsList?.querySelector('[value="output"]') as HTMLButtonElement;
                    if (outputTab) {
                      outputTab.click();
                    }

                    // 填充表单并触发生成
                    generateImages(formValues);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;