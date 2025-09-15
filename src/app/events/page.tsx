import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

export default function Events() {
    const allPosts = getAllPosts();

    return (
        <main>
            <Container>
                <div className="mb-16 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4">
                        Events
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Join us for our upcoming rallies and community events. Every drive makes a difference!
                    </p>
                </div>
                {allPosts.length > 0 && <MoreStories posts={allPosts} />}
            </Container>
        </main>
    );
}