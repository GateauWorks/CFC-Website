"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateTimeForDisplay } from "@/lib/dateUtils";
import AuthGuard from "../_components/AuthGuard";
import AdminSidebar from "../_components/AdminSidebar";

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
  async function updateRegistrationStatus(id: string, status: "approved" | "rejected" | "pending") {
    await supabase
      .from("registrations")
      .update({ status })
      .eq("id", id);
    // Refresh registrations after update
    setSelectedRegistration(null);
    // Re-fetch registrations
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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [eventSlugs, setEventSlugs] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  console.log(selectedRegistration)

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
        <h1 className="text-3xl font-bold mb-8">Registrations</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {eventSlugs.map(slug => (
              <option key={slug} value={slug}>{slug === "all" ? "All Events" : slug}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Accepted</option>
            <option value="rejected">Denied</option>
          </select>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">Loading registrations...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">No registrations found.</span>
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
                        className="text-blue-600 hover:text-blue-900 mr-3"
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
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-2xl font-bold">{selectedRegistration.full_name}</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setSelectedRegistration(null)}
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm">{selectedRegistration.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{selectedRegistration.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{selectedRegistration.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Instagram Handle</label>
                      <p className="text-sm">{selectedRegistration.instagram || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <p className="text-sm">{formatDateTimeForDisplay(selectedRegistration.created_at)}</p>
                    </div>
                  </div>
                  {/* Status and Actions */}
                  <div className="mt-6 pt-6 border-t flex justify-between items-center">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${selectedRegistration.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedRegistration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedRegistration.status || 'pending'}
                      </span>
                    </div>
                    <div className="space-x-3">
                      <button
                        onClick={() => updateRegistrationStatus(selectedRegistration.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateRegistrationStatus(selectedRegistration.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateRegistrationStatus(selectedRegistration.id, 'pending')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Set Pending
                      </button>
                    </div>
                  </div>
                </div>
                {/* Car Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">Car Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Make</label>
                      <p className="text-sm">{selectedRegistration.car_make}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model</label>
                      <p className="text-sm">{selectedRegistration.car_model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year</label>
                      <p className="text-sm">{selectedRegistration.car_year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Color</label>
                      <p className="text-sm">{selectedRegistration.car_color || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">City, State</label>
                      <p className="text-sm">{selectedRegistration.city}, {selectedRegistration.state}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-sm">{selectedRegistration.website || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                {/* Rally Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">Rally Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Why Join This Rally?</label>
                      <p className="text-sm whitespace-pre-wrap">{selectedRegistration.why_join}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Has Rally Experience?</label>
                      <p className="text-sm">{selectedRegistration.has_rally_experience ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedRegistration.previous_rallies && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Previous Rallies</label>
                        <p className="text-sm whitespace-pre-wrap">{selectedRegistration.previous_rallies}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Car Photos */}
                {selectedRegistration.car_photos && selectedRegistration.car_photos.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Car Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedRegistration.car_photos.map((photoUrl: string, index: number) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img
                            src={photoUrl}
                            alt={`Car photo ${index + 1}`}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click on photos to view full size</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
