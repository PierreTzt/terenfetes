import MapView from '@/components/MapView'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-bg-0 pt-12 pb-6">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white px-6 py-5" style={{ borderRadius: '16px', boxShadow: '0 1px 5px rgba(20, 30, 55, 0.03)' }}>
              <h1 className="h1 mb-4 line-clamp-2" style={{ lineHeight: '1.15' }}>
                Carte des événements
              </h1>
              <p className="text-base leading-6 mb-0 max-w-[80ch] mx-auto" style={{ color: '#3A4253' }}>
                Explorez les événements à proximité sur la carte interactive
              </p>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <div className="bg-bg-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MapView events={events} />
          </div>
        </div>

        {/* Events List Section */}
        <div className="bg-bg-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="mt-8 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="h2 text-ink font-bold">Événements à venir</h2>
                <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-brand text-white text-sm font-semibold" style={{ borderRadius: 'var(--radius-badge)' }}>
                  {events.length}
                </span>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-muted-700 text-lg">
                  Aucun événement à venir pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-[26px]">
                {events.map((event) => {
                  const startDate = new Date(event.startAt)
                  const dateStr = startDate.toLocaleDateString('fr-FR', {
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
                      className="block bg-white overflow-hidden transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      style={{ borderRadius: 'var(--radius-card)', boxShadow: '0 1px 3px rgba(20, 30, 55, 0.08)' }}
                    >
                      {event.imageUrl && (
                        <div className="relative w-full h-48">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-ink mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-700">
                          {event.city && <span>📍 {event.city}</span>}
                          <span>·</span>
                          <span>📅 {dateStr}</span>
                          <span>·</span>
                          <span>🕒 {timeStr}</span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
