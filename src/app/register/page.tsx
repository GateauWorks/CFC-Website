"use client";
import Container from "@/app/_components/container";
import { useState, useEffect } from "react";
import {
  submitRegistration,
  uploadImageWithValidation,
  getActiveEvent,
  getUpcomingEvents,
  type Registration,
  type BlogPost,
} from "@/lib/supabase";
import { formatDateForDisplay } from "@/lib/dateUtils";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    instagram: "",
    website: "",
    carYear: "",
    carMake: "",
    carModel: "",
    carColor: "",
    hasRallyExperience: "",
    previousRallies: "",
    whyJoin: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<BlogPost | null>(null);
  const [availableEvents, setAvailableEvents] = useState<BlogPost[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const [activeEvent, upcomingEvents] = await Promise.all([
          getActiveEvent(),
          getUpcomingEvents(),
        ]);

        setActiveEvent(activeEvent);
        setAvailableEvents(upcomingEvents);

        // Auto-select the active event if it exists and is in the upcoming events
        if (
          activeEvent &&
          upcomingEvents.some((event) => event.id === activeEvent.id)
        ) {
          setSelectedEventId(activeEvent.id || "");
        } else if (upcomingEvents.length > 0) {
          // Otherwise, select the first upcoming event
          setSelectedEventId(upcomingEvents[0].id || "");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 3 - uploadedPhotos.length;
    const newPhotos = files.slice(0, remainingSlots);

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Validate that an event is selected
    if (!selectedEventId) {
      setSubmitError("Please select an event to register for.");
      setIsSubmitting(false);
      return;
    }

    // Validate that at least one photo is uploaded
    if (uploadedPhotos.length === 0) {
      setSubmitError("Please upload at least one photo of your car.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload photos first
      let photoUrls: string[] = [];
      if (uploadedPhotos.length > 0) {
        const uploadPromises = uploadedPhotos.map((photo) =>
          uploadImageWithValidation(photo, "car-photos", {
            maxSizeInMB: 10,
            allowedTypes: [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ],
          })
        );
        photoUrls = await Promise.all(uploadPromises);
      }

      // Find the selected event
      const selectedEvent = availableEvents.find(
        (event) => event.id === selectedEventId
      );

      // Prepare registration data
      const registrationData: Omit<Registration, "id" | "created_at"> = {
        event_slug: selectedEvent?.slug || "default-event",
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        instagram: formData.instagram || undefined,
        website: formData.website || undefined,
        car_year: parseInt(formData.carYear),
        car_make: formData.carMake,
        car_model: formData.carModel,
        car_color: formData.carColor,
        has_rally_experience: formData.hasRallyExperience === "yes",
        previous_rallies: formData.previousRallies || undefined,
        why_join: formData.whyJoin,
        car_photos: photoUrls.length > 0 ? photoUrls : undefined,
        status: "pending",
      };

      // Submit to Supabase
      await submitRegistration(registrationData);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Registration submission error:", error);
      setSubmitError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return (
      <main>
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-8">
              Registration Submitted!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Thank you for registering for{" "}
              {availableEvents.find((e) => e.id === selectedEventId)?.title ||
                "our event"}
              . We'll review your application and get back to you within 2-3
              business days.
            </p>
            <p className="text-lg text-gray-600">
              Keep an eye on your email for updates and event details.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4">
              Register for Event
            </h1>
            {loadingEvents ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <p className="text-gray-500">Loading available events...</p>
              </div>
            ) : availableEvents.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Available Events</h2>
                <p className="text-gray-700 mb-4">
                  Choose which event you'd like to register for:
                </p>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-lg"
                  required
                >
                  <option value="">Select an event...</option>
                  {availableEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}{" "}
                      {event.date
                        ? `- ${formatDateForDisplay(event.date)}`
                        : "- Date TBD"}
                    </option>
                  ))}
                </select>
                {selectedEventId && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                    {(() => {
                      const selected = availableEvents.find(
                        (e) => e.id === selectedEventId
                      );
                      return selected ? (
                        <>
                          <h3 className="font-semibold text-lg mb-2">
                            {selected.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {selected.date
                              ? formatDateForDisplay(selected.date)
                              : "Date TBD"}{" "}
                            • Location TBD
                          </p>
                          <p className="text-gray-700">
                            {selected.excerpt ||
                              "Join us for an unforgettable rally experience. All proceeds benefit local charities."}
                          </p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">No Available Events</h2>
                <p className="text-gray-700">
                  There are currently no events available for registration.
                  Please check back later or contact us for more information.
                </p>
              </div>
            )}
          </div>

          {availableEvents.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media (Optional) */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  Social Media & Website (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Many rallies use this to see if the driver & car fit their
                  brand aesthetic.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Website/Portfolio
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Car Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Car Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="carYear"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Year *
                    </label>
                    <input
                      type="number"
                      id="carYear"
                      name="carYear"
                      required
                      min="1800"
                      max="2026"
                      value={formData.carYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="carMake"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Make *
                    </label>
                    <input
                      type="text"
                      id="carMake"
                      name="carMake"
                      required
                      placeholder="e.g., Porsche, Toyota, Ford"
                      value={formData.carMake}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="carModel"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Model *
                    </label>
                    <input
                      type="text"
                      id="carModel"
                      name="carModel"
                      required
                      placeholder="e.g., 911, Camry, Mustang"
                      value={formData.carModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="carColor"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Color *
                    </label>
                    <input
                      type="text"
                      id="carColor"
                      name="carColor"
                      required
                      placeholder="e.g., Alpine White, Red, Black"
                      value={formData.carColor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Car Photos */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Car Photos *</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload at least 1 photo of your car (up to 3 total). This
                  helps organizers verify your vehicle and may be used for
                  promotional materials.
                </p>

                {uploadedPhotos.length < 3 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photos ({uploadedPhotos.length}/3 uploaded) *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                )}

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Car photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rally Experience */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Rally Experience</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Have you participated in rallies before? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasRallyExperience"
                          value="yes"
                          required
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasRallyExperience"
                          value="no"
                          required
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  {formData.hasRallyExperience === "yes" && (
                    <div>
                      <label
                        htmlFor="previousRallies"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Which rallies have you participated in?
                      </label>
                      <textarea
                        id="previousRallies"
                        name="previousRallies"
                        rows={3}
                        placeholder="Please list the rallies you've participated in..."
                        value={formData.previousRallies}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Why Join */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  Tell Us About Yourself
                </h3>
                <div>
                  <label
                    htmlFor="whyJoin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Why do you want to join this rally? *
                  </label>
                  <p className="text-sm text-gray-600 mb-2">
                    This helps us ensure participants are aligned with our
                    rally's spirit and charitable mission.
                  </p>
                  <textarea
                    id="whyJoin"
                    name="whyJoin"
                    rows={4}
                    required
                    placeholder="Tell us what draws you to this rally and how you align with our charitable mission..."
                    value={formData.whyJoin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
                <p className="text-sm text-gray-600 mt-4">
                  We'll review your application and get back to you within 2-3
                  business days.
                </p>
              </div>
            </form>
          )}
        </div>
      </Container>
    </main>
  );
}
