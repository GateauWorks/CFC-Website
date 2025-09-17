import { type Author } from "./author";

export type Post = {
  id?: string;
  slug: string;
  title: string;
  created_at?: string;
  date?: string; // Keep for backward compatibility
  coverImage: string;
  cover_image?: string; // Database field name
  author?: Author; // Optional for database posts
  excerpt: string;
  ogImage?: {
    url: string;
  };
  content: string;
  preview?: boolean;
  published?: boolean;
};
