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

  // 套餐数据
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: '免费版',
      price: 0,
      currency: 'USD',
      description: '适合初次尝试的用户',
      features: [
        '每天生成5张图片',
        '标准分辨率',
        '基础模型访问',
        '社区支持'
      ],
      buttonText: '当前方案'
    },
    {
      id: 'basic',
      name: '基础版',
      price: 10,
      currency: 'USD',
      description: '适合个人创作者',
      features: [
        '每天生成50张图片',
        '高分辨率输出',
        '所有基础模型',
        '优先客户支持',
        '无水印导出'
      ],
      popular: true,
      buttonText: '选择方案',
    },
    {
      id: 'pro',
      name: '专业版',
      price: 50,
      currency: 'USD',
      description: '适合专业创作者和团队',
      features: [
        '无限生成图片',
        '超高分辨率输出',
        '所有高级模型',
        '24/7专属客户支持',
        '批量生成和API访问',
        '团队协作功能'
      ],
      buttonText: '选择方案',
    }
  ];

  // 处理套餐订阅
  const handleSubscription = async (type: string) => {
    if (!isAuthenticated) {
      toast({
        title: '请先登录',
        description: '您需要登录后才能订阅套餐',
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
        title: '您已经在使用免费版',
        description: '您可以随时升级到付费方案获取更多功能',
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
        title: '订阅失败',
        description: '处理您的订阅请求时出现错误，请稍后再试',
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
          选择适合您的套餐
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          无论您是初学者还是专业创作者，我们都有适合您需求的方案
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
                  最受欢迎
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  {plan.id === 'pro' && <Zap className="h-5 w-5 mr-2 text-yellow-500" />}
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">/月</span>
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
                  {isLoading && selectedPlan === plan.id ? '处理中...' : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">常见问题</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="text-lg font-medium mb-2">如何更改我的套餐？</h3>
            <p className="text-muted-foreground">您可以随时在账户设置中升级或降级您的套餐。升级将立即生效，降级将在当前计费周期结束后生效。</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">是否提供退款？</h3>
            <p className="text-muted-foreground">我们提供30天的退款保证。如果您对服务不满意，请联系我们的客户支持团队。</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">付费套餐包含哪些高级功能？</h3>
            <p className="text-muted-foreground">付费套餐提供更高的图片生成限额、更高分辨率输出、高级模型访问、无水印导出以及优先客户支持等功能。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
