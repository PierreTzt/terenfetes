import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ConfirmSubscriptionEmailProps {
  email: string
  confirmUrl: string
}

export default function ConfirmSubscriptionEmail({
  email,
  confirmUrl,
}: ConfirmSubscriptionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmez votre inscription à la newsletter Territoire en Fête</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Territoire en Fête</Heading>

          <Text style={text}>Bonjour,</Text>

          <Text style={text}>
            Vous avez demandé à recevoir notre newsletter hebdomadaire des événements locaux.
          </Text>

          <Text style={text}>
            Pour confirmer votre inscription et commencer à recevoir les meilleurs événements de votre territoire, cliquez sur le bouton ci-dessous :
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmUrl}>
              Confirmer mon inscription
            </Button>
          </Section>

          <Text style={text}>
            Ou copiez ce lien dans votre navigateur :
          </Text>

          <Text style={link}>
            <Link href={confirmUrl} style={linkStyle}>
              {confirmUrl}
            </Link>
          </Text>

          <Text style={textMuted}>
            Si vous n&apos;avez pas demandé cette inscription, ignorez simplement cet email.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Territoire en Fête. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              Cet email a été envoyé à {email}
            </Text>
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
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const textMuted = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const link = {
  margin: '16px 0',
  wordBreak: 'break-all' as const,
}

const linkStyle = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '40px',
  paddingTop: '20px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
}
