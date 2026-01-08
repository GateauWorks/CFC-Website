"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateTimeForDisplay } from "@/lib/dateUtils";
import AuthGuard from "../_components/AuthGuard";
import AdminSidebar from "../_components/AdminSidebar";
import { Modal } from "../_components/Modal";
import { ModalBody } from "../_components/ModalBody";
import { ModalFooter } from "../_components/ModalFooter";
import { Toast, useToast } from "@/app/_components/toast";

// Registration type
interface Registration {
  id: string;
  full_name: string;
  email: string;
  status?: "pending" | "approved" | "rejected";
  event_slug: string;
  car_make?: string;
  car_model?: string;
  car_year?: string;
  created_at?: string;
  [key: string]: any;
}

export default function AdminRegistrations() {
  const { toast, showToast, hideToast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [eventSlugs, setEventSlugs] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  async function updateRegistrationStatus(id: string, status: "approved" | "rejected" | "pending") {
    setUpdatingStatus(id);
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;

      // Refresh registrations after update
      let query = supabase.from("registrations").select("*");
      if (selectedSlug !== "all") {
        query = query.eq("event_slug", selectedSlug);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error: fetchError } = await query.order("created_at", { ascending: false });
      
      if (!fetchError && data) {
        setRegistrations(data as Registration[]);
        // Update selected registration if it's still open
        if (selectedRegistration && selectedRegistration.id === id) {
          setSelectedRegistration({ ...selectedRegistration, status });
        }
      }
      
      const statusMessages = {
        approved: "Registration approved successfully!",
        rejected: "Registration rejected.",
        pending: "Registration set to pending.",
      };
      
      showToast(statusMessages[status], "success");
    } catch (error) {
      showToast("Failed to update registration status", "error");
    } finally {
      setUpdatingStatus(null);
    }
  }

  useEffect(() => {
    async function fetchEventSlugs() {
      const { data, error } = await supabase
        .from("posts")
        .select("slug");
      if (!error && data) {
        setEventSlugs(["all", ...data.map((d: any) => d.slug)]);
      }
    }
    fetchEventSlugs();
  }, []);

  useEffect(() => {
    async function fetchRegistrations() {
      setLoading(true);
      let query = supabase.from("registrations").select("*");
      if (selectedSlug !== "all") {
        query = query.eq("event_slug", selectedSlug);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) {
        setRegistrations(data as Registration[]);
      }
      setLoading(false);
    }
    fetchRegistrations();
  }, [selectedSlug, statusFilter]);

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row min-h-screen">
        <AdminSidebar active="registrations" />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Registrations</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
            >
              {eventSlugs.map(slug => (
                <option key={slug} value={slug}>{slug === "all" ? "All Events" : slug}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Accepted</option>
              <option value="rejected">Denied</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500">Loading registrations...</span>
            </div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No registrations found.</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td className="px-6 py-4 text-sm font-medium">{reg.full_name}</td>
                    <td className="px-6 py-4 text-sm">{reg.email}</td>
                    <td className="px-6 py-4 text-sm">{reg.event_slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${reg.status === "approved" ? "bg-green-100 text-green-800" : reg.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{reg.status || "pending"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedRegistration(reg)}
                        className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Registration Details Modal */}
        <Modal
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          title={selectedRegistration?.full_name || "Registration Details"}
          size="xl"
        >
          {selectedRegistration && (
            <>
              <ModalBody className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.full_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Instagram Handle</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.instagram || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration Date</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDateTimeForDisplay(selectedRegistration.created_at)}</p>
                    </div>
                  </div>
                </div>
                {/* Car Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Car Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Make</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.car_make}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Model</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.car_model}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.car_year}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Color</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.car_color || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City, State</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedRegistration.city}, {selectedRegistration.state}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedRegistration.website ? (
                          <a href={selectedRegistration.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                            {selectedRegistration.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Rally Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Rally Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Why Join This Rally?</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRegistration.why_join}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Has Rally Experience?</label>
                      <p className="text-sm text-gray-900">{selectedRegistration.has_rally_experience ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedRegistration.previous_rallies && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Previous Rallies</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedRegistration.previous_rallies}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Car Photos */}
                {selectedRegistration.car_photos && selectedRegistration.car_photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Car Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedRegistration.car_photos.map((photoUrl: string, index: number) => (
                        <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-colors cursor-pointer group">
                          <img
                            src={photoUrl}
                            alt={`Car photo ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click on photos to view full size</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Current Status</label>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedRegistration.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedRegistration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedRegistration.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => updateRegistrationStatus(selectedRegistration.id, 'approved')}
                    disabled={updatingStatus === selectedRegistration.id}
                    className="btn-primary disabled:opacity-50 flex items-center gap-2"
                  >
                    {updatingStatus === selectedRegistration.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Approve'
                    )}
                  </button>
                  <button
                    onClick={() => updateRegistrationStatus(selectedRegistration.id, 'rejected')}
                    disabled={updatingStatus === selectedRegistration.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateRegistrationStatus(selectedRegistration.id, 'pending')}
                    disabled={updatingStatus === selectedRegistration.id}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Set Pending
                  </button>
                </div>
              </ModalFooter>
            </>
          )}
        </Modal>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
