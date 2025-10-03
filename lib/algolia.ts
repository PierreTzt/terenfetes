import algoliasearch from 'algoliasearch'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
const adminKey = process.env.ALGOLIA_ADMIN_KEY

if (!appId || !adminKey) {
  console.warn('Algolia credentials not configured')
}

const client = appId && adminKey ? algoliasearch(appId, adminKey) : null
const index = client?.initIndex('events')

export async function syncEventToAlgolia(event: any) {
  if (!index) {
    console.warn('Algolia not configured, skipping sync')
    return
  }

  try {
    const algoliaEvent = {
      objectID: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      startAt: new Date(event.startAt).getTime() / 1000, // Unix timestamp
      endAt: event.endAt ? new Date(event.endAt).getTime() / 1000 : null,
      city: event.city,
      venue: event.venue?.name || event.venueName,
      category: event.category,
      audience: event.audience,
      imageUrl: event.imageUrl,
      priceMin: event.priceMin ? parseFloat(event.priceMin.toString()) : null,
      priceMax: event.priceMax ? parseFloat(event.priceMax.toString()) : null,
      lat: event.lat,
      lng: event.lng,
      _geoloc: event.lat && event.lng ? {
        lat: event.lat,
        lng: event.lng,
      } : undefined,
      status: event.status,
    }

    await index.saveObject(algoliaEvent)
    console.log(`Synced event ${event.id} to Algolia`)
  } catch (error) {
    console.error('Error syncing to Algolia:', error)
  }
}

export async function deleteEventFromAlgolia(eventId: string) {
  if (!index) {
    console.warn('Algolia not configured, skipping delete')
    return
  }

  try {
    await index.deleteObject(eventId)
    console.log(`Deleted event ${eventId} from Algolia`)
  } catch (error) {
    console.error('Error deleting from Algolia:', error)
  }
}

export async function configureAlgoliaIndex() {
  if (!index) {
    console.warn('Algolia not configured')
    return
  }

  try {
    await index.setSettings({
      searchableAttributes: [
        'title',
        'description',
        'city',
        'venue',
        'category',
        'audience',
      ],
      attributesForFaceting: [
        'searchable(city)',
        'searchable(category)',
        'searchable(audience)',
        'status',
      ],
      customRanking: ['desc(startAt)'],
      ranking: [
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })

    console.log('Algolia index configured')
  } catch (error) {
    console.error('Error configuring Algolia index:', error)
  }
}
