import Avatar from "@/app/_components/avatar";
import CoverImage from "@/app/_components/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}: Props) {
  return (
    <section className="mb-20 md:mb-32">
      <div className="mb-6 md:mb-10 rounded-2xl overflow-hidden shadow-xl">
        <CoverImage title={title} src={coverImage} slug={slug} hero />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-12">
        <div className="mb-6 md:mb-0">
          <div className="mb-4 text-sm font-semibold text-green-600 uppercase tracking-wide">
            Featured Event
          </div>
          <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl leading-tight font-bold text-gray-900">
            <Link 
              href={`/posts/${slug}`} 
              className="hover:text-green-600 transition-colors duration-200"
            >
              {title}
            </Link>
          </h2>
          <div className="mb-6 text-base text-gray-600 font-medium">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div className="flex items-center">
          <p className="text-lg md:text-xl leading-relaxed text-gray-700">
            {excerpt}
          </p>
        </div>
      </div>
    </section>
  );
}
