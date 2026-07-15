import { clsx } from 'clsx';
import { restaurantConfig } from '@/config/restaurantConfig';

type BrandLogoVariant = 'navbar' | 'footer' | 'admin' | 'auth';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  imageClassName?: string;
}

export function BrandLogo({ variant = 'auth', className, imageClassName }: BrandLogoProps) {
  const logo = restaurantConfig.logo;
  const srcByVariant: Record<BrandLogoVariant, string> = {
    navbar: logo.navbarSrc,
    footer: logo.footerSrc,
    admin: logo.adminSrc,
    auth: logo.authSrc,
  };

  return (
    <span className={clsx('inline-flex items-center', className)}>
      <img
        src={srcByVariant[variant]}
        alt={logo.alt}
        className={clsx('block object-contain', imageClassName)}
      />
    </span>
  );
}
