import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a sample source
  const source = await prisma.source.upsert({
    where: { id: 'seed-source-1' },
    update: {},
    create: {
      id: 'seed-source-1',
      kind: 'FORM',
      name: 'Seed Script',
      active: true,
    },
  })

  console.log('✅ Created source:', source.name)

  // Create venues
  const venues = [
    {
      id: 'venue-1',
      name: 'Salle des Fêtes',
      address: '1 Place de la Mairie',
      city: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
    },
    {
      id: 'venue-2',
      name: 'Parc Municipal',
      address: 'Avenue des Champs',
      city: 'Lyon',
      lat: 45.764,
      lng: 4.8357,
    },
    {
      id: 'venue-3',
      name: 'Centre Culturel',
      address: '15 Rue de la Culture',
      city: 'Marseille',
      lat: 43.2965,
      lng: 5.3698,
    },
    {
      id: 'venue-4',
      name: 'Théâtre Municipal',
      address: '23 Boulevard Victor Hugo',
      city: 'Toulouse',
      lat: 43.6047,
      lng: 1.4442,
    },
  ]

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { id: venue.id },
      update: {},
      create: venue,
    })
  }

  console.log('✅ Created venues')

  // Helper function to generate dates
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  const now = new Date()

  // Create 10 sample events
  const events = [
    {
      title: 'Concert de Jazz sous les Étoiles',
      description: 'Une soirée exceptionnelle avec les plus grands noms du jazz français. Venez découvrir des artistes talentueux dans un cadre convivial et chaleureux.',
      startAt: addDays(now, 3),
      endAt: addDays(now, 3),
      venueId: 'venue-1',
      category: ['Musique', 'Concert'],
      audience: ['Adultes', 'Tout public'],
      priceMin: 15,
      priceMax: 25,
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Marché des Producteurs Locaux',
      description: 'Découvrez les meilleurs produits du terroir directement auprès des producteurs. Fruits, légumes, fromages, miel et bien plus encore !',
      startAt: addDays(now, 5),
      endAt: addDays(now, 5),
      venueId: 'venue-2',
      category: ['Marché', 'Gastronomie'],
      audience: ['Tout public', 'Familles'],
      priceMin: 0,
      priceMax: 0,
      imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Festival du Cinéma en Plein Air',
      description: 'Trois jours de projections cinématographiques dans le parc. Films français et internationaux, animations pour enfants. Apportez vos couvertures !',
      startAt: addDays(now, 7),
      endAt: addDays(now, 9),
      venueId: 'venue-2',
      category: ['Cinéma', 'Festival', 'Culture'],
      audience: ['Tout public', 'Familles'],
      priceMin: 0,
      priceMax: 0,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Exposition d\'Art Contemporain',
      description: 'Découvrez les œuvres de jeunes artistes émergents. Peinture, sculpture, photographie. Vernissage le premier soir avec cocktail.',
      startAt: addDays(now, 10),
      endAt: addDays(now, 30),
      venueId: 'venue-3',
      category: ['Exposition', 'Art', 'Culture'],
      audience: ['Adultes', 'Tout public'],
      priceMin: 5,
      priceMax: 10,
      imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Atelier Cuisine pour Enfants',
      description: 'Les enfants de 6 à 12 ans découvrent les joies de la cuisine avec un chef pâtissier. Au menu : fabrication de cookies et cupcakes !',
      startAt: addDays(now, 6),
      endAt: addDays(now, 6),
      venueId: 'venue-1',
      category: ['Atelier', 'Gastronomie', 'Jeunesse'],
      audience: ['Enfants', 'Familles'],
      priceMin: 20,
      priceMax: 20,
      imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Spectacle de Théâtre : Le Malade Imaginaire',
      description: 'La célèbre pièce de Molière revisitée par une troupe locale talentueuse. Rires et émotions garantis !',
      startAt: addDays(now, 12),
      endAt: addDays(now, 12),
      venueId: 'venue-4',
      category: ['Théâtre', 'Culture', 'Spectacle'],
      audience: ['Adultes', 'Tout public'],
      priceMin: 12,
      priceMax: 18,
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Vide-Grenier Municipal',
      description: 'Grand vide-grenier annuel ! Plus de 100 exposants. Brocante, antiquités, vêtements, livres, jouets. Restauration sur place.',
      startAt: addDays(now, 14),
      endAt: addDays(now, 14),
      venueId: 'venue-2',
      category: ['Brocante', 'Marché'],
      audience: ['Tout public', 'Familles'],
      priceMin: 0,
      priceMax: 0,
      imageUrl: 'https://images.unsplash.com/photo-1567393212392-0f82f3e9db0d?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Concert de Musique Classique',
      description: 'L\'orchestre symphonique régional interprète Beethoven, Mozart et Chopin. Une soirée d\'exception pour les mélomanes.',
      startAt: addDays(now, 16),
      endAt: addDays(now, 16),
      venueId: 'venue-4',
      category: ['Musique', 'Concert', 'Culture'],
      audience: ['Adultes', 'Tout public'],
      priceMin: 20,
      priceMax: 35,
      imageUrl: 'https://images.unsplash.com/photo-1519683109079-d5f539e1542f?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Journée Portes Ouvertes - Pompiers',
      description: 'Découvrez le quotidien des soldats du feu ! Démonstrations, exposition de véhicules, initiation aux gestes de premiers secours.',
      startAt: addDays(now, 20),
      endAt: addDays(now, 20),
      venueId: 'venue-1',
      category: ['Événement', 'Famille', 'Éducatif'],
      audience: ['Tout public', 'Familles', 'Enfants'],
      priceMin: 0,
      priceMax: 0,
      imageUrl: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=800',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Festival de Street Food',
      description: 'Trois jours de festivités gastronomiques ! Food trucks du monde entier, concerts, animations. Ambiance conviviale garantie.',
      startAt: addDays(now, 25),
      endAt: addDays(now, 27),
      venueId: 'venue-2',
      category: ['Festival', 'Gastronomie', 'Musique'],
      audience: ['Tout public', 'Adultes', 'Familles'],
      priceMin: 0,
      priceMax: 0,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      status: 'PUBLISHED' as const,
    },
  ]

  for (const eventData of events) {
    const { venueId, ...rest } = eventData
    const venue = await prisma.venue.findUnique({ where: { id: venueId } })

    const slug = slugify(`${venue?.city}-${rest.title}-${rest.startAt.toISOString().split('T')[0]}`, {
      lower: true,
      strict: true,
      locale: 'fr',
    })

    await prisma.event.upsert({
      where: { slug },
      update: {},
      create: {
        ...rest,
        slug,
        venueId,
        sourceId: source.id,
        city: venue?.city,
        address: venue?.address,
        lat: venue?.lat,
        lng: venue?.lng,
        tags: [],
      },
    })

    console.log(`✅ Created event: ${rest.title}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
