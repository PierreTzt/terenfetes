import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Mentions légales - Territoire en Fête',
  description: 'Mentions légales et informations sur le traitement des données personnelles.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-bg-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="h1">Mentions légales</h1>
          </div>
        </section>

        {/* Legal Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-8" style={{ borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-rest)' }}>
            <div className="space-y-8">
              {/* Éditeur */}
              <section>
                <h2 className="h3 mb-3">Éditeur du site</h2>
                <div className="text-muted-700 space-y-1">
                  <p><strong className="text-ink">Raison sociale :</strong> Territoire en Fête</p>
                  <p><strong className="text-ink">Forme juridique :</strong> [À compléter]</p>
                  <p><strong className="text-ink">Siège social :</strong> [Adresse à compléter]</p>
                  <p><strong className="text-ink">SIRET :</strong> [À compléter]</p>
                  <p><strong className="text-ink">Email :</strong> contact@territoireenfete.fr</p>
                  <p><strong className="text-ink">Directeur de publication :</strong> [Nom à compléter]</p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Hébergeur */}
              <section>
                <h2 className="h3 mb-3">Hébergement</h2>
                <div className="text-muted-700 space-y-1">
                  <p><strong className="text-ink">Hébergeur :</strong> [Nom de l'hébergeur]</p>
                  <p><strong className="text-ink">Siège social :</strong> [Adresse de l'hébergeur]</p>
                  <p><strong className="text-ink">Site web :</strong> [URL de l'hébergeur]</p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Données personnelles */}
              <section>
                <h2 className="h3 mb-3">Données personnelles</h2>
                <div className="text-muted-700 space-y-3">
                  <p>
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
                  </p>
                  <p>
                    <strong className="text-ink">Responsable du traitement :</strong> Territoire en Fête
                  </p>
                  <p>
                    <strong className="text-ink">Délégué à la Protection des Données (DPO) :</strong> [Email du DPO]
                  </p>
                  <p>
                    <strong className="text-ink">Finalités du traitement :</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Gestion des comptes utilisateurs</li>
                    <li>Publication et modération des événements</li>
                    <li>Envoi de newsletters (avec consentement)</li>
                    <li>Statistiques de fréquentation anonymisées</li>
                  </ul>
                  <p>
                    <strong className="text-ink">Durée de conservation :</strong> Les données sont conservées pendant la durée strictement nécessaire aux finalités poursuivies, et au maximum 3 ans après la dernière activité du compte.
                  </p>
                  <p>
                    Pour exercer vos droits, contactez-nous à : <a href="mailto:dpo@territoireenfete.fr" className="text-brand hover:underline">dpo@territoireenfete.fr</a>
                  </p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Cookies */}
              <section>
                <h2 className="h3 mb-3">Cookies</h2>
                <div className="text-muted-700 space-y-3">
                  <p>
                    Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visite.
                  </p>
                  <p>
                    <strong className="text-ink">Cookies strictement nécessaires :</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Session utilisateur (authentification)</li>
                    <li>Préférences de navigation (langue, ville)</li>
                  </ul>
                  <p>
                    <strong className="text-ink">Cookies analytiques :</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Statistiques de fréquentation anonymisées</li>
                  </ul>
                  <p>
                    Vous pouvez à tout moment modifier vos préférences en matière de cookies dans les paramètres de votre navigateur.
                  </p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="h3 mb-3">Propriété intellectuelle</h2>
                <div className="text-muted-700 space-y-3">
                  <p>
                    L'ensemble des contenus présents sur ce site (textes, images, logos, icônes) est protégé par le droit d'auteur et le droit des marques.
                  </p>
                  <p>
                    Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                  </p>
                  <p>
                    Les images d'événements publiées sur le site sont la propriété de leurs auteurs respectifs et ne peuvent être réutilisées sans autorisation.
                  </p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Liens externes */}
              <section>
                <h2 className="h3 mb-3">Liens externes</h2>
                <div className="text-muted-700 space-y-3">
                  <p>
                    Ce site peut contenir des liens vers des sites externes. Territoire en Fête n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                  </p>
                </div>
              </section>

              <div className="border-t border-bg-1" />

              {/* Modification */}
              <section>
                <h2 className="h3 mb-3">Modification des mentions légales</h2>
                <div className="text-muted-700">
                  <p>
                    Territoire en Fête se réserve le droit de modifier les présentes mentions légales à tout moment. Les utilisateurs sont invités à les consulter régulièrement.
                  </p>
                  <p className="mt-3">
                    <strong className="text-ink">Dernière mise à jour :</strong> [Date à compléter]
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
