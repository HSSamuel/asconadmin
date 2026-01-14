import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./StatCard.css";
import Toast from "../Toast";
import ConfirmModal from "../ConfirmModal";

function FacilitiesTab() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ UI STATE
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
  });

  const [rates, setRates] = useState([{ type: "", naira: "", dollar: "" }]);

  const API_URL =
    process.env.REACT_APP_API_URL || "https://ascon-connect-api.onrender.com";
  const token = localStorage.getItem("auth_token");

  // ✅ FIX 1: Wrap function in useCallback to satisfy useEffect dependency warning
  const fetchFacilities = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/facilities`);
      setFacilities(res.data.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching facilities:", err);
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]); // ✅ Dependency added

  // Helper to show toasts
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRateChange = (index, e) => {
    const newRates = [...rates];
    newRates[index][e.target.name] = e.target.value;
    setRates(newRates);
  };

  const addRateRow = () => {
    setRates([...rates, { type: "", naira: "", dollar: "" }]);
  };

  const removeRateRow = (index) => {
    const newRates = rates.filter((_, i) => i !== index);
    setRates(newRates);
  };

  const handleEdit = (facility) => {
    setEditingId(facility._id);
    setFormData({
      name: facility.name,
      image: facility.image,
      description: facility.description || "",
    });
    setRates(facility.rates);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Trigger Delete Modal
  const confirmDelete = (id) => {
    setDeleteModal({ show: true, id });
  };

  // ✅ Actual Delete Logic
  const handleDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ show: false, id: null });

    try {
      await axios.delete(`${API_URL}/api/facilities/${id}`, {
        headers: { "auth-token": token },
      });
      showToast("Facility Deleted Successfully!", "success");
      fetchFacilities();
    } catch (err) {
      showToast("Failed to delete facility", "error");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", image: "", description: "" });
    setRates([{ type: "", naira: "", dollar: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      showToast("Name and Image are required!", "error");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/facilities/${editingId}`,
          { ...formData, rates },
          { headers: { "auth-token": token } }
        );
        showToast("Facility Updated Successfully!", "success");
      } else {
        await axios.post(
          `${API_URL}/api/facilities`,
          { ...formData, rates },
          { headers: { "auth-token": token } }
        );
        showToast("Facility Added Successfully!", "success");
      }

      resetForm();
      fetchFacilities();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  return (
    <div className="tab-content">
      {/* ✅ FIX 2: Render the components to fix 'defined but never used' warning */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Facility"
        message="Are you sure you want to remove this facility? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, id: null })}
      />

      <div
        className="tab-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Facility Rentals</h2>
        <button
          className="btn-primary"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          style={{
            padding: "10px 20px",
            background: showForm ? "#666" : "#1B5E3A",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add New Facility"}
        </button>
      </div>

      {showForm && (
        <div
          className="form-container"
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3>{editingId ? "Edit Facility" : "Add New Facility"}</h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Facility Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleInputChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <h4 style={{ marginTop: "15px", marginBottom: "5px" }}>
              Rental Rates
            </h4>
            {rates.map((rate, index) => (
              <div
                key={index}
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                <input
                  placeholder="Type (e.g. Daily)"
                  name="type"
                  value={rate.type}
                  onChange={(e) => handleRateChange(index, e)}
                  style={{ flex: 2, padding: "8px" }}
                />
                <input
                  placeholder="₦ Amount"
                  name="naira"
                  value={rate.naira}
                  onChange={(e) => handleRateChange(index, e)}
                  style={{ flex: 1, padding: "8px" }}
                />
                <input
                  placeholder="$ Amount"
                  name="dollar"
                  value={rate.dollar}
                  onChange={(e) => handleRateChange(index, e)}
                  style={{ flex: 1, padding: "8px" }}
                />
                {rates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRateRow(index)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "0 10px",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRateRow}
              style={{
                fontSize: "12px",
                marginBottom: "15px",
                cursor: "pointer",
              }}
            >
              + Add Another Rate
            </button>

            <br />
            <button
              type="submit"
              style={{
                background: "#1B5E3A",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {editingId ? "Update Facility" : "Save Facility"}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table
          className="data-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#eee", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Image</th>
              <th style={{ padding: "10px" }}>Facility Name</th>
              <th style={{ padding: "10px" }}>Rates Summary</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((fac) => (
              <tr key={fac._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>
                  <img
                    src={fac.image}
                    alt="fac"
                    style={{
                      width: "60px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: "10px", fontWeight: "bold" }}>
                  {fac.name}
                </td>
                <td style={{ padding: "10px" }}>
                  {fac.rates.map((r, i) => (
                    <div key={i} style={{ fontSize: "12px" }}>
                      {r.type}: <b>₦{r.naira}</b> / ${r.dollar}
                    </div>
                  ))}
                </td>
                <td style={{ padding: "10px", textAlign: "right" }}>
                  <button
                    onClick={() => handleEdit(fac)}
                    style={{
                      marginRight: "10px",
                      background: "none",
                      border: "1px solid #007bff",
                      color: "#007bff",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(fac._id)}
                    style={{
                      background: "none",
                      border: "1px solid #dc3545",
                      color: "#dc3545",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FacilitiesTab;
