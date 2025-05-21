"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Settings,
  History,
  Bookmark,
  Lock,
  LogOut,
  Heart,
  Download,
  Globe,
  ChevronRight,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

// Format date function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Define interfaces for data types
interface UserImage {
  id: string;
  url: string;
  prompt: string;
  date: string;
}

interface Order {
  id: string;
  product: string;
  price: number;
  createDate: string;
  status: string;
}

interface UserData {
  balance: number;
  imagesGenerated: number;
  savedImages: UserImage[];
  favoriteImages: UserImage[];
  orders: Order[];
}

// Mock user images data
const mockUserImages: UserImage[] = [
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData>({
    balance: 0,
    imagesGenerated: 0,
    savedImages: [],
    favoriteImages: [],
    orders: []
  });
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

  useEffect(() => {
    if (session?.user?.id && mounted) {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/user/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();
          setUserData({
            balance: userData.balance || 0,
            imagesGenerated: userData.imagesGenerated || 0,
            savedImages: userData.savedImages || mockUserImages,
            favoriteImages: userData.favoriteImages || mockUserImages.slice(0, 2),
            orders: userData.orders || [
              {
                id: '1',
                product: '100 积分充值',
                price: 100,
                createDate: '2023-05-15T10:30:00Z',
                status: '已完成'
              },
              {
                id: '2',
                product: '500 积分充值',
                price: 500,
                createDate: '2023-06-20T14:45:00Z',
                status: '已完成'
              }
            ]
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData({
            balance: 1250,
            imagesGenerated: 47,
            savedImages: mockUserImages,
            favoriteImages: mockUserImages.slice(0, 2),
            orders: [
              {
                id: '1',
                product: '100 积分充值',
                price: 100,
                createDate: '2023-05-15T10:30:00Z',
                status: '已完成'
              },
              {
                id: '2',
                product: '500 积分充值',
                price: 500,
                createDate: '2023-06-20T14:45:00Z',
                status: '已完成'
              }
            ]
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    }
  }, [session, mounted]);

  if (!mounted || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="container max-w-6xl px-4 md:px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-col items-center text-center pb-2">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session?.user) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container max-w-6xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Sidebar - User Profile */}
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
                      src={session.user.image || '/placeholder-avatar.png'}
                      alt={session.user.name || 'User'}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <CardTitle>{session.user.name || t('profile.anonymous')}</CardTitle>
                  <CardDescription>{session.user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Balance Display */}
                  <div className="bg-primary/10 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('profile.balance')}</p>
                        <p className="text-2xl font-bold">{userData.balance}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        {t('profile.recharge')}
                      </Button>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="flex justify-around py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userData.imagesGenerated}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.images')}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userData.favoriteImages.length}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.favorites')}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />



                  {/* Sign Out Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('profile.signOut')}
                  </Button>
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
                <TabsList className="mb-6 bg-background border border-border rounded-md p-1 w-fit">
                  <TabsTrigger 
                    value="orders"
                    className="text-sm font-medium py-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {t('profile.tabs.orders')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="images"
                    className="text-sm font-medium py-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {t('profile.tabs.images')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites"
                    className="text-sm font-medium py-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {t('profile.tabs.favorites')}
                  </TabsTrigger>
                </TabsList>

                {/* Generated Images Tab */}
                <TabsContent value="images">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {userData.savedImages.map((image) => (
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

                {/* Orders Tab */}
                <TabsContent value="orders">
                  {userData.orders.length > 0 ? (
                    <div className="space-y-4">
                      {userData.orders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{order.product}</h3>
                                <p className="text-sm text-muted-foreground">{formatDate(order.createDate)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{order.price} 积分</p>
                                <Badge variant="outline" className="mt-1">{order.status}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('profile.empty.orders.title')}</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        {t('profile.empty.orders.description')}
                      </p>
                      <Button variant="outline">
                        {t('profile.recharge')}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Saved Images Tab */}
                <TabsContent value="saved">
                  {userData.savedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {userData.savedImages.map((image) => (
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
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
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
                  )}
                </TabsContent>

                {/* Favorite Images Tab */}
                <TabsContent value="favorites">
                  {userData.favoriteImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {userData.favoriteImages.map((image) => (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('profile.empty.favorites.title')}</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        {t('profile.empty.favorites.description')}
                      </p>
                      <Button>
                        <Globe className="h-4 w-4 mr-2" />
                        {t('profile.exploreGallery')}
                      </Button>
                    </div>
                  )}
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