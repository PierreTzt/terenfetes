import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { CheckCircle2, Image as ImageIcon, Clock, Lightbulb } from 'lucide-react'

export const metadata = {
  title: 'Organisateurs - Territoire en Fête',
  description: 'Publiez votre événement en 2 minutes et touchez votre communauté locale.',
}

export default function OrganisateursPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-bg-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="h1 mb-4">Publiez votre événement en 2 minutes.</h1>
            <p className="text-lg text-muted-700 mb-8">
              Un agenda local clair et utile. Touchez votre communauté facilement.
            </p>
            <Button variant="primary" href="/soumettre">
              Soumettre un événement
            </Button>
          </div>
        </section>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {/* Critères d'éligibilité */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="h3 mb-2">Critères d'éligibilité</h2>
                  <p className="text-muted-700 mb-4">
                    Votre événement doit être ouvert au public, se dérouler dans la région, et apporter une valeur culturelle, sociale ou éducative.
                  </p>
                  <ul className="space-y-2 text-muted-700">
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Événement public (pas de soirées privées)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Date et lieu confirmés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Description claire et complète</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Respect de la législation en vigueur</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Images acceptées */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="h3 mb-2">Images acceptées</h2>
                  <p className="text-muted-700 mb-4">
                    Une belle photo attire l'attention. Privilégiez les images de qualité, en format paysage (16:9 idéalement).
                  </p>
                  <ul className="space-y-2 text-muted-700">
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Format: JPG, PNG, WebP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Taille recommandée: 1920×1080px minimum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Poids maximum: 5 Mo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Évitez les images floues, trop sombres ou avec du texte superposé</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Délais de publication */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="h3 mb-2">Délais de publication</h2>
                  <p className="text-muted-700 mb-4">
                    Chaque soumission est vérifiée manuellement pour garantir la qualité de l'agenda.
                  </p>
                  <ul className="space-y-2 text-muted-700">
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Modération sous 24 à 48h (jours ouvrés)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Publication immédiate après validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Notification par email en cas de refus ou modification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Possibilité de modifier votre événement après publication</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bonnes pratiques */}
            <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="h3 mb-2">Bonnes pratiques</h2>
                  <p className="text-muted-700 mb-4">
                    Quelques conseils pour maximiser la visibilité de votre événement.
                  </p>
                  <ul className="space-y-2 text-muted-700">
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Titre court et percutant (60 caractères max)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Description complète mais concise (200-400 mots)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Précisez l'accessibilité (PMR, poussettes, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Indiquez les tarifs exacts (gratuit, tarif réduit, plein tarif)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Ajoutez un lien de billetterie si applicable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span>Catégorisez correctement votre événement pour faciliter la découverte</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center mt-12">
            <p className="text-lg text-muted-700 mb-6">
              Prêt à publier votre événement ?
            </p>
            <Button variant="primary" href="/soumettre" size="lg">
              Soumettre un événement
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
