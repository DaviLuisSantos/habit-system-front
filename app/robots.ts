import type { MetadataRoute } from 'next';

const PRIVATE_ROUTES = [
  '/dashboard',
  '/habits',
  '/analytics',
  '/history',
  '/settings',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/offline.html',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/$', '/login', '/register'],
      disallow: PRIVATE_ROUTES,
    },
  };
}
