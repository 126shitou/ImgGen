"use client";

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Resources */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  {t('footer.copyright')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ImageGen Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;