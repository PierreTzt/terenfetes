# Migration Instructions

## Database Migrations

This project has new database changes that need to be applied. Follow these steps:

### 1. Apply Prisma Schema Changes

The following new model has been added:
- `SiteSettings`: Stores site name, slogan, logo URL, and favicon URL

To apply the changes:

```bash
# Generate Prisma Client with the new model
npx prisma generate

# Create and apply the migration
npx prisma migrate dev --name add_site_settings
```

**Note**: If you encounter a "drift detected" error, you may need to resolve it first:

```bash
# Option 1: Reset the database (WARNING: This will delete all data)
npx prisma migrate reset

# Option 2: Mark migrations as applied without running them
npx prisma migrate resolve --applied <migration-name>

# Option 3: Create the table manually via SQL
```

### 2. Enable PostgreSQL Unaccent Extension (Optional but Recommended)

For better accent-insensitive search (e.g., "theatre" finding "Théâtre"), enable the unaccent extension:

```bash
# Run this SQL on your PostgreSQL database
# (In Supabase: Dashboard → SQL Editor)
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Or run the provided SQL file:

```bash
psql -d your_database -f prisma/enable-unaccent.sql
```

### 3. Verify the Changes

After applying migrations, verify that everything works:

```bash
# Start the development server
npm run dev

# Test the following features:
# - City filter dropdown (fetches top 10 cities from database)
# - Search with accents (e.g., search "theatre" to find "Théâtre")
# - Admin settings page at /admin/parametres
# - Static pages: /organisateurs, /contact, /mentions-legales
```

### 4. Access Admin Settings

Once the migrations are applied:

1. Navigate to `/admin/parametres`
2. Update your site name, slogan, logo URL, and favicon URL
3. Changes will be reflected immediately in the navigation and throughout the site

## New Features Summary

### ✅ Completed Improvements

1. **Single-line filters with horizontal scroll**
   - Filters now display on a single line
   - Horizontal scroll for mobile devices
   - Lucide icons for better UX

2. **Accent-insensitive search with synonyms**
   - Searching "theatre" finds "Théâtre"
   - Synonym expansion (e.g., "spectacle" → "show")
   - PostgreSQL unaccent extension support (optional)

3. **City selector dropdown**
   - Replaces geolocation-only filter
   - Shows top 10 cities by event count
   - "Toutes les villes" option
   - "Autour de moi" geolocation option
   - LocalStorage persistence

4. **Editable site settings (Admin)**
   - Site name, slogan, logo, and favicon
   - Admin page at `/admin/parametres`
   - Live preview
   - Dynamic navigation and footer

5. **Reduced event card spacing**
   - Tighter vertical rhythm
   - More compact layout
   - Better use of screen space

6. **Static pages with French copy**
   - `/organisateurs`: Guide for event organizers
   - `/contact`: Contact information and support
   - `/mentions-legales`: Legal notices and GDPR compliance

## Troubleshooting

### "Table 'SiteSettings' does not exist"

Run the Prisma migration:
```bash
npx prisma migrate dev --name add_site_settings
```

### "Function unaccent does not exist"

Enable the PostgreSQL extension:
```bash
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### "Drift detected" error

This means your database schema differs from your migration history. Options:
1. Use `prisma migrate dev` to create a new migration
2. Use `prisma db push` to sync schema without migrations (development only)
3. Manually resolve the drift

### Site settings not loading

1. Check that the database migration was applied
2. Verify the API route is accessible at `/api/settings`
3. Check browser console for errors
4. Ensure SiteSettingsProvider is wrapping your app in layout.tsx

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify database connection in `.env`
3. Ensure all dependencies are installed (`npm install`)
4. Check Prisma Client is generated (`npx prisma generate`)
