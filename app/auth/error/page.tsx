"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthErrorPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');

  useEffect(() => {
    // Get error information from URL
    const error = searchParams.get('error');
    
    // Set error type and message based on the error code
    if (error) {
      setErrorType(error);
      
      switch (error) {
        case 'Configuration':
          setErrorMessage(t('auth.errors.configuration'));
          break;
        case 'AccessDenied':
          setErrorMessage(t('auth.errors.accessDenied'));
          break;
        case 'Verification':
          setErrorMessage(t('auth.errors.verification'));
          break;
        case 'OAuthSignin':
          setErrorMessage(t('auth.errors.oauthSignin'));
          break;
        case 'OAuthCallback':
          setErrorMessage(t('auth.errors.oauthCallback'));
          break;
        case 'OAuthCreateAccount':
          setErrorMessage(t('auth.errors.oauthCreateAccount'));
          break;
        case 'EmailCreateAccount':
          setErrorMessage(t('auth.errors.emailCreateAccount'));
          break;
        case 'Callback':
          setErrorMessage(t('auth.errors.callback'));
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage(t('auth.errors.oauthAccountNotLinked'));
          break;
        case 'SessionRequired':
          setErrorMessage(t('auth.errors.sessionRequired'));
          break;
        default:
          setErrorMessage(t('auth.errors.default'));
      }
    } else {
      setErrorMessage(t('auth.errors.unknown'));
    }
  }, [searchParams, t]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.errorPage.title')}</CardTitle>
          <CardDescription>{t('auth.errorPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('auth.errorPage.alertTitle')}</AlertTitle>
            <AlertDescription>
              {errorMessage}
              {errorType && (
                <div className="mt-2 text-xs opacity-70">
                  {t('auth.errorPage.errorCode')}: {errorType}
                </div>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p>{t('auth.errorPage.suggestion')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('auth.errorPage.tips.tryAgain')}</li>
              <li>{t('auth.errorPage.tips.differentMethod')}</li>
              <li>{t('auth.errorPage.tips.checkConnection')}</li>
              <li>{t('auth.errorPage.tips.contactSupport')}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/auth/login">
              {t('auth.errorPage.backToLogin')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              {t('auth.errorPage.backToHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
