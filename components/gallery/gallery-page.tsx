"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  SlidersHorizontal, 
  Heart, 
  Download, 
  Share2,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

// Sample gallery data
const galleryImages = [
  {
    id: '1',
    url: 'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg',
    prompt: 'Futuristic cityscape with neon lights and flying cars',
    creator: 'AI Artist 1',
    likes: 124,
    downloads: 45,
  },
  {
    id: '2',
    url: 'https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg',
    prompt: 'Underwater ancient temple with bioluminescent plants',
    creator: 'AI Artist 2',
    likes: 89,
    downloads: 32,
  },
  {
    id: '3',
    url: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg',
    prompt: 'Space station orbiting a gas giant with rings',
    creator: 'AI Artist 3',
    likes: 203,
    downloads: 78,
  },
  {
    id: '4',
    url: 'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg',
    prompt: 'Floating islands with waterfalls in a sunset sky',
    creator: 'AI Artist 4',
    likes: 156,
    downloads: 51,
  },
  {
    id: '5',
    url: 'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg',
    prompt: 'Cyberpunk street market with holographic advertisements',
    creator: 'AI Artist 5',
    likes: 176,
    downloads: 67,
  },
  {
    id: '6',
    url: 'https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg',
    prompt: 'Steampunk airship battle above victorian city',
    creator: 'AI Artist 6',
    likes: 201,
    downloads: 59,
  },
  {
    id: '7',
    url: 'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg',
    prompt: 'Dreamlike forest with glowing mushrooms and fireflies',
    creator: 'AI Artist 7',
    likes: 134,
    downloads: 43,
  },
  {
    id: '8',
    url: 'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg',
    prompt: 'Medieval fantasy castle on a floating crystal island',
    creator: 'AI Artist 8',
    likes: 186,
    downloads: 71,
  },
];

const GalleryPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // 检查用户是否已登录，未登录则重定向
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/gallery');
    }
  }, [isAuthenticated, router]);

  // 如果未登录，不渲染页面内容
  if (!isAuthenticated) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter the images or make an API call
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 md:py-16">
      <div className="w-full max-w-[1400px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Gallery</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Explore and get inspired by amazing AI-generated artwork from our community
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by prompt or style..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  Sort By <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Newest First</DropdownMenuItem>
                <DropdownMenuItem>Most Popular</DropdownMenuItem>
                <DropdownMenuItem>Most Downloaded</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Gallery Tabs */}
        <Tabs defaultValue="trending" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {galleryImages.map((image) => (
              <motion.div
                key={image.id}
                className="group relative rounded-xl overflow-hidden aspect-square"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                <Image
                  src={image.url}
                  alt={image.prompt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 border-none">
                        <Heart className="h-4 w-4 text-white" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 border-none">
                        <Download className="h-4 w-4 text-white" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 border-none">
                        <Share2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm line-clamp-2 mb-1">{image.prompt}</p>
                    <p className="text-white/70 text-xs mb-2">by {image.creator}</p>
                    <div className="flex items-center gap-3 text-white/70 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {image.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {image.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Button */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg">
            Load More Images
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;