"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar({ active }: { active?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white border border-gray-200 rounded-md p-2 shadow-md"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`w-64 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-2 z-40 transition-transform duration-300 ease-in-out ${
                isOpen ? 'fixed top-0 left-0 translate-x-0' : 'fixed top-0 left-0 -translate-x-full md:translate-x-0 md:static'
            }`}>
                <div className="flex justify-between items-center mb-4 md:hidden">
                    <h2 className="text-lg font-semibold">Admin Panel</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <Link href="/admin-cfc-rip/events" onClick={() => setIsOpen(false)}>
                    <span className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${active === "events" ? "bg-green-100 text-green-800" : "hover:bg-gray-100 text-gray-700"}`}>Events</span>
                </Link>
                <Link href="/admin-cfc-rip/registrations" onClick={() => setIsOpen(false)}>
                    <span className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${active === "registrations" ? "bg-green-100 text-green-800" : "hover:bg-gray-100 text-gray-700"}`}>Registrations</span>
                </Link>
                
                {/* User info and logout */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="px-3 py-2 text-xs text-gray-500">
                        Logged in as: {user?.email}
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </>
    );
}
