import { Suspense } from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { GallerySection } from '@/components/sections/gallery-section';
import { CTASection } from '@/components/sections/cta-section';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <GallerySection />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CTASection />
      </Suspense>
    </div>
  );
}