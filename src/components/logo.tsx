'use client';

import Image from 'next/image';
import cn from '@/utils/class-names';

/** Full wordmark (icon + Arabic text), transparent background */
const LOGO_FULL = '/logo-primary.png?v=2';
/** Icon mark only */
const LOGO_ICON = '/logo-primary.svg';

interface LogoProps {
  iconOnly?: boolean;
  className?: string;
}

export default function Logo({ iconOnly = false, className }: LogoProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-transparent',
        iconOnly ? 'h-9 w-9' : 'h-14 w-full',
        className
      )}
    >
      <Image
        src={iconOnly ? LOGO_ICON : LOGO_FULL}
        alt="هوم هيلرز"
        width={iconOnly ? 36 : 200}
        height={iconOnly ? 45 : 88}
        priority
        className={cn(
          'bg-transparent object-contain',
          iconOnly
            ? 'h-9 w-9 max-h-9 max-w-9'
            : 'mx-auto h-auto w-auto max-h-14 max-w-[200px]'
        )}
      />
    </div>
  );
}
