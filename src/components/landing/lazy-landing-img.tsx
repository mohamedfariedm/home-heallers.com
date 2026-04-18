'use client';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  alt?: string;
};

/** Arbitrary URLs — avoids next/image remotePatterns for builder preview. */
export function LazyLandingImg({ alt = '', ...rest }: Props) {
  return <img alt={alt} loading="lazy" decoding="async" {...rest} />;
}
