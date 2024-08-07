import React, { useState } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

export default function Edit({ onClose, initialData, onSave }) {
  const [formData, setFormData] = useState(initialData);

  const handleEdit = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="nvr">
      <div className="nvr1" style={{position: 'absolute', top: '0'}}>
        <div className="nvr2">
          <div className="p3a">
            <button className="p3abtn" onClick={onClose}>
              New Vendor Category
            </button>
          </div>
          <div className="p3b">
            <p className="p3bpage">1-2 of 2</p>
            <div className="p3bnav">
              <FaCaretLeft className="lr" />
              <div className="stroke"></div>
              <FaCaretRight className="lr" />
            </div>
          </div>
        </div>
        <div className="nvr3">
          <form
            className="nvrform"
            onSubmit={handleEditSubmit}
            style={{ height: "auto" }}
          >
            <div className="nvr3a">
              <p style={{ fontSize: "20px", marginBottom: "0" }}>
                Basic Information
              </p>
              <div>
                <button
                  type="button"
                  className="nvr3but"
                  onClick={onClose}
                  style={{ marginRight: "0.5rem" }}
                >
                  Cancel
                </button>
                <button type="submit" className="nvr3btn">
                  Save
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                htmlFor="category"
                style={{ display: "block", marginTop: "55px" }}
              >
                Category:
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => handleEdit("category", e.target.value)}
                style={{
                  border: "none",
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <label htmlFor="description" style={{ display: "block" }}>
                Description:
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleEdit("description", e.target.value)}
                style={{
                  border: "none",
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
