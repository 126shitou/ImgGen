"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Settings,
  LogOut,
  Image as ImageIcon,
  Heart,
  Download,
  Bookmark,
  History,
  Lock,
  RefreshCw,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

// Mock user data
const mockUser = {
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  imagesGenerated: 42,
  dateJoined: 'January 2025',
};

// Mock user images data
const mockUserImages = [
  {
    id: '1',
    url: 'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg',
    prompt: 'Futuristic cityscape with neon lights and flying cars',
    date: '2 days ago',
  },
  {
    id: '2',
    url: 'https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg',
    prompt: 'Underwater ancient temple with bioluminescent plants',
    date: '1 week ago',
  },
  {
    id: '3',
    url: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg',
    prompt: 'Space station orbiting a gas giant with rings',
    date: '2 weeks ago',
  },
  {
    id: '4',
    url: 'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg',
    prompt: 'Floating islands with waterfalls in a sunset sky',
    date: '3 weeks ago',
  },
];

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [mounted, status, router]);

  if (!mounted || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container max-w-6xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-col items-center text-center pb-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <Image
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <CardTitle>{mockUser.name}</CardTitle>
                  <CardDescription>@{mockUser.username}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{mockUser.imagesGenerated}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.images')}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">{t('profile.following')}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">{t('profile.followers')}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{t('profile.account')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{t('profile.settings')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <History className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{t('profile.generationHistory')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{t('profile.savedImages')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{t('profile.privacy')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>

              <Tabs defaultValue="images">
                <TabsList className="mb-6">
                  <TabsTrigger value="images">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {t('profile.tabs.images')}
                  </TabsTrigger>
                  <TabsTrigger value="liked">
                    <Heart className="h-4 w-4 mr-2" />
                    {t('profile.tabs.liked')}
                  </TabsTrigger>
                  <TabsTrigger value="saved">
                    <Bookmark className="h-4 w-4 mr-2" />
                    {t('profile.tabs.saved')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="images">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mockUserImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="relative aspect-square">
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <p className="line-clamp-2 mb-2">{image.prompt}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{image.date}</Badge>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="liked">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('profile.empty.liked.title')}</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      {t('profile.empty.liked.description')}
                    </p>
                    <Button>
                      <Globe className="h-4 w-4 mr-2" />
                      {t('profile.exploreGallery')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="saved">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('profile.empty.saved.title')}</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      {t('profile.empty.saved.description')}
                    </p>
                    <Button>
                      <Globe className="h-4 w-4 mr-2" />
                      {t('profile.exploreGallery')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;