import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../../image/autosave.svg";

export default function Newpc({ onClose, onSaveAndSubmit }) {
  const generateNewID = () => {
    const lastID = localStorage.getItem("lastGeneratedID");
    let newID = "PR00001";

    if (lastID) {
      const idNumber = parseInt(lastID.slice(2), 10) + 1;
      newID = "PR" + (idNumber + 1).toString().padStart(5, "0");
    }

    localStorage.setItem("lastGeneratedID", newID);
    return newID;
  };

  const [formState, setFormState] = useState({
    id: generateNewID(),
    category: "",
    description: "",
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
      date: formState.date.toString(), // Convert date to string
    };

    onSaveAndSubmit(formDataWithStringDate);
    onClose();
  };

  return (
    <div id="nvr" className={`nvr ${showForm ? "fade-in" : "fade-out"}`}>
      <div className="nvr1">
        <div className="nvr2">
          <div className="nvr2a">
            <p className="nvrhed">New Vendor Category</p>
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
                <label>Category Name</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Enter the category"
                  className="nvr3cb"
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="nvr3ca">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter Description"
                  className="nvr3cb"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
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
                Create Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
