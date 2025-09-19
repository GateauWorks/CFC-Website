"use client";
import { useState, useEffect } from "react";
import { supabase, uploadImageWithValidation } from "@/lib/supabase";
import { formatDateForDisplay, formatDateForInput } from "@/lib/dateUtils";
import AuthGuard from "../_components/AuthGuard";
// Define a type for event objects
type Event = {
    // ...existing code...
    published?: boolean;
    active?: boolean;
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
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

    function handleNewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setNewImageFile(null);
            setNewImagePreview(null);
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert(`File type ${file.type} not allowed. Please use: ${allowedTypes.join(', ')}`);
            return;
        }
        
        // Validate file size (5MB limit)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 5) {
            alert(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds limit of 5MB`);
            return;
        }
        
        setNewImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setNewImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
    }

    async function handleNewCoverImageUpload(file: File, eventSlug: string): Promise<string> {
        const publicUrl = await uploadImageWithValidation(file, 'post-images', {
            maxSizeInMB: 5,
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            path: `${eventSlug}/cover.jpg`
        });
        return publicUrl;
    }
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newExcerpt, setNewExcerpt] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCoverImage, setNewCoverImage] = useState("");
    const [newPublished, setNewPublished] = useState(false);
    const [creating, setCreating] = useState(false);

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        
        try {
            // Generate slug from title
            const slug = newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            
            let coverImageUrl = newCoverImage;
            
            // Upload image if one was selected
            if (newImageFile) {
                setNewUploading(true);
                coverImageUrl = await handleNewCoverImageUpload(newImageFile, slug);
            }
            
            const { error } = await supabase
                .from("posts")
                .insert({
                    title: newTitle,
                    date: newDate,
                    excerpt: newExcerpt,
                    content: newContent,
                    cover_image: coverImageUrl,
                    published: newPublished,
                    slug
                });
            
            if (error) throw error;
            
            setCreateModalOpen(false);
            setNewTitle("");
            setNewDate("");
            setNewExcerpt("");
            setNewContent("");
            setNewCoverImage("");
            setNewPublished(false);
            setNewImageFile(null);
            setNewImagePreview(null);
            window.location.reload();
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error instanceof Error ? error.message : 'Failed to create post');
        } finally {
            setCreating(false);
            setNewUploading(false);
        }
    }
    const [uploading, setUploading] = useState(false);

    async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        
        try {
            const publicUrl = await uploadImageWithValidation(file, 'blog-covers', {
                maxSizeInMB: 5,
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
                path: `blog-covers/${Date.now()}-${file.name}`
            });
            setEditCoverImage(publicUrl);
        } catch (error) {
            console.error('Image upload error:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    }
    const [editEvent, setEditEvent] = useState<Event | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [editTitle, setEditTitle] = useState<string>("");
    const [editExcerpt, setEditExcerpt] = useState<string>("");
    const [editDate, setEditDate] = useState<string>("");
    const [editCoverImage, setEditCoverImage] = useState<string>("");
    const [editPublished, setEditPublished] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    function openEditModal(event: Event) {
        setEditEvent(event);
        setEditContent(event.content || "");
        setEditTitle(event.title || "");
        setEditExcerpt(event.excerpt || "");
        setEditDate(formatDateForInput(event.date || null));
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
                date: editDate,
                cover_image: editCoverImage,
                published: editPublished
            })
            .eq("id", editEvent.id);
        setSaving(false);
        setEditEvent(null);
        // Optionally, refresh events list here
        window.location.reload();
    }

    async function setActiveEvent(eventId: string) {
        try {
            // First, set all events to inactive
            await supabase
                .from("posts")
                .update({ active: false })
                .neq("id", ""); // Update all records

            // Then set the selected event as active
            await supabase
                .from("posts")
                .update({ active: true })
                .eq("id", eventId);

            // Refresh the events list
            window.location.reload();
        } catch (error) {
            console.error("Error setting active event:", error);
        }
    }

    async function setInactiveEvent(eventId: string) {
        try {
            await supabase
                .from("posts")
                .update({ active: false })
                .eq("id", eventId);

            // Refresh the events list
            window.location.reload();
        } catch (error) {
            console.error("Error setting inactive event:", error);
        }
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
                .order('date', { ascending: false });
            if (!error && data) {
                setEvents(data as Event[]);
            }
            setLoading(false);
        }
        fetchEvents();
    }, []);
    
    return (
        <AuthGuard>
            <div className="flex flex-col md:flex-row min-h-screen">
                <AdminSidebar active="events" />
                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Current Events</h1>
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Create New Post
                    </button>
                </div>
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
                            <div key={event.id} className={`bg-white rounded-lg shadow p-6 flex flex-col relative ${event.active ? 'ring-2 ring-green-500' : ''}`}>
                                {event.active && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        Active Event
                                    </div>
                                )}
                                {event.cover_image && (
                                    <img src={event.cover_image} alt={event.title} className="w-full h-40 object-cover rounded mb-4" />
                                )}
                                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                                <p className="text-gray-600 text-sm mb-2">{formatDateForDisplay(event.date || null)}</p>
                                <p className="text-gray-700 mb-4">{event.excerpt || event.description || 'No description.'}</p>
                                <div className="mt-auto flex flex-wrap gap-2">
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
                                    {event.active ? (
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                            onClick={() => setInactiveEvent(event.id)}
                                        >
                                            Set Inactive
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                                            onClick={() => setActiveEvent(event.id)}
                                        >
                                            Set Active
                                        </button>
                                    )}
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
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full border rounded px-3 py-2" 
                                        value={newDate} 
                                        onChange={e => setNewDate(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                                    <textarea className="w-full border rounded px-3 py-2" value={newExcerpt} onChange={e => setNewExcerpt(e.target.value)} rows={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content</label>
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
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="mt-2" 
                                        onChange={handleNewImageSelect} 
                                        disabled={newUploading} 
                                    />
                                    {newImagePreview && (
                                        <div className="mt-2">
                                            <img src={newImagePreview} alt="Preview" className="w-32 h-20 object-cover rounded" />
                                            <p className="text-xs text-gray-500 mt-1">Image will be uploaded when you create the post</p>
                                        </div>
                                    )}
                                    {newUploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={newPublished} onChange={e => setNewPublished(e.target.checked)} id="newPublished" />
                                    <label htmlFor="newPublished" className="text-sm">Published</label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm" disabled={creating || newUploading}>
                                        {newUploading ? "Uploading Image..." : creating ? "Creating..." : "Create"}
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
                        <div className="bg-white rounded-lg max-w-4xl w-full overflow-y-auto shadow-lg">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-2xl font-bold">Edit Post</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                    onClick={() => setEditEvent(null)}
                                >
                                </button>
                            </div>
                            <form className="p-4 space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full border rounded px-3 py-2" 
                                        value={editDate} 
                                        onChange={e => setEditDate(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                                    <textarea className="w-full border rounded px-3 py-2" value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content</label>
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
                                <p className="text-gray-600 text-sm mb-2">{formatDateForDisplay(selectedEvent.date || null)}</p>
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
        </AuthGuard>
    );
}
