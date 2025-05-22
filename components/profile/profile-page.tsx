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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getImageStorage } from '@/lib/indexedDB';

import {
  History,
  LogOut,
  Heart,
  Download,
  Globe,
  Loader2,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import Order from '@/models/Order';

// Format date function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  const locale = localStorage.getItem('language') || 'en';

  return new Intl.DateTimeFormat(locale, {
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
  star?: boolean;
  timestamp?: number; // 添加时间戳属性用于排序
  metadata?: {
    prompt?: string;
    aspect_ratio?: string;
    seed?: string | number;
    num_inference_steps?: number;
    output_format?: string;
    outpt_quality?: string;
    megapixels?: number;
    createdAt?: Date | string;
  };
}

interface Order {
  id?: string;
  _id?: string;
  product: string;
  price: number;
  createDate: string;
  updateDate?: string;
  status?: string;
  payName?: string;
  payEmail?: string;
  payCurrency?: string;
  userId?: string;
}

interface UserData {
  thirdPartId?: string;
  name?: string;
  email?: string;
  image?: string;
  balance: number;
  createDate?: string;
  updateDate?: string;
}



const ProfilePage = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [userData, setUserData] = useState<UserData>({
    balance: 0
  });
  // 单独存储订单数据
  const [orders, setOrders] = useState<Order[]>([]);
  // 从 loadedImages 计算图片相关数据
  // 存储从IndexedDB加载的图片
  const [loadedImages, setLoadedImages] = useState<UserImage[]>([]);
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

  // 加载图片的公共函数
  const loadImagesFromIndexedDB = async () => {
    if (typeof window === 'undefined' || !mounted || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const imageStorage = getImageStorage();
      const images = await imageStorage.listAllImages();

      if (images.length > 0) {
        const formattedImages: UserImage[] = [];

        // 处理每个存储的图片
        for (const item of images) {
          try {
            // 从IndexedDB获取图片Blob
            const imageData = await imageStorage.getImage(item.id);
            if (imageData && imageData.blob) {
              // 创建临时URL用于显示
              const objectUrl = imageStorage.createImageUrl(imageData.blob);

              // 格式化日期
              const date = new Date(imageData.metadata.createdAt || new Date());
              const now = new Date();
              const diffTime = now.getTime() - date.getTime(); // 正确的顺序：当前时间 - 创建时间
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

              // 使用适当的时间格式
              let formattedDate;
              if (diffDays === 0) {
                // Today - show specific time
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                formattedDate = `${t('profile.dateFormat.today')} ${t('profile.dateFormat.time', { hours, minutes })}`;
              } else if (diffDays < 7) {
                const locale = localStorage.getItem('language') || 'en';
                formattedDate = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffDays, 'day'); // negative value indicates past
              } else {
                // More than a week - show specific date
                formattedDate = formatDate(date.toISOString());
              }

              formattedImages.push({
                id: item.id,
                url: objectUrl,
                prompt: imageData.metadata.prompt || '',
                date: formattedDate,
                star: imageData.metadata.star || false,
                // 添加原始时间戳用于排序
                timestamp: date.getTime(),
                // 添加元数据信息
                metadata: {
                  prompt: imageData.metadata.prompt || '',
                  aspect_ratio: imageData.metadata.aspect_ratio || '1:1',
                  seed: imageData.metadata.seed || 'Random',
                  num_inference_steps: imageData.metadata.num_inference_steps || 4,
                  output_format: imageData.metadata.output_format || 'png',
                  outpt_quality: imageData.metadata.outpt_quality || 'standard',
                  megapixels: imageData.metadata.megapixels || 1,
                  createdAt: imageData.metadata.createdAt || new Date()
                }
              });
            }
          } catch (error) {
            console.error(`Error loading image ${item.id}:`, error);
          }
        }

        // 直接使用原始时间戳进行排序，确保最新的在前面
        const sortedImages = [...formattedImages].sort((a, b) => {
          // 降序排列，时间戳大的（越新的）在前面
          return (b.timestamp || 0) - (a.timestamp || 0);
        });

        // 更新加载的图片
        setLoadedImages(sortedImages);
      }
    } catch (error) {
      console.error('Error loading images from IndexedDB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时加载图片
  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadImagesFromIndexedDB();
    }
  }, [mounted, isAuthenticated]);

  // 处理标签切换
  const handleTabChange = async (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);

    if (['images', 'favorites'].includes(value)) {
      await loadImagesFromIndexedDB();
      // 当切换到图片标签时，重新加载图片
    } else if (value === 'orders') {
      // 当切换到订单标签时，加载订单数据
      await getOrders();
    }
  };

  // 下载图片功能
  const downloadImage = async (image: UserImage) => {
    try {
      // 创建一个链接元素
      const link = document.createElement('a');
      link.href = image.url;

      // 生成文件名，使用提示词的前几个字或图片ID
      const promptWords = image.prompt.split(' ').slice(0, 3).join('_');
      const fileName = promptWords.length > 0
        ? `${promptWords}_${image.id.slice(0, 6)}`
        : `image_${image.id}`;

      // 添加文件后缀
      const extension = image.metadata?.output_format || 'png';
      link.download = `${fileName}.${extension}`;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);

      // 显示成功消息
      toast({
        title: t('profile.downloadSuccess'),
        description: t('profile.downloadSuccessDescription')
      });
    } catch (error) {
      console.error('Download error:', error);

      // 显示错误消息
      toast({
        title: t('profile.downloadError'),
        description: t('profile.downloadErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  // 收藏/取消收藏图片
  const toggleStar = async (image: UserImage) => {
    try {
      // 从IndexedDB获取图片数据
      const imageStorage = getImageStorage();
      const imageData = await imageStorage.getImage(image.id);

      if (!imageData) {
        throw new Error('Image data not found');
      }

      // 更新元数据中的star状态
      const updatedMetadata = {
        ...imageData.metadata,
        star: !image.star
      };

      // 重新存储图片，更新元数据
      await imageStorage.updateImageMetadata(image.id, updatedMetadata);

      // 更新本地状态
      setLoadedImages(prevImages =>
        prevImages.map(img =>
          img.id === image.id ? { ...img, star: !img.star } : img
        )
      );

      // 显示成功消息
      toast({
        title: image.star ? t('profile.unstarSuccess') : t('profile.starSuccess'),
        description: image.star ? t('profile.unstarSuccessDescription') : t('profile.starSuccessDescription')
      });
    } catch (error) {
      console.error('Star toggle error:', error);

      // 显示错误消息
      toast({
        title: t('profile.starError'),
        description: t('profile.starErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  const getOrders = async () => {
    try {
      setIsLoading(true);

      // 获取订单历史
      const orderRes = await fetch(`/api/order/user/${session?.user.id}`);

      if (!orderRes.ok) {
        throw new Error(`Error fetching orders: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();

      if (orderData.success && Array.isArray(orderData.orders)) {
        // 将订单数据单独存储
        setOrders(orderData.orders || []);
      } else {
        console.error('Invalid order data format:', orderData);
        throw new Error('Invalid order data format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: t('profile.ordersError'),
        description: t('profile.ordersErrorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 在页面可见性变化时重新加载图片
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted || !isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, reloading images');
        await loadImagesFromIndexedDB();
      }
    };

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // 释放对象URL
      loadedImages.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [mounted, isAuthenticated, loadedImages]);

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

          // 用户数据结构根据User模型调整
          // 设置用户数据
          setUserData({
            thirdPartId: userData.thirdPartId,
            name: userData.name,
            email: userData.email,
            image: userData.image,
            balance: userData.balance || 0,
            createDate: userData.createDate,
            updateDate: userData.updateDate
          });

          // 不需要单独设置图片相关数据，直接从 loadedImages 计算
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: t('profile.error.title'),
            description: t('profile.error.fetchUserData'),
            variant: 'destructive'
          });

          // Initialize with empty data instead of mock data
          setUserData({
            thirdPartId: '',
            name: '',
            email: '',
            image: '',
            balance: 0,
            createDate: '',
            updateDate: ''
          });

          // 不需要单独设置图片相关数据，直接从 loadedImages 计算
          setOrders([]);
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
    <div className="flex min-h-screen">
      <div className="w-full">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - User Profile */}
          <div className="w-full md:w-64 lg:w-80 flex-shrink-0 p-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-4"
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
                      <Button size="sm" variant="outline" onClick={() => router.push('/pricing')}>
                        {t('profile.recharge')}
                      </Button>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="flex justify-around py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{loadedImages.length}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.images')}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{loadedImages.filter(img => img.star).length}</p>
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
          <div className="flex-grow p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full"
            >
              <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>

              <Tabs
                value={activeTab}
                defaultValue="images"
                onValueChange={handleTabChange}
              >
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
                  {loadedImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {loadedImages.map((image) => (
                        <div key={image.id} className="group relative overflow-hidden rounded-md border border-border">
                          <div className="relative aspect-square">
                            <Image
                              src={image.url}
                              alt={image.prompt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                            <p className="text-xs line-clamp-2">{image.prompt}</p>

                            {/* 显示基本元数据 */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                {image.metadata?.aspect_ratio || '1:1'}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                {image.metadata?.output_format?.toUpperCase() || 'PNG'}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                Seed: {image.metadata?.seed || 'Random'}
                              </span>
                            </div>

                            {/* 日期和操作按钮 */}
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">{image.date}</span>
                              <div className="flex space-x-1">
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  onClick={() => toggleStar(image)}
                                  title="收藏"
                                >
                                  <Heart className={`h-3 w-3 ${image.star ? 'fill-primary text-primary' : ''}`} />
                                </button>
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  title="下载"
                                  onClick={() => downloadImage(image)}
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  title="查看详细信息"
                                  onClick={() => {
                                    // 显示详细元数据的弹窗
                                    toast({
                                      title: '图片详细信息',
                                      description: (
                                        <div className="space-y-2 text-xs">
                                          <div><strong>提示词：</strong> {image.prompt}</div>
                                          <div><strong>纵横比：</strong> {image.metadata?.aspect_ratio || '1:1'}</div>
                                          <div><strong>像素：</strong> {image.metadata?.megapixels ? `${image.metadata.megapixels}MP` : '1MP'}</div>
                                          <div><strong>输出格式：</strong> {image.metadata?.output_format || 'png'}</div>
                                          <div><strong>输出质量：</strong> {image.metadata?.outpt_quality || 'standard'}</div>
                                          <div><strong>步数：</strong> {image.metadata?.num_inference_steps || 4}</div>
                                          <div><strong>Seed：</strong> {image.metadata?.seed || 'Random'}</div>
                                          <div><strong>创建时间：</strong> {new Date(image.timestamp || 0).toLocaleString()}</div>
                                        </div>
                                      ),
                                      duration: 10000,
                                    });
                                  }}
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('profile.empty.images.title')}</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        {t('profile.empty.images.description')}
                      </p>
                      <Button onClick={() => router.push('/generate')}>
                        {t('profile.createImages')}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id || order._id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                              <div>

                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>
                                    <span className="inline-block w-30">{t('profile.orders.paymentDate')}</span>
                                    {formatDate(order.createDate)}
                                  </p>
                                  {order.payName && (
                                    <p>
                                      <span className="inline-block w-30">{t('profile.orders.payer')}</span>
                                      {order.payName}
                                    </p>
                                  )}
                                  {order.payEmail && (
                                    <p>
                                      <span className="inline-block w-30">{t('profile.orders.payerEmail')}</span>
                                      {order.payEmail}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right self-start">
                                <p className="font-bold text-lg">{order.price} {t('profile.orders.credits')}</p>
                                {order.payCurrency && (
                                  <p className="text-sm text-muted-foreground">
                                    {t('profile.orders.paidWith')} {order.payCurrency.toUpperCase()}
                                  </p>
                                )}
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
                      <Button variant="outline" onClick={() => router.push('/pricing')}>
                        {t('profile.recharge')}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Favorite Images Tab */}
                <TabsContent value="favorites">
                  {loadedImages.filter(img => img.star).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {loadedImages.filter(img => img.star).map((image) => (
                        <div key={image.id} className="group relative overflow-hidden rounded-md border border-border">
                          <div className="relative aspect-square">
                            <Image
                              src={image.url}
                              alt={image.prompt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                            <p className="text-xs line-clamp-2">{image.prompt}</p>

                            {/* 显示基本元数据 */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                {image.metadata?.aspect_ratio || '1:1'}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                {image.metadata?.output_format?.toUpperCase() || 'PNG'}
                              </span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                                Seed: {image.metadata?.seed || 'Random'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">{image.date}</span>
                              <div className="flex space-x-1">
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  onClick={() => toggleStar(image)}
                                >
                                  <Heart className={`h-3 w-3 ${image.star ? 'fill-primary text-primary' : ''}`} />
                                </button>
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  title="下载"
                                  onClick={() => downloadImage(image)}
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-1 rounded-full hover:bg-primary/20"
                                  title="查看详细信息"
                                  onClick={() => {
                                    // 显示详细元数据的弹窗
                                    toast({
                                      title: '图片详细信息',
                                      description: (
                                        <div className="space-y-2 text-xs">
                                          <div><strong>提示词：</strong> {image.prompt}</div>
                                          <div><strong>纵横比：</strong> {image.metadata?.aspect_ratio || '1:1'}</div>
                                          <div><strong>像素：</strong> {image.metadata?.megapixels ? `${image.metadata.megapixels}MP` : '1MP'}</div>
                                          <div><strong>输出格式：</strong> {image.metadata?.output_format || 'png'}</div>
                                          <div><strong>输出质量：</strong> {image.metadata?.outpt_quality || 'standard'}</div>
                                          <div><strong>步数：</strong> {image.metadata?.num_inference_steps || 4}</div>
                                          <div><strong>Seed：</strong> {image.metadata?.seed || 'Random'}</div>
                                          <div><strong>创建时间：</strong> {new Date(image.timestamp || 0).toLocaleString()}</div>
                                        </div>
                                      ),
                                      duration: 10000,
                                    });
                                  }}
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('profile.empty.favorites.title')}</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        {t('profile.empty.favorites.description')}
                      </p>
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