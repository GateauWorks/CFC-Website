"use client";
import { useState, useEffect } from "react";
import { supabase, uploadImageWithValidation } from "@/lib/supabase";
import { formatDateForDisplay, formatDateForInput } from "@/lib/dateUtils";
import AuthGuard from "../_components/AuthGuard";
import AdminSidebar from "../_components/AdminSidebar";
import { Toast, useToast } from "@/app/_components/toast";
import { ConfirmationDialog } from "../_components/ConfirmationDialog";
import { Modal } from "../_components/Modal";
import { ModalHeader } from "../_components/ModalHeader";
import { ModalBody } from "../_components/ModalBody";
import { ModalFooter } from "../_components/ModalFooter";

// Define a type for event objects
type Event = {
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

export default function AdminEvents() {
    const { toast, showToast, hideToast } = useToast();
    const [newUploading, setNewUploading] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        variant: "info",
    });

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
            showToast(`File type ${file.type} not allowed. Please use: ${allowedTypes.join(', ')}`, "error");
            return;
        }
        
        // Validate file size (5MB limit)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 5) {
            showToast(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds limit of 5MB`, "error");
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
            
            // Refresh events list
            const { data: refreshedData } = await supabase
                .from('posts')
                .select('*')
                .order('date', { ascending: false });
            if (refreshedData) {
                setEvents(refreshedData as Event[]);
            }
            
            setCreateModalOpen(false);
            setNewTitle("");
            setNewDate("");
            setNewExcerpt("");
            setNewContent("");
            setNewCoverImage("");
            setNewPublished(false);
            setNewImageFile(null);
            setNewImagePreview(null);
            showToast("Event created successfully!", "success");
        } catch (error) {
            console.error('Error creating post:', error);
            showToast(error instanceof Error ? error.message : 'Failed to create post', "error");
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
            showToast("Image uploaded successfully!", "success");
        } catch (error) {
            console.error('Image upload error:', error);
            showToast(error instanceof Error ? error.message : 'Failed to upload image', "error");
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
        try {
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
            
            if (error) throw error;
            
            // Refresh events list
            const { data: refreshedData } = await supabase
                .from('posts')
                .select('*')
                .order('date', { ascending: false });
            if (refreshedData) {
                setEvents(refreshedData as Event[]);
            }
            
            setEditEvent(null);
            showToast("Event updated successfully!", "success");
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update event', "error");
        } finally {
            setSaving(false);
        }
    }

    async function setActiveEvent(eventId: string) {
        try {
            // First, set all events to inactive
            await supabase
                .from("posts")
                .update({ active: false })
                .neq("id", ""); // Update all records

            // Then set the selected event as active
            const { error } = await supabase
                .from("posts")
                .update({ active: true })
                .eq("id", eventId);

            if (error) throw error;

            // Refresh the events list
            const { data: refreshedData } = await supabase
                .from('posts')
                .select('*')
                .order('date', { ascending: false });
            if (refreshedData) {
                setEvents(refreshedData as Event[]);
            }
            
            showToast("Event set as active!", "success");
        } catch (error) {
            console.error("Error setting active event:", error);
            showToast("Failed to set event as active", "error");
        }
    }

    async function setInactiveEvent(eventId: string) {
        try {
            const { error } = await supabase
                .from("posts")
                .update({ active: false })
                .eq("id", eventId);

            if (error) throw error;

            // Refresh the events list
            const { data: refreshedData } = await supabase
                .from('posts')
                .select('*')
                .order('date', { ascending: false });
            if (refreshedData) {
                setEvents(refreshedData as Event[]);
            }
            
            showToast("Event set as inactive", "success");
        } catch (error) {
            console.error("Error setting inactive event:", error);
            showToast("Failed to set event as inactive", "error");
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
                        className="btn-primary whitespace-nowrap flex items-center gap-2"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Event
                    </button>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                <div className="flex gap-2 mt-4">
                                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
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
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
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
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                                            onClick={() => {
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    title: "Set Event Inactive?",
                                                    message: `Are you sure you want to set "${event.title}" as inactive?`,
                                                    onConfirm: () => {
                                                        setInactiveEvent(event.id);
                                                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                                                    },
                                                    variant: "warning",
                                                });
                                            }}
                                        >
                                            Set Inactive
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                                            onClick={() => {
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    title: "Set Event Active?",
                                                    message: `This will set "${event.title}" as the active event and deactivate all other events. Continue?`,
                                                    onConfirm: () => {
                                                        setActiveEvent(event.id);
                                                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                                                    },
                                                    variant: "info",
                                                });
                                            }}
                                        >
                                            Set Active
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    title="Create New Event"
                    size="lg"
                >
                    <form onSubmit={handleCreatePost}>
                        <ModalBody className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                        value={newTitle} 
                                        onChange={e => setNewTitle(e.target.value)} 
                                        required 
                                        placeholder="Event title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                        value={newDate} 
                                        onChange={e => setNewDate(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
                                    <textarea 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none" 
                                        value={newExcerpt} 
                                        onChange={e => setNewExcerpt(e.target.value)} 
                                        rows={3}
                                        placeholder="Brief description of the event"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                                    <textarea 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none font-mono text-sm" 
                                        value={newContent} 
                                        onChange={e => setNewContent(e.target.value)} 
                                        rows={10}
                                        placeholder="Full event content (HTML supported)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                            value={newCoverImage} 
                                            onChange={e => setNewCoverImage(e.target.value)} 
                                            placeholder="Paste image URL or upload below" 
                                        />
                                        {newCoverImage && (
                                            <div className="relative">
                                                <img src={newCoverImage} alt="cover preview" className="h-32 w-full object-cover rounded-lg border-2 border-gray-200" />
                                            </div>
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
                                <label htmlFor="newPublished" className="text-sm font-medium text-gray-700">Published</label>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button 
                                type="submit" 
                                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50" 
                                disabled={creating || newUploading}
                            >
                                {newUploading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : creating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Create Event
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary px-6" 
                                onClick={() => setCreateModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </ModalFooter>
                    </form>
                </Modal>
                <Modal
                    isOpen={!!editEvent}
                    onClose={() => setEditEvent(null)}
                    title="Edit Event"
                    size="xl"
                >
                    <form onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                        <ModalBody className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                    value={editTitle} 
                                    onChange={e => setEditTitle(e.target.value)} 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                    value={editDate} 
                                    onChange={e => setEditDate(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none" 
                                    value={editExcerpt} 
                                    onChange={e => setEditExcerpt(e.target.value)} 
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none font-mono text-sm" 
                                    value={editContent} 
                                    onChange={e => setEditContent(e.target.value)} 
                                    rows={10}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" 
                                        value={editCoverImage} 
                                        onChange={e => setEditCoverImage(e.target.value)} 
                                        placeholder="Paste image URL or upload below" 
                                    />
                                    {editCoverImage && (
                                        <div className="relative">
                                            <img src={editCoverImage} alt="cover preview" className="h-32 w-full object-cover rounded-lg border-2 border-gray-200" />
                                        </div>
                                    )}
                                </div>
                                    <input type="file" accept="image/*" className="mt-2" onChange={handleCoverImageUpload} disabled={uploading} />
                                    {uploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                                </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={editPublished} onChange={e => setEditPublished(e.target.checked)} id="published" />
                                <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button 
                                type="submit" 
                                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50" 
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary px-6" 
                                onClick={() => setEditEvent(null)}
                            >
                                Cancel
                            </button>
                        </ModalFooter>
                    </form>
                </Modal>
                <Modal
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    title={selectedEvent?.title || "Event Details"}
                    size="lg"
                >
                    {selectedEvent && (
                        <>
                            {selectedEvent.cover_image && (
                                <img 
                                    src={selectedEvent.cover_image} 
                                    alt={selectedEvent.title} 
                                    className="w-full h-64 object-cover" 
                                />
                            )}
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">Date</p>
                                        <p className="text-gray-900">{formatDateForDisplay(selectedEvent.date || null)}</p>
                                    </div>
                                    {selectedEvent.excerpt && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-1">Excerpt</p>
                                            <p className="text-gray-700">{selectedEvent.excerpt}</p>
                                        </div>
                                    )}
                                    {selectedEvent.content && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Content</p>
                                            <div className="prose max-w-none text-gray-700" style={{ whiteSpace: 'pre-line' }}>
                                                {selectedEvent.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ModalBody>
                        </>
                    )}
                </Modal>
            </main>
        </div>
        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        )}
        <ConfirmationDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            variant={confirmDialog.variant}
        />
        </AuthGuard>
    );
}
