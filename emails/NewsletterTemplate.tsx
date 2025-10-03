import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components'
import { NewsletterEventDTO } from '@/types'

interface NewsletterTemplateProps {
  events: NewsletterEventDTO[]
  baseUrl: string
}

export function NewsletterTemplate({ events, baseUrl }: NewsletterTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Territoire en Fête</Heading>
          <Text style={paragraph}>
            Voici les événements à ne pas manquer cette semaine dans votre territoire !
          </Text>

          <Section style={eventsSection}>
            {events.map((event) => {
              const eventUrl = `${baseUrl}/evenement/${event.slug}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`
              const startDate = new Date(event.startAt)
              const dateStr = startDate.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
              const timeStr = startDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <Section key={event.id} style={eventCard}>
                  {event.imageUrl && (
                    <Img
                      src={event.imageUrl}
                      alt={event.title}
                      style={eventImage}
                    />
                  )}
                  <Heading as="h2" style={h2}>
                    <Link href={eventUrl} style={eventLink}>
                      {event.title}
                    </Link>
                  </Heading>
                  <Text style={eventMeta}>
                    📅 {dateStr} à {timeStr}
                  </Text>
                  {event.venue && (
                    <Text style={eventMeta}>
                      📍 {event.venue}
                      {event.city && `, ${event.city}`}
                    </Text>
                  )}
                  {event.category.length > 0 && (
                    <Text style={eventMeta}>
                      🏷️ {event.category.join(', ')}
                    </Text>
                  )}
                  <Link href={eventUrl} style={button}>
                    Voir les détails
                  </Link>
                </Section>
              )
            })}
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Vous recevez cet email car vous êtes abonné à la newsletter Territoire en Fête.
            <br />
            <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
              Se désabonner
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6b7280',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const eventsSection = {
  padding: '20px 40px',
}

const eventCard = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
}

const eventImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '16px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const eventLink = {
  color: '#2563eb',
  textDecoration: 'none',
}

const eventMeta = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  marginTop: '12px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  padding: '0 40px',
}

const footerLink = {
  color: '#2563eb',
  textDecoration: 'underline',
}

export default NewsletterTemplate
