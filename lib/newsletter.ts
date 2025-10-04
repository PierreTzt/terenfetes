import { prisma } from './prisma'
import { Resend } from 'resend'
import WeeklyNewsletter from '@/emails/WeeklyNewsletter'
import { getUnsubscribeUrl } from '@/app/api/newsletter/unsubscribe/[token]/route'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

interface NewsletterEventDTO {
  title: string
  slug: string
  startAt: string
  imageUrl?: string
  venue?: {
    name: string
    city?: string
  }
  price?: {
    min?: number
    max?: number
  }
  category: string[]
}

export async function buildWeeklyNewsletter(): Promise<{ events: NewsletterEventDTO[], subject: string }> {
  // Get events for the next 7 days
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startAt: {
        gte: today,
        lte: nextWeek,
      },
    },
    include: {
      venue: true,
      metrics: {
        orderBy: {
          metricDate: 'desc',
        },
        take: 7,
      },
    },
    orderBy: [
      { startAt: 'asc' },
    ],
    take: 10,
  })

  // Calculate scores based on CTR and recency
  const scoredEvents = events.map((event) => {
    const totalClicks = event.metrics.reduce((sum, m) => sum + m.clicksCta, 0)
    const totalViews = event.metrics.reduce((sum, m) => sum + m.views, 0)
    const ctr = totalViews > 0 ? totalClicks / totalViews : 0

    // Fresher events get higher score
    const daysSinceCreated = (today.getTime() - event.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const freshnessScore = Math.max(0, 1 - daysSinceCreated / 30)

    const score = ctr * 0.7 + freshnessScore * 0.3

    return { ...event, score }
  })

  // Sort by score and take top N
  const topEvents = scoredEvents
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const eventsDTO: NewsletterEventDTO[] = topEvents.map((event) => ({
    title: event.title,
    slug: event.slug,
    startAt: event.startAt.toISOString(),
    imageUrl: event.imageUrl || undefined,
    venue: event.venue ? {
      name: event.venue.name,
      city: event.venue.city || undefined,
    } : undefined,
    price: {
      min: event.priceMin ? parseFloat(event.priceMin.toString()) : undefined,
      max: event.priceMax ? parseFloat(event.priceMax.toString()) : undefined,
    },
    category: event.category,
  }))

  const subject = `🎉 Cette semaine : ${eventsDTO.length} événements à ne pas manquer !`

  return { events: eventsDTO, subject }
}

export async function sendNewsletter(email: string, subject: string, events: NewsletterEventDTO[]) {
  try {
    // Get unsubscribe URL for this specific email
    const unsubscribeUrl = getUnsubscribeUrl(email)

    const { data, error } = await resend.emails.send({
      from: 'Territoire en Fête <newsletter@territoireenfete.fr>',
      to: email,
      subject,
      react: WeeklyNewsletter({ events, unsubscribeUrl }),
    })

    if (error) {
      console.error(`Error sending newsletter to ${email}:`, error)
      return { success: false, error, email }
    }

    return { success: true, data, email }
  } catch (error) {
    console.error(`Error sending newsletter to ${email}:`, error)
    return { success: false, error, email }
  }
}

export async function sendNewsletterToAllSubscribers(subject: string, events: NewsletterEventDTO[]) {
  const subscribers = await prisma.subscriber.findMany({
    where: {
      confirmed: true,
    },
    select: {
      email: true,
    },
  })

  // Send individually (not in batch) to personalize unsubscribe links
  const results = []

  for (const subscriber of subscribers) {
    const result = await sendNewsletter(subscriber.email, subject, events)
    results.push(result)

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  // Create newsletter record
  await prisma.newsletter.create({
    data: {
      subject,
      sentAt: new Date(),
      recipientCount: successful,
    },
  })

  return {
    total: subscribers.length,
    successful,
    failed,
    results,
  }
}
