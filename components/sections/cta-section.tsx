"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const CTASection = () => {
  const t = useTranslations();

  return (
    <section className="py-20 bg-background">

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 rounded-full bg-chart-1/10 text-chart-1 px-3 py-1 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>{t('cta.tagline')}</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="font-medium text-base">
              <Link href="/generate">
                {t('cta.startCreating')} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium text-base">
              <Link href="/login">
                {t('cta.signIn')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};