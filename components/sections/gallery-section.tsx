"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sendGTMEvent } from '@next/third-parties/google';
import { useSession } from 'next-auth/react';
// Sample gallery images
const sampleImages = [
  {
    id: 1,
    src: "https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg",
    prompt: "Ethereal cyberpunk cityscape at sunset with neon lights"
  },
  {
    id: 2,
    src: "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
    prompt: "Magical forest with bioluminescent plants and a meandering stream"
  },
  {
    id: 3,
    src: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg",
    prompt: "Futuristic space station orbiting a ringed gas giant"
  },
  {
    id: 4,
    src: "https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg",
    prompt: "Surreal floating islands with waterfalls and ancient ruins"
  },
  {
    id: 5,
    src: "https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg",
    prompt: "Steampunk airship battle among the clouds at dawn"
  },
  {
    id: 6,
    src: "https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg",
    prompt: "Mystical underwater city with bioluminescent architecture"
  }
];

export const GallerySection = () => {
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const { data: session } = useSession()
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('gallery.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t('gallery.description')}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/gallery" className="flex items-center" onClick={() => sendGTMEvent({ event: 'VIEW_GALLERY', user: session?.user.email || "unauthenticated" })}
            >
              {t('gallery.viewFull')} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {sampleImages.map((image) => (
            <motion.div
              key={image.id}
              className="relative rounded-xl overflow-hidden aspect-square group"
              variants={itemVariants}
              onMouseEnter={() => setIsHovering(image.id)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <Image
                src={image.src}
                alt={t(`gallery.prompts.${image.id}`)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm line-clamp-2">{t(`gallery.prompts.${image.id}`)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};