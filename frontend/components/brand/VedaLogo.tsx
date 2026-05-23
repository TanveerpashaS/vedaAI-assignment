import Image from 'next/image';
import Link from 'next/link';

const ICON_SIZES = {
  sm: 30,
  md: 36,
  lg: 40,
} as const;

const TEXT_SIZES = {
  sm: 17,
  md: 20,
  lg: 22,
} as const;

export type VedaLogoSize = keyof typeof ICON_SIZES;

interface VedaLogoProps {
  size?: VedaLogoSize;
  showText?: boolean;
  href?: string | null;
  className?: string;
}

export default function VedaLogo({
  size = 'md',
  showText = true,
  href = '/',
  className,
}: VedaLogoProps) {
  const iconPx = ICON_SIZES[size];
  const gap = size === 'sm' ? 8 : 10;

  const content = (
    <>
      <Image
        src="/veda-logo.png"
        alt="VedaAI"
        width={iconPx}
        height={iconPx}
        priority
        style={{
          width: iconPx,
          height: iconPx,
          flexShrink: 0,
          borderRadius: size === 'sm' ? 8 : 10,
          objectFit: 'cover',
        }}
      />
      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: TEXT_SIZES[size],
            color: '#111827',
            letterSpacing: '-0.3px',
            lineHeight: 1,
          }}
        >
          VedaAI
        </span>
      )}
    </>
  );

  const style = {
    display: 'flex',
    alignItems: 'center',
    gap,
    textDecoration: 'none',
    color: 'inherit',
  };

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}
