import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Registration {
  id?: string
  created_at?: string
  event_slug?: string
  full_name: string
  email: string
  phone: string
  city: string
  state: string
  instagram?: string
  website?: string
  car_year: number
  car_make: string
  car_model: string
  car_color: string
  has_rally_experience?: boolean // Nullable in database
  previous_rallies?: string
  why_join: string
  car_photos?: string[] // Matches database schema: car_photos text[]
  status?: string // Changed from specific type to string to match database
}

export interface BlogPost {
  id?: string
  created_at?: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  slug: string
  published?: boolean
}

// Registration Functions
export async function submitRegistration(data: Omit<Registration, 'id' | 'created_at'>) {
  console.log('Attempting to submit registration:', data)
  
  const { data: registration, error } = await supabase
    .from('registrations')
    .insert([data])
    .select()

  if (error) {
    console.error('Registration error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      data: data
    })
    throw error
  }

  return registration[0]
}

export async function getRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registrations:', error)
    throw error
  }

  return data
}

export async function updateRegistrationStatus(id: string, status: Registration['status']) {
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating registration:', error)
    throw error
  }
}

// Blog/Events Functions
export async function getBlogPosts(published = true) {
  const query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (published) {
    query.eq('published', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    throw error
  }

  return data
}

export async function getBlogPost(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    throw error
  }

  return data
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()

  if (error) {
    console.error('Error creating post:', error)
    throw error
  }

  return data[0]
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating post:', error)
    throw error
  }

  return data[0]
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

// File Upload Functions
export async function uploadImage(file: File, bucket: string, path?: string) {
  const fileName = path || `${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) {
    console.error('Upload error:', error)
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteImage(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    throw error
  }
}
