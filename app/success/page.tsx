"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const router = useRouter();
  const t = useTranslations();
  const [countdown, setCountdown] = useState(5);

  // Automatically redirect to profile page after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/profile");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-2 border-green-500/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('payment.success.title')}</CardTitle>
            <CardDescription>
              {t('payment.success.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('payment.success.message')}
            </p>
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="font-medium">{t('payment.success.redirecting')} {countdown}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/profile")}>
              {t('payment.success.goToProfile')}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
