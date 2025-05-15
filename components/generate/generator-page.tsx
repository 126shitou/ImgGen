"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratorForm } from '@/components/generate/generator-form';
import { GeneratorOutput } from '@/components/generate/generator-output';
import { GeneratorHistory } from '@/components/generate/generator-history';
import { useAuth } from '@/lib/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type GeneratedImage = {
  id: string;
  url: string;
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
  const { isAuthenticated, requireAuth } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  // Function to generate images using Replicate API
  const generateImages = async (formData: any) => {
    // 检查用户是否已登录，未登录则不执行生成
    if (!requireAuth()) {
      return;
    }
    
    setIsGenerating(true);

    try {
      // Call Replicate API using the rewrite rule defined in next.config.mjs
      const response = await fetch('/api/replicate/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Prefer': 'wait',
          'Authorization': 'Bearer r8_TnN084xPzJAoMXKnrVXowlMhcXmBuvl2ddXeS' 
        },
        body: JSON.stringify({
          input: {
            prompt: formData.prompt,
            go_fast: true,
            megapixels: formData.megapixels,
            num_outputs: formData.num_outputs,
            aspect_ratio: formData.aspect_ratio,
            output_format: formData.output_format,
            output_quality: formData.output_quality,
            num_inference_steps: formData.num_inference_steps || formData.steps
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Create generated images based on API response
      const newImages: GeneratedImage[] = [];
      
      // Handle the API response - image URL is in response.urls.stream
      if (result.urls && result.urls.stream) {
        // Create a single image with the stream URL
        newImages.push({
          id: crypto.randomUUID(),
          url: result.urls.stream,
          prompt: formData.prompt,
          aspect_ratio: formData.aspect_ratio,
          seed: formData.seed || Math.floor(Math.random() * 1000000),
          num_inference_steps: formData.num_inference_steps || formData.steps || 4,
          timestamp: new Date(),
        });
      } else if (result.output) {
        // Fallback to previous handling for compatibility
        // Check if output is an array
        const outputs = Array.isArray(result.output) ? result.output : [result.output];
        
        outputs.forEach((imageUrl: string) => {
          newImages.push({
            id: crypto.randomUUID(),
            url: imageUrl,
            prompt: formData.prompt,
            aspect_ratio: formData.aspect_ratio,
            seed: formData.seed || Math.floor(Math.random() * 1000000),
            num_inference_steps: formData.num_inference_steps || formData.steps || 4,
            timestamp: new Date(),
          });
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
              <Button onClick={() => router.push('/login?redirect=/generate')} variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800">
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
              <TabsList className="mb-6">
                <TabsTrigger value="output" className="text-lg py-3 px-6">{t('generator.tabs.output')}</TabsTrigger>
                <TabsTrigger value="history" className="text-lg py-3 px-6">{t('generator.tabs.history')}</TabsTrigger>
              </TabsList>

              <TabsContent value="output">
                <GeneratorOutput
                  images={generatedImages}
                  isGenerating={isGenerating}
                  isAuthenticated={isAuthenticated}
                />
              </TabsContent>

              <TabsContent value="history">
                <GeneratorHistory images={history} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;