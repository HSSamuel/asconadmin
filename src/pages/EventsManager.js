import React, { useState } from "react";
import axios from "axios";
import EventsTab from "../components/EventsTab";
import ConfirmModal from "../ConfirmModal";
import Toast from "../Toast";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const BASE_URL = process.env.REACT_APP_API_URL || "https://ascon.onrender.com";

function EventsManager({ token, canEdit }) {
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [editingId, setEditingId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    // ❌ REMOVED: location
    type: "News",
    image: "",
  });

  const events = usePaginatedFetch(`${BASE_URL}/api/events`, token);

  const showToast = (message, type = "success") => setToast({ message, type });

  const resetForm = () => {
    setEditingId(null);
    // ❌ REMOVED: location
    setEventForm({ title: "", description: "", type: "News", image: "" });
  };

  // 🧹 HELPER: Sanitizes data to remove system fields that cause API errors
  const sanitizePayload = (data) => {
    // Destructure to separate system fields from the rest
    const { _id, id, createdAt, updatedAt, __v, ...cleanData } = data;
    return cleanData;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (eventForm.title.length < 5)
      return showToast("Title must be at least 5 chars", "error");

    try {
      // ✅ SANITIZE: Remove _id and system fields before sending
      const cleanData = sanitizePayload(eventForm);

      if (editingId) {
        await axios.put(
          `${BASE_URL}/api/admin/events/${editingId}`,
          cleanData, // Send cleaned data
          {
            headers: { "auth-token": token },
          }
        );
        showToast("Event updated successfully");
      } else {
        await axios.post(
          `${BASE_URL}/api/admin/events`,
          { ...cleanData, date: new Date() }, // Send cleaned data + new date
          {
            headers: { "auth-token": token },
          }
        );
        showToast("Event created successfully");
      }
      resetForm();
      events.refresh();
    } catch (err) {
      console.error(err); // Log error for debugging
      showToast(err.response?.data?.message || "Error saving event", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/events/${deleteModal.id}`, {
        headers: { "auth-token": token },
      });
      showToast("Event deleted");
      events.refresh();
    } catch (err) {
      showToast("Delete failed", "error");
    }
    setDeleteModal({ show: false, id: null });
  };

  return (
    <div className="manager-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Event"
        message="Are you sure? This cannot be undone."
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
      />

      <EventsTab
        eventsList={events.data}
        canEdit={canEdit}
        editingId={editingId}
        eventForm={eventForm}
        setEventForm={setEventForm}
        handleEventSubmit={handleEventSubmit}
        startEditEvent={(evt) => {
          setEditingId(evt._id);
          // Ensure we copy the existing data into the form state
          setEventForm({
            ...evt,
            image: evt.image || "",
            // If the event object from DB has extra fields, they get copied here,
            // which is why sanitizePayload is crucial on submit.
          });
          window.scrollTo(0, 0);
        }}
        cancelEditEvent={resetForm}
        deleteEventClick={(id) => setDeleteModal({ show: true, id })}
      />
    </div>
  );
}

export default EventsManager;
