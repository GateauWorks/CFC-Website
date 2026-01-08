import { Post } from "@/interfaces/post";
import { PostPreview } from "./post-preview";

type Props = {
  posts: Post[];
  showTitle?: boolean;
};

export function MoreStories({ posts, showTitle }: Props) {
  return (
    <section className="mb-20 md:mb-32">
      {showTitle && (
        <div className="mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Past Convoys
          </h2>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post, index) => (
          <div
            key={post.slug}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <PostPreview
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
