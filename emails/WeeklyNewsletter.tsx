import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Event {
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

interface WeeklyNewsletterProps {
  events: Event[]
  unsubscribeUrl: string
}

export default function WeeklyNewsletter({
  events,
  unsubscribeUrl,
}: WeeklyNewsletterProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatPrice = (min?: number, max?: number) => {
    if (min === 0 && (max === undefined || max === 0)) return 'Gratuit'
    if (min !== undefined && max !== undefined && min === max) return `${min}\u00A0€`
    if (min !== undefined && max !== undefined) return `${min}–${max}\u00A0€`
    if (min !== undefined) return `À partir de ${min}\u00A0€`
    return null
  }

  return (
    <Html>
      <Head />
      <Preview>
        {events.length} événements à ne pas manquer cette semaine sur votre territoire
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Territoire en Fête</Heading>

          <Text style={lead}>
            Votre sélection hebdomadaire d&apos;événements locaux
          </Text>

          <Hr style={divider} />

          {/* Events list */}
          {events.map((event, index) => (
            <Section key={event.slug} style={eventSection}>
              {event.imageUrl && (
                <Img
                  src={event.imageUrl}
                  alt={event.title}
                  width="560"
                  height="315"
                  style={eventImage}
                />
              )}

              <Heading style={eventTitle}>{event.title}</Heading>

              <Text style={eventMeta}>
                📅 {formatDate(event.startAt)}
              </Text>

              {event.venue && (
                <Text style={eventMeta}>
                  📍 {event.venue.name}
                  {event.venue.city && `, ${event.venue.city}`}
                </Text>
              )}

              {event.price && formatPrice(event.price.min, event.price.max) && (
                <Text style={eventMeta}>
                  💰 {formatPrice(event.price.min, event.price.max)}
                </Text>
              )}

              {event.category.length > 0 && (
                <Text style={eventCategories}>
                  {event.category.slice(0, 3).join(' • ')}
                </Text>
              )}

              <Button
                style={button}
                href={`${baseUrl}/evenement/${event.slug}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`}
              >
                Voir l&apos;événement
              </Button>

              {index < events.length - 1 && <Hr style={eventDivider} />}
            </Section>
          ))}

          {/* CTA to see more events */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Découvrez encore plus d&apos;événements sur notre site :
            </Text>
            <Button
              style={ctaButton}
              href={`${baseUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`}
            >
              Voir tous les événements
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Territoire en Fête. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              Vous recevez cet email car vous êtes inscrit à notre newsletter.
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Se désinscrire
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 20px',
  textAlign: 'center' as const,
}

const lead = {
  color: '#6b7280',
  fontSize: '18px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '0 20px 30px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const eventSection = {
  padding: '0 20px',
  marginBottom: '0',
}

const eventImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  marginBottom: '20px',
}

const eventTitle = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  lineHeight: '28px',
  margin: '0 0 12px',
}

const eventMeta = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '6px 0',
}

const eventCategories = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '10px 0',
  fontStyle: 'italic' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  marginTop: '16px',
}

const eventDivider = {
  borderColor: '#f3f4f6',
  margin: '30px 0',
}

const ctaSection = {
  padding: '40px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#eff6ff',
}

const ctaText = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

const ctaButton = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
}

const unsubscribeLink = {
  color: '#6b7280',
  fontSize: '12px',
  textDecoration: 'underline',
  marginTop: '8px',
  display: 'inline-block',
}
