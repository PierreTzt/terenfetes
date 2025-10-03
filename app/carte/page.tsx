import MapView from '@/components/MapView'
import { EventPublicDTO } from '@/types'

async function getEvents(): Promise<EventPublicDTO[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const today = new Date().toISOString().split('T')[0]

  try {
    const res = await fetch(`${baseUrl}/api/events?status=PUBLISHED&from=${today}&limit=100`, {
      next: { revalidate: 300 },
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching events for map:', error)
    return []
  }
}

export default async function MapPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for accessibility */}
      <a
        href="#event-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Passer la carte et aller à la liste
      </a>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Carte des événements</h1>
          <p className="mt-2 text-gray-600">
            Explorez les événements à proximité sur la carte interactive
          </p>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 mb-8" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4" role="list">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700 pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Voir la liste des événements"
              role="listitem"
            >
              Liste
            </a>
            <a
              href="/carte"
              className="text-blue-600 border-b-2 border-blue-600 pb-4 px-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-current="page"
              role="listitem"
            >
              Carte
            </a>
            <a
              href="/soumettre"
              className="text-gray-500 hover:text-gray-700 pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Soumettre un événement"
              role="listitem"
            >
              Soumettre un événement
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skip to list link for accessibility */}
        <div className="mb-6">
          <a
            href="#event-list"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Passer la carte et voir la liste
          </a>
        </div>

        <MapView events={events} />

        {/* Accessible list view */}
        <section id="event-list" className="mt-12" aria-label="Liste des événements">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Liste des événements ({events.length})
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md" role="status" aria-live="polite">
              <p className="text-gray-500 text-lg">Aucun événement à afficher sur la carte.</p>
              <a
                href="/soumettre"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Soumettre un événement
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {events.map((event) => {
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
                  <a
                    key={event.id}
                    href={`/evenement/${event.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    role="listitem"
                    aria-label={`Événement : ${event.title}, le ${dateStr} à ${timeStr}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      📅 {dateStr} · {timeStr}
                    </p>
                    {event.venue && (
                      <p className="text-sm text-gray-600 mb-1">
                        📍 {event.venue.name}
                        {event.venue.city && `, ${event.venue.city}`}
                      </p>
                    )}
                    {event.category.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {event.category.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Territoire en Fête. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
