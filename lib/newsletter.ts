import { prisma } from './prisma'
import { Resend } from 'resend'
import { NewsletterTemplate } from '@/emails/NewsletterTemplate'
import { NewsletterEventDTO } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    id: event.id,
    title: event.title,
    slug: event.slug,
    startAt: event.startAt.toISOString(),
    imageUrl: event.imageUrl || undefined,
    city: event.city || undefined,
    venue: event.venue?.name,
    category: event.category,
  }))

  const subject = `🎉 Cette semaine : ${eventsDTO.length} événements à ne pas manquer !`

  return { events: eventsDTO, subject }
}

export async function sendNewsletter(to: string[], subject: string, events: NewsletterEventDTO[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const { data, error } = await resend.emails.send({
      from: 'Territoire en Fête <noreply@territoireenfete.fr>',
      to,
      subject,
      react: NewsletterTemplate({ events, baseUrl }),
    })

    if (error) {
      console.error('Error sending newsletter:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return { success: false, error }
  }
}

export async function sendNewsletterToAllSubscribers(subject: string, events: NewsletterEventDTO[]) {
  const subscribers = await prisma.subscriber.findMany({
    where: {
      confirmed: true,
      unsubscribed: false,
    },
    select: {
      email: true,
    },
  })

  const emails = subscribers.map((s) => s.email)

  // Send in batches of 100
  const batchSize = 100
  const results = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const result = await sendNewsletter(batch, subject, events)
    results.push(result)
  }

  return results
}
