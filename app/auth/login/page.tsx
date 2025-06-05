"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Github, Loader2 } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { sendGTMEvent } from '@next/third-parties/google';

const LoginPage = () => {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const t = useTranslations();


  useEffect(() => {
    setMounted(true);
  }, []);

  // 检查NextAuth会话状态
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  // 如果已登录，重定向到个人中心
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/profile');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  // 处理NextAuth登录
  const handleSignIn = async (provider: string) => {
    sendGTMEvent({ event: 'LOGIN', provider })
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: '/', redirect: true });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      // 由于重定向，这里的错误处理不会执行，除非发生了客户端错误
      setIsLoading(false);
    }
    // 注意：如果成功重定向，finally 块不会执行
  };

  // 访客登录功能已移除

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container max-w-md px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{t('login.title')}</h1>
          <p className="text-muted-foreground">
            {t('login.description')}
          </p>
        </motion.div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button
                className="w-full justify-start"
                onClick={() => handleSignIn('google')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('login.loading') || 'Loading...'}
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t('login.google') || 'Sign in with Google'}
                  </>
                )}
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleSignIn('github')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('login.loading') || 'Loading...'}
                  </>
                ) : (
                  <>
                    <Github className="h-5 w-5 mr-2" />
                    {t('login.github') || 'Sign in with GitHub'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 