import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'منصة إسناد للتنمية الزراعية',
    short_name: 'إسناد',
    description: 'منصة متكاملة لتقديم ومتابعة طلبات تقنين أوضاع الأراضي',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8faf7',
    theme_color: '#0d7a3e',
    lang: 'ar',
    dir: 'rtl',
    categories: ['government', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
