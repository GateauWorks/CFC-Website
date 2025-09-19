import { Post } from "@/interfaces/post";
import { getBlogPosts, getBlogPost } from "@/lib/supabase";

export async function getPostSlugs() {
  const posts = await getBlogPosts();
  return posts.map(post => post.slug);
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const post = await getBlogPost(slug);
  
  // Transform Supabase post to match the existing Post interface
  return {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.cover_image,
    date: post.date || new Date().toISOString(),
    slug: post.slug,
    published: post.published,
  } as Post;
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getBlogPosts();
  
  // Transform Supabase posts to match the existing Post interface
  return posts.map(post => ({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.cover_image,
    date: post.date || new Date().toISOString(),
    slug: post.slug,
    published: post.published,
  })) as Post[];
}
