"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import getStripe from '@/lib/stripe';
import { useTranslations } from 'next-intl';
import { sendGTMEvent } from '@next/third-parties/google';



// 定义套餐类型
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const PricingPage = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('pricing');

  // 套餐数据
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: t('plans.free.name'),
      price: 0,
      currency: 'USD',
      description: t('plans.free.description'),
      features: [
        t('plans.free.features.1'),
        t('plans.free.features.2'),
        t('plans.free.features.3'),
        t('plans.free.features.4')
      ],
      buttonText: t('plans.free.buttonText')
    },
    {
      id: 'basic',
      name: t('plans.basic.name'),
      price: 10,
      currency: 'USD',
      description: t('plans.basic.description'),
      features: [
        t('plans.basic.features.1'),
        t('plans.basic.features.2'),
        t('plans.basic.features.3'),
        t('plans.basic.features.4'),
        t('plans.basic.features.5')
      ],
      popular: true,
      buttonText: t('plans.basic.buttonText'),
    },
    {
      id: 'pro',
      name: t('plans.pro.name'),
      price: 50,
      currency: 'USD',
      description: t('plans.pro.description'),
      features: [
        t('plans.pro.features.1'),
        t('plans.pro.features.2'),
        t('plans.pro.features.3'),
        t('plans.pro.features.4'),
        t('plans.pro.features.5'),
        t('plans.pro.features.6')
      ],
      buttonText: t('plans.pro.buttonText'),
    }
  ];

  // 处理套餐订阅
  const handleSubscription = async (type: string) => {
    sendGTMEvent({ event: 'IG_SUBSCRIBE', user: session?.user.email || "unauthenticated", type, billing_cycle: "monthly" })
    if (!isAuthenticated) {
      toast({
        title: t('toast.loginRequired.title'),
        description: t('toast.loginRequired.description'),
        variant: 'destructive'
      });
      router.push('/auth/login');
      return;
    }


    let userId = session?.user.id;
    if (!userId) {
      // 额外检查，确保用户ID存在
      router.push('/api/auth/signin');
      return;
    }

    if (type === 'free') {
      toast({
        title: t('toast.freeUser.title'),
        description: t('toast.freeUser.description'),
      });
      return;
    }

    try {
      setIsLoading(true);
      setSelectedPlan(type);


      const stripe = await getStripe();
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, type })
      })


      if (response.status === 500) {
        return
      }

      const data = await response.json()
      const result = stripe.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        console.log(result.error.message)
      }
    } catch (error) {
      console.error('订阅错误:', error);
      toast({
        title: t('toast.subscriptionError.title'),
        description: t('toast.subscriptionError.description'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('title')}
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  {t('plans.basic.popular')}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  {plan.id === 'pro' && <Zap className="h-5 w-5 mr-2 text-yellow-500" />}
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">{t('perMonth')}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : (plan.id === 'free' ? "outline" : "secondary")}
                  onClick={() => handleSubscription(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                >
                  {isLoading && selectedPlan === plan.id ? t('loading') : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('faq.title')}</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="text-lg font-medium mb-2">{t('faq.questions.changePlan.question')}</h3>
            <p className="text-muted-foreground">{t('faq.questions.changePlan.answer')}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">{t('faq.questions.refund.question')}</h3>
            <p className="text-muted-foreground">{t('faq.questions.refund.answer')}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">{t('faq.questions.features.question')}</h3>
            <p className="text-muted-foreground">{t('faq.questions.features.answer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
