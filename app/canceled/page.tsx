"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function CanceledPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-2 border-destructive/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('payment.canceled.title')}</CardTitle>
            <CardDescription>
              {t('payment.canceled.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('payment.canceled.message')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              {t('payment.canceled.goHome')}
            </Button>
            <Button onClick={() => router.push("/profile")}>
              {t('payment.canceled.tryAgain')}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}