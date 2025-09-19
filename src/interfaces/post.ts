import { type Author } from "./author";

export type Post = {
  id?: string;
  slug: string;
  title: string;
  created_at?: string;
  date: string;
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
  active?: boolean; // For registrations
};
