"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
 
const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              <Button className="w-full justify-start" onClick={login}>
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
                {t('login.google')}
              </Button>
              {/* <Button className="w-full justify-start" variant="outline" onClick={login}>
                <svg className="h-5 w-5 mr-2 text-[#1DA1F2] fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                {t('login.twitter')}
              </Button> */}
            </div>

            <div className="relative flex items-center justify-center mt-6 mb-6">
              <Separator className="w-full" />
              <span className="bg-background px-2 text-xs text-muted-foreground absolute">{t('login.or')}</span>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-4">
              {t('login.guest.title')}
            </p>
            <Button variant="secondary" className="w-full" onClick={login}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('login.guest.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 