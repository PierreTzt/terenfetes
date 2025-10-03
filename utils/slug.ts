import slugify from 'slugify'

export function generateEventSlug(title: string, city?: string, date?: Date | string): string {
  const baseSlug = slugify(title, { lower: true, strict: true, locale: 'fr' })
  const citySlug = city ? slugify(city, { lower: true, strict: true, locale: 'fr' }) : ''
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : ''

  const parts = [citySlug, baseSlug, dateStr].filter(Boolean)
  return parts.join('-')
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++
  }

  return `${baseSlug}-${counter}`
}
