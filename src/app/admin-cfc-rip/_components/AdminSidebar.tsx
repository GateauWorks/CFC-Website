import Link from "next/link";

export default function AdminSidebar({ active }: { active?: string }) {
    return (
        <nav className="w-64 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-2 fixed md:static top-0 left-0">
            <Link href="/admin-cfc-rip/events">
                <span className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${active === "events" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100 text-gray-700"}`}>Events</span>
            </Link>
            <Link href="/admin-cfc-rip/registrations">
                <span className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${active === "registrations" ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100 text-gray-700"}`}>Registrations</span>
            </Link>
        </nav>
    );
}
