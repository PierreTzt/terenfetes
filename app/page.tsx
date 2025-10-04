import EventCard from '@/components/EventCard'
import QuickFilters from '@/components/QuickFilters'
import LocationFilter from '@/components/LocationFilter'
import SortDropdown from '@/components/SortDropdown'
import Pagination from '@/components/Pagination'
import PersonalizedSection from '@/components/PersonalizedSection'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import { Building2 } from 'lucide-react'

async function getEvents(
  filter?: string | null,
  page: number = 1,
  lat?: string | null,
  lng?: string | null,
  radius?: string | null,
  q?: string | null,
  city?: string | null,
  from?: string | null,
  to?: string | null,
  indoor?: string | null,
  outdoor?: string | null,
  pmr?: string | null,
  kids?: string | null,
  durLt?: string | null,
  priceMax?: string | null
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const today = new Date()

  // Use provided from/to dates, or calculate from quick filters
  let fromDate = from || today.toISOString().split('T')[0]
  let toDate: string | undefined = to || undefined

  // Apply quick filters (only if from/to not explicitly set)
  if (!from && !to) {
    if (filter === 'tonight') {
      toDate = fromDate
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      fromDate = tomorrow.toISOString().split('T')[0]
      toDate = fromDate
    } else if (filter === 'weekend') {
      const dayOfWeek = today.getDay()
      const daysUntilSaturday = dayOfWeek === 0 ? 6 : (6 - dayOfWeek)

      const saturday = new Date(today)
      saturday.setDate(today.getDate() + daysUntilSaturday)
      fromDate = saturday.toISOString().split('T')[0]

      const sunday = new Date(saturday)
      sunday.setDate(saturday.getDate() + 1)
      sunday.setHours(23, 59, 59)
      toDate = sunday.toISOString().split('T')[0]
    }
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

  if (filter === 'family') {
    params.append('badge', 'KIDS')
  }

  // Indoor/outdoor are now handled directly via URL params (indoor=1, outdoor=1)
  // No need to map from filter param anymore

  if (lat && lng) {
    params.append('lat', lat)
    params.append('lng', lng)
    params.append('radius', radius || '10')
  }

  if (q) {
    params.append('q', q)
  }

  if (city) {
    params.append('city', city)
  }

  // Advanced filters
  if (indoor) params.append('indoor', indoor)
  if (outdoor) params.append('outdoor', outdoor)
  if (pmr) params.append('pmr', pmr)
  if (kids) params.append('kids', kids)
  if (durLt) params.append('dur_lt', durLt)
  if (priceMax) params.append('price_max', priceMax)

  try {
    const res = await fetch(`${baseUrl}/api/events?${params.toString()}`, {
      next: { revalidate: 300 },
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
  searchParams: Promise<{
    filter?: string
    page?: string
    lat?: string
    lng?: string
    radius?: string
    q?: string
    city?: string
    from?: string
    to?: string
    indoor?: string
    outdoor?: string
    pmr?: string
    kids?: string
    dur_lt?: string
    price_max?: string
  }>
}) {
  const { filter, page, lat, lng, radius, q, city, from, to, indoor, outdoor, pmr, kids, dur_lt, price_max } = await searchParams
  const currentPage = parseInt(page || '1')
  const { data: events, meta, error } = await getEvents(filter, currentPage, lat, lng, radius, q, city, from, to, indoor, outdoor, pmr, kids, dur_lt, price_max)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {error ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-amber-50 border border-amber-200 p-8 text-center" style={{ borderRadius: 'var(--radius-container)' }}>
              <div className="mb-4">
                <span className="text-6xl">⚠️</span>
              </div>
              <h2 className="h2 mb-4">Configuration requise</h2>
              <p className="text-muted-700 mb-6">
                La base de données n'est pas encore configurée. Veuillez suivre les étapes dans le README.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="bg-bg-0 pt-12 pb-6">
              <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-white px-6 py-5" style={{ borderRadius: '16px', boxShadow: '0 1px 5px rgba(20, 30, 55, 0.03)' }}>
                  <h1 className="h1 mb-4 line-clamp-2" style={{ lineHeight: '1.15' }}>
                    Tout ce qui bouge près de chez vous.
                  </h1>
                  <p className="text-base leading-6 mb-0 max-w-[80ch] mx-auto" style={{ color: '#3A4253' }}>
                    Découvrez, planifiez, partagez. Un agenda fiable, mis à jour en continu.
                  </p>
                </div>
              </div>
            </section>

            {/* Filter bar - separate visual section */}
            <section className="bg-bg-0 pt-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#F4F6F8] border border-[#E6EAF0] px-2.5 py-1.5" style={{ borderRadius: '14px' }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <QuickFilters />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <LocationFilter />
                      <SortDropdown />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Personalized Section - "Cette semaine" */}
            <div className="bg-bg-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
                <PersonalizedSection />
              </div>
            </div>

            {/* Events List */}
            <div className="bg-bg-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-muted-700 text-lg">
                      Aucun événement à venir pour le moment.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Section Header */}
                    <div className="mt-2 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="h2 text-ink font-bold">Événements à venir</h2>
                          <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-brand text-white text-sm font-semibold" style={{ borderRadius: 'var(--radius-badge)' }}>
                            {meta.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grid 3 cols desktop, 2 tablet, 1 mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-[26px] mb-8">
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
              </div>
            </div>

            {/* Organizer CTA Banner */}
            <div className="bg-bg-0 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#F4F6F8] px-8 py-7 text-center" style={{ borderRadius: '18px' }}>
                  <Building2 className="w-12 h-12 text-brand mx-auto mb-4" />
                  <h2 className="text-[20px] leading-[28px] font-bold text-ink mb-2">Vous organisez un événement ?</h2>
                  <p className="text-base leading-6 text-muted-700 mb-6">
                    Publiez en 2 minutes et touchez votre communauté locale.
                  </p>
                  <Button variant="ghost" href="/soumettre" icon={Building2}>
                    Soumettre un événement
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
