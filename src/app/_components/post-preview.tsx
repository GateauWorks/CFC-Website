import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  slug: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}: Props) {
  return (
    <article className="group card card-hover overflow-hidden">
      <div className="mb-5 overflow-hidden rounded-t-xl">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <div className="p-6">
        <h3 className="text-2xl md:text-3xl mb-3 leading-tight font-bold">
          <Link 
            href={`/posts/${slug}`} 
            className="text-gray-900 hover:text-green-600 transition-colors duration-200"
          >
            {title}
          </Link>
        </h3>
        <div className="text-sm text-gray-500 mb-4 font-medium">
          <DateFormatter dateString={date} />
        </div>
        <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-4 line-clamp-3">
          {excerpt}
        </p>
        <Link
          href={`/posts/${slug}`}
          className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-sm group-hover:gap-2 transition-all duration-200"
        >
          Read more
          <svg
            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
