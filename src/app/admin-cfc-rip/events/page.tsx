"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
// Define a type for event objects
type Event = {
    // ...existing code...
    published?: boolean;
    id: string;
    title: string;
    date?: string;
    excerpt?: string;
    description?: string;
    content?: string;
    cover_image?: string;
    slug: string;
};
import AdminSidebar from "../_components/AdminSidebar";

export default function AdminEvents() {
    const [newUploading, setNewUploading] = useState(false);

    async function handleNewCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewUploading(true);
        const filePath = `blog-covers/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('blog-covers').upload(filePath, file);
        if (!error && data) {
            const publicUrl = supabase.storage.from('blog-covers').getPublicUrl(filePath).data.publicUrl;
            setNewCoverImage(publicUrl || filePath);
        }
        setNewUploading(false);
    }
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newExcerpt, setNewExcerpt] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCoverImage, setNewCoverImage] = useState("");
    const [newPublished, setNewPublished] = useState(false);
    const [creating, setCreating] = useState(false);

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        // Generate slug from title
        const slug = newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const { error } = await supabase
            .from("posts")
            .insert({
                title: newTitle,
                excerpt: newExcerpt,
                content: newContent,
                cover_image: newCoverImage,
                published: newPublished,
                slug
            });
        setCreating(false);
        setCreateModalOpen(false);
        setNewTitle("");
        setNewExcerpt("");
        setNewContent("");
        setNewCoverImage("");
        setNewPublished(false);
        window.location.reload();
    }
    const [uploading, setUploading] = useState(false);

    async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const filePath = `blog-covers/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('blog-covers').upload(filePath, file);
        if (!error && data) {
            const publicUrl = supabase.storage.from('blog-covers').getPublicUrl(filePath).data.publicUrl;
            setEditCoverImage(publicUrl || filePath);
        }
        setUploading(false);
    }
    const [editEvent, setEditEvent] = useState<Event | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [editTitle, setEditTitle] = useState<string>("");
    const [editExcerpt, setEditExcerpt] = useState<string>("");
    const [editCoverImage, setEditCoverImage] = useState<string>("");
    const [editPublished, setEditPublished] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    function openEditModal(event: Event) {
        setEditEvent(event);
        setEditContent(event.content || "");
        setEditTitle(event.title || "");
        setEditExcerpt(event.excerpt || "");
        setEditCoverImage(event.cover_image || "");
        setEditPublished(!!event.published);
    }

    async function saveEdit() {
        if (!editEvent) return;
        setSaving(true);
        const { error } = await supabase
            .from("posts")
            .update({
                title: editTitle,
                excerpt: editExcerpt,
                content: editContent,
                cover_image: editCoverImage,
                published: editPublished
            })
            .eq("id", editEvent.id);
        setSaving(false);
        setEditEvent(null);
        // Optionally, refresh events list here
        window.location.reload();
    }
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setEvents(data as Event[]);
            }
            setLoading(false);
        }
        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <AdminSidebar active="events" />
            <main className="flex-1 p-8">
                <div className="flex justify-end mb-6">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Create New Post
                    </button>
                </div>
                <h1 className="text-3xl font-bold mb-8">Current Events</h1>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-gray-500">Loading events...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-gray-500">No events found.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: Event) => (
                            <div key={event.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                                {event.cover_image && (
                                    <img src={event.cover_image} alt={event.title} className="w-full h-40 object-cover rounded mb-4" />
                                )}
                                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                                <p className="text-gray-600 text-sm mb-2">{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</p>
                                <p className="text-gray-700 mb-4">{event.excerpt || event.description || 'No description.'}</p>
                                <div className="mt-auto flex gap-2">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
                                        onClick={() => openEditModal(event)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Details Modal */}
                {/* Edit Modal */}
                {/* Create Modal */}
                {createModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto shadow-lg">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-2xl font-bold">Create New Post</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                    onClick={() => setCreateModalOpen(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form className="p-4 space-y-4" onSubmit={handleCreatePost}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                                    <textarea className="w-full border rounded px-3 py-2" value={newExcerpt} onChange={e => setNewExcerpt(e.target.value)} rows={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                                    <textarea className="w-full border rounded px-3 py-2 font-mono" value={newContent} onChange={e => setNewContent(e.target.value)} rows={8} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" className="w-full border rounded px-3 py-2" value={newCoverImage} onChange={e => setNewCoverImage(e.target.value)} placeholder="Paste image URL or upload below" />
                                        {newCoverImage && (
                                            <img src={newCoverImage} alt="cover preview" className="h-16 w-24 object-cover rounded border" />
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="mt-2" onChange={handleNewCoverImageUpload} disabled={newUploading} />
                                    {newUploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={newPublished} onChange={e => setNewPublished(e.target.checked)} id="newPublished" />
                                    <label htmlFor="newPublished" className="text-sm">Published</label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm" disabled={creating}>
                                        {creating ? "Creating..." : "Create"}
                                    </button>
                                    <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm" onClick={() => setCreateModalOpen(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {editEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto shadow-lg">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-2xl font-bold">Edit Post</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                    onClick={() => setEditEvent(null)}
                                >
                                    ×
                                </button>
                            </div>
                            <form className="p-4 space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                                    <textarea className="w-full border rounded px-3 py-2" value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                                    <textarea className="w-full border rounded px-3 py-2 font-mono" value={editContent} onChange={e => setEditContent(e.target.value)} rows={8} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" className="w-full border rounded px-3 py-2" value={editCoverImage} onChange={e => setEditCoverImage(e.target.value)} placeholder="Paste image URL or upload below" />
                                        {editCoverImage && (
                                            <img src={editCoverImage} alt="cover preview" className="h-16 w-24 object-cover rounded border" />
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="mt-2" onChange={handleCoverImageUpload} disabled={uploading} />
                                    {uploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={editPublished} onChange={e => setEditPublished(e.target.checked)} id="published" />
                                    <label htmlFor="published" className="text-sm">Published</label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm" disabled={saving}>
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm" onClick={() => setEditEvent(null)}>
                                        Cancel
                                    </button>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-1">Preview</label>
                                    <div className="border rounded p-3 bg-gray-50 whitespace-pre-line">
                                        {editContent}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto shadow-lg">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    ×
                                </button>
                            </div>
                            {selectedEvent.cover_image && (
                                <img src={selectedEvent.cover_image} alt={selectedEvent.title} className="w-full h-64 object-cover rounded-t" />
                            )}
                            <div className="p-4">
                                <p className="text-gray-600 text-sm mb-2">{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'Date TBD'}</p>
                                <p className="text-gray-700 mb-4">{selectedEvent.excerpt || selectedEvent.description || 'No description.'}</p>
                                <div className="prose max-w-none" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedEvent.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
