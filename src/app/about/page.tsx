import Container from "@/app/_components/container";

export default function About() {
    return (
        <main>
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4">
                            About Us
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600">
                            Driving change, one rally at a time
                        </p>
                    </div>

                    <div className="prose prose-lg mx-auto">
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-lg leading-relaxed mb-6">
                                Convoy for a Cause is a nonprofit organization dedicated to organizing rallies and convoys that bring people together to support important causes. We believe that when automotive enthusiasts unite for a common purpose, we can drive meaningful change in our communities.
                            </p>
                            <p className="text-lg leading-relaxed">
                                Through scenic drives, community gatherings, and charitable events, we raise awareness and funds for local causes while celebrating our shared passion for automobiles and the open road.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                            <p className="text-lg leading-relaxed mb-6">
                                Founded in 2023, Convoy for a Cause started with a simple idea: combining the joy of driving with the power of giving back. Our inaugural rally brought together 15 vehicles and 30 participants, raising over $5,000 for the local food bank.
                            </p>
                            <p className="text-lg leading-relaxed">
                                What began as a modest gathering has grown into a movement that organizes multiple rallies throughout the year, supporting various local charities and causes while building lasting friendships within our automotive community.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-6">What We Do</h2>
                            <div className="grid md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Charitable Rallies</h3>
                                    <p className="text-lg leading-relaxed">
                                        We organize scenic driving events that raise funds and awareness for local charities, from food banks to children's organizations.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Community Building</h3>
                                    <p className="text-lg leading-relaxed">
                                        Our events bring together car enthusiasts of all backgrounds, creating lasting connections through shared experiences.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Awareness Campaigns</h3>
                                    <p className="text-lg leading-relaxed">
                                        We use our platform to highlight important causes and encourage community involvement beyond our events.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Inclusive Events</h3>
                                    <p className="text-lg leading-relaxed">
                                        All vehicles and drivers are welcome—from vintage classics to modern hybrids, it's about the cause, not the car.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold mb-6">Our Impact</h2>
                            <p className="text-lg leading-relaxed mb-6">
                                Since our founding, we've organized numerous successful rallies, bringing together hundreds of participants and raising thousands of dollars for local charities. But our impact goes beyond fundraising—we've built a community of like-minded individuals who believe in the power of collective action.
                            </p>
                            <p className="text-lg leading-relaxed">
                                Every rally we organize strengthens the bonds within our community while making a tangible difference in the lives of those we support. This is the Convoy for a Cause way: driving together, giving back, and making every mile matter.
                            </p>
                        </section>

                        <section className="text-center bg-gray-50 p-8 rounded-lg">
                            <h2 className="text-3xl font-bold mb-4">Join Our Convoy</h2>
                            <p className="text-lg leading-relaxed mb-6">
                                Ready to be part of something meaningful? Whether you drive a classic car, a modern vehicle, or anything in between, there's a place for you in our convoy.
                            </p>
                            <p className="text-lg font-semibold">
                                Together, we drive change—one rally at a time.
                            </p>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}