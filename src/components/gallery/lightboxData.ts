// Safe to edit by hand
// Builds the data-* attributes a lightbox trigger button carries
// (Lightbox.astro reads them): the large image URL from Sanity's CDN, its
// intrinsic size (so the dialog reserves the right box), the alt text from
// Sanity and a caption.

import { urlFor, parseSanityAssetDimensions } from '@/lib/sanity';

interface Img {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
}

export function lightboxAttrs(image: Img | null | undefined, caption: string) {
  if (!image?.asset) return {};
  const dims = parseSanityAssetDimensions(image);
  const W = 1600;
  const width = dims ? Math.min(W, dims.width) : W;
  const height = dims ? Math.round((dims.height * width) / dims.width) : undefined;
  return {
    'data-lightbox': '',
    'data-full': urlFor(image as any)
      .width(width)
      .quality(80)
      .auto('format')
      .url(),
    'data-w': String(width),
    'data-h': height ? String(height) : undefined,
    'data-alt': image.alt ?? '',
    'data-caption': caption,
  };
}
