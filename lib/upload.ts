import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-side client with service role for uploads
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

/**
 * Upload image to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name (default: 'events')
 * @returns Public URL of uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string = 'events'
): Promise<string | null> {
  if (!supabaseAdmin) {
    console.error('Supabase not configured')
    return null
  }

  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux. Taille maximale : 5 MB.')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // Upload file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

/**
 * Validate image URL (for external URLs)
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && contentType?.startsWith('image/')
  } catch {
    return false
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string, bucket: string = 'events'): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error('Supabase not configured')
    return false
  }

  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
    return !error
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}
