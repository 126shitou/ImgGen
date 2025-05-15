"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Layers, 
  Maximize, 
  RefreshCw, 
  Sliders, 
  Palette, 
  Image, 
  LayoutGrid, 
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FeaturesSection = () => {
  const t = useTranslations();

  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: t('features.items.customizablePrompts.title'),
      description: t('features.items.customizablePrompts.description')
    },
    {
      icon: <Maximize className="h-6 w-6" />,
      title: t('features.items.aspectRatios.title'),
      description: t('features.items.aspectRatios.description')
    },
    {
      icon: <LayoutGrid className="h-6 w-6" />,
      title: t('features.items.batchGeneration.title'),
      description: t('features.items.batchGeneration.description')
    },
    {
      icon: <Sliders className="h-6 w-6" />,
      title: t('features.items.inferenceSteps.title'),
      description: t('features.items.inferenceSteps.description')
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: t('features.items.reproducibleResults.title'),
      description: t('features.items.reproducibleResults.description')
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: t('features.items.outputFormats.title'),
      description: t('features.items.outputFormats.description')
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: t('features.items.resolutionControl.title'),
      description: t('features.items.resolutionControl.description')
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: t('features.items.easyDownloads.title'),
      description: t('features.items.easyDownloads.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('features.description')}
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                index % 4 === 0 ? "bg-chart-1/10 text-chart-1" :
                index % 4 === 1 ? "bg-chart-2/10 text-chart-2" :
                index % 4 === 2 ? "bg-chart-3/10 text-chart-3" :
                "bg-chart-4/10 text-chart-4"
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};