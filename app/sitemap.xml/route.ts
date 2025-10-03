import { prisma } from '@/lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Get all published events
  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/carte</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/soumettre</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${events
    .map(
      (event) => `
  <url>
    <loc>${baseUrl}/evenement/${event.slug}</loc>
    <lastmod>${event.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
