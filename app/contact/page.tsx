import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Mail, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Contact - Territoire en Fête',
  description: 'Une question, une correction, un partenariat ? Écrivez-nous.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-bg-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="h1 mb-4">Contact</h1>
            <p className="text-lg text-muted-700">
              Une question, une correction, un partenariat ? Écrivez-nous.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            {/* Email Contact */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1">
                  <h2 className="h3 mb-2">Email</h2>
                  <p className="text-muted-700 mb-4">
                    Pour toute question générale, correction d'événement, ou demande de partenariat.
                  </p>
                  <a
                    href="mailto:contact@territoireenfete.fr"
                    className="inline-flex items-center gap-2 text-brand font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
                  >
                    contact@territoireenfete.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Support Organizers */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1">
                  <h2 className="h3 mb-2">Support organisateurs</h2>
                  <p className="text-muted-700 mb-4">
                    Vous avez soumis un événement et avez besoin d'aide ? Vous souhaitez modifier ou supprimer votre publication ?
                  </p>
                  <a
                    href="mailto:organisateurs@territoireenfete.fr"
                    className="inline-flex items-center gap-2 text-brand font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
                  >
                    organisateurs@territoireenfete.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-brand-50 border border-brand/10 p-6 text-center" style={{ borderRadius: 'var(--radius-container)' }}>
              <p className="text-sm text-muted-700">
                <strong className="text-ink">Délai de réponse :</strong> Nous nous efforçons de répondre sous 48h (jours ouvrés).
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
