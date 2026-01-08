import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import Link from "next/link";

export default async function Events() {
    const allPosts = await getAllPosts();

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
                {allPosts.length > 0 ? (
                    <MoreStories posts={allPosts} />
                ) : (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <svg
                                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                No Events Yet
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Check back soon for upcoming rallies and community events!
                            </p>
                            <Link
                                href="/register"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                Get Notified
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </Container>
        </main>
    );
}