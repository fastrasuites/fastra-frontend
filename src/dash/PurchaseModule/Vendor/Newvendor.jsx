import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./Newvendor.css";

export default function Newvendor({ onClose, onSaveAndSubmit }) {
  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "PR00001";

    if (lastID) {
      const idNumber = parseInt(lastID.slice(2), 10) + 1;
      newID = "PR" + idNumber.toString().padStart(5, "0");
    }

    localStorage.setItem("lastGeneratedID", newID);
    return newID;
  };

  const [formState, setFormState] = useState({
    id: generateNewID(),
    vendorName: "",
    vendorCategory: "",
    email: "",
    phone: "",
    address: "",
    image: "",
    requester: "Firstname Lastname",
    department: "Sales",
    status: "Pending",
    date: new Date(),
  });

  const [showForm] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFormState((prevState) => ({
        ...prevState,
        date: new Date(),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataWithStringDate = {
      ...formState,
      date: formState.date.toString(),
    };

    // Save the vendor details to local storage
    const savedVendors = JSON.parse(localStorage.getItem("vendors")) || [];
    savedVendors.push(formDataWithStringDate);
    localStorage.setItem("vendors", JSON.stringify(savedVendors));

    onSaveAndSubmit(formDataWithStringDate);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="nvr" className={`nvr ${showForm ? "fade-in" : "fade-out"}`}>
      <div className="nvr1">
        <div className="nvr2">
          <div className="nvr2a">
            <p className="nvrhed">New Vendor</p>
            <div className="nvrauto">
              <p>Autosaved</p>
              <img src={autosave} alt="Autosaved" />
            </div>
          </div>
          <div className="nvr2b">
            <div className="nvrbnav">
              <FaCaretLeft className="nr" />
              <div className="sep"></div>
              <FaCaretRight className="nr" />
            </div>
          </div>
        </div>
        <div className="nvr3">
          <form className="nvrform" onSubmit={handleSubmit}>
            <div className="nvr3a">
              <p style={{ fontSize: "20px" }}>Basic Information</p>
              <button
                type="button"
                className="nvr3but"
                onClick={onClose}
                style={{ marginTop: "1rem" }}
              >
                Cancel
              </button>
            </div>

            <div className="nvr3c">
              <div className="nvr3ca">
                <label>Vendor Name</label>
                <input
                  type="text"
                  name="vendorName"
                  placeholder="Cee Que Enterprise"
                  className="nvr3cb"
                  value={formState.vendorName}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      vendorName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="nvr3ca">
                <label>Vendor Category</label>
                <input
                  type="text"
                  name="vendorCategory"
                  placeholder="IT Hardware Sales"
                  className="nvr3cb"
                  value={formState.vendorCategory}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      vendorCategory: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="nvr3ca">
                <label>Image</label>
                <input
                  type="file"
                  name="image"
                  className="nvr3cb"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="nvr3a">
              <p style={{ fontSize: "20px" }}>Contact Information</p>
            </div>
            <div className="nvr3c">
              <div className="nvr3ca">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Vendor Email"
                  className="nvr3cb"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="nvr3ca">
                <label>Phone number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter a valid phone number"
                  className="nvr3cb"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="nvr3ca">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter Address"
                  className="nvr3cb"
                  value={formState.address}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="nvr3e">
              <button
                type="submit"
                className="nvr3btn"
                style={{ display: "flex", justifyContent: "center" }}
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}