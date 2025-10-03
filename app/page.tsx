import EventCard from '@/components/EventCard'
import QuickFilters from '@/components/QuickFilters'
import Pagination from '@/components/Pagination'

async function getEvents(filter?: string | null, page: number = 1) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const today = new Date()

  let fromDate = today.toISOString().split('T')[0]
  let toDate: string | undefined

  // Apply quick filters
  if (filter === 'week') {
    // Next 7 days
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    toDate = nextWeek.toISOString().split('T')[0]
  } else if (filter === 'weekend') {
    // Next Saturday and Sunday
    const dayOfWeek = today.getDay() // 0=Sunday, 6=Saturday
    const daysUntilSaturday = dayOfWeek === 0 ? 6 : (6 - dayOfWeek)

    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysUntilSaturday)
    fromDate = saturday.toISOString().split('T')[0]

    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    sunday.setHours(23, 59, 59)
    toDate = sunday.toISOString().split('T')[0]
  }

  const params = new URLSearchParams({
    status: 'PUBLISHED',
    from: fromDate,
    limit: '20',
    page: page.toString(),
  })

  if (toDate) {
    params.append('to', toDate)
  }

  if (filter === 'free') {
    params.append('priceMax', '0')
  }

  try {
    const res = await fetch(`${baseUrl}/api/events?${params.toString()}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      cache: 'no-store'
    })

    if (!res.ok) {
      return { data: [], meta: { total: 0 }, error: true }
    }

    return { ...(await res.json()), error: false }
  } catch (error) {
    console.error('Error fetching events:', error)
    return { data: [], meta: { total: 0 }, error: true }
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { filter, page } = await searchParams
  const currentPage = parseInt(page || '1')
  const { data: events, meta, error } = await getEvents(filter, currentPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Territoire en Fête
          </h1>
          <p className="mt-2 text-gray-600">
            Découvrez les événements de votre territoire
          </p>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 mb-8" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4" role="list">
            <a
              href="/"
              className="text-blue-600 border-b-2 border-blue-600 pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-current="page"
              role="listitem"
            >
              Liste
            </a>
            <a
              href="/carte"
              className="text-gray-500 hover:text-gray-700 pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Voir la carte des événements"
              role="listitem"
            >
              Carte
            </a>
            <a
              href="/soumettre"
              className="text-gray-500 hover:text-gray-700 pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Soumettre un nouvel événement"
              role="listitem"
            >
              Soumettre un événement
            </a>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center" role="alert" aria-live="polite">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Avertissement - Configuration requise"
              >
                <title>Avertissement</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Configuration requise
            </h2>
            <p className="text-gray-700 mb-6">
              La base de données n&apos;est pas encore configurée. Veuillez suivre les étapes ci-dessous :
            </p>
            <div className="text-left bg-white rounded-lg p-6 max-w-2xl mx-auto">
              <ol className="space-y-4 text-sm">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold mr-3 flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-gray-900">Copier .env.example vers .env.local</p>
                    <code className="block mt-1 bg-gray-100 px-2 py-1 rounded text-xs">cp .env.example .env.local</code>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold mr-3 flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-gray-900">Configurer DATABASE_URL dans .env.local</p>
                    <p className="text-gray-600 text-xs mt-1">Créer une base PostgreSQL sur Supabase ou localement</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold mr-3 flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-gray-900">Initialiser la base de données</p>
                    <code className="block mt-1 bg-gray-100 px-2 py-1 rounded text-xs">npm run db:generate && npm run db:push && npm run db:seed</code>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold mr-3 flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium text-gray-900">Redémarrer le serveur</p>
                    <code className="block mt-1 bg-gray-100 px-2 py-1 rounded text-xs">npm run dev</code>
                  </div>
                </li>
              </ol>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Consultez le README.md pour plus de détails
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="text-gray-500 text-lg">
              Aucun événement à venir pour le moment.
            </p>
          </div>
        ) : (
          <>
            <QuickFilters />

            <div className="mb-6">
              <p className="text-sm text-gray-600" role="status" aria-live="polite">
                {meta.total} événement{meta.total > 1 ? 's' : ''} à venir
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Liste des événements">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                itemsPerPage={meta.limit}
              />
            )}
          </>
        )}
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
