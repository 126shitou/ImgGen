"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const HeroSection = () => {
  const t = useTranslations();


  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 md:py-16 overflow-hidden bg-background">
      <div className="w-full max-w-[98vw] 2xl:max-w-[1800px] px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[45%] flex flex-col space-y-10 items-center lg:items-start text-center lg:text-left"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            {t('hero.title')}
            <span className="text-chart-1 dark:text-chart-4 block mt-4">{t('hero.subtitle')}</span>
          </h1>

          <p className="text-2xl md:text-3xl text-muted-foreground max-w-[800px] leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 pt-8">
            <Button asChild size="lg" className="font-medium text-xl px-10 py-8 h-auto group">
              <Link href="/generate">
                {t('hero.startCreating')} <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium text-xl px-10 py-8 h-auto">
              <Link href="/gallery">
                <ImageIcon className="mr-3 h-6 w-6" /> {t('hero.exploreGallery')}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full lg:w-[55%] grid grid-cols-2 gap-10 h-[700px] md:h-[800px] xl:h-[900px] max-w-[1000px]"
        >
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: [10, -10, 10] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl h-[330px] md:h-[380px] xl:h-[430px]"
          >
            <Image
              src="https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg"
              alt="AI Generated Art Example 1"
              width={700}
              height={1050}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ y: -10 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl mt-12 h-[330px] md:h-[380px] xl:h-[430px]"
          >
            <Image
              src="https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg"
              alt="AI Generated Art Example 2"
              width={700}
              height={1050}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ y: -5 }}
            animate={{ y: [-5, 15, -5] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl h-[330px] md:h-[380px] xl:h-[430px]"
          >
            <Image
              src="https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg"
              alt="AI Generated Art Example 3"
              width={700}
              height={1050}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ y: 5 }}
            animate={{ y: [5, -15, 5] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl mt-12 h-[330px] md:h-[380px] xl:h-[430px]"
          >
            <Image
              src="https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg"
              alt="AI Generated Art Example 4"
              width={700}
              height={1050}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};