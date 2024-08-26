import React from "react";
import "./accessRightTabContent.css";
import Select from "react-select";

const SubHeading = ({ text }) => {
  return (
    <>
      <h3 className="sub-heading">{text}</h3>
    </>
  );
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: "95%",
    height: "43px",
    flex: "1",
    // marginTop: "0.1rem",
    cursor: "pointer",
    outline: "none",
    border: "2px solid #e2e6e9",
    borderRadius: "4px",
    // padding: "5px",
    marginBottom: "0",
  }),
  menu: (provided) => ({
    ...provided,
    width: "95%",
  }),
  menuList: (provided) => ({
    ...provided,
    width: "95%",
  }),
  option: (provided) => ({
    ...provided,
    cursor: "pointer",
  }),
};
// export default function NewUser({ onClose, onSaveAndSubmit }) {
//   const [formState, setFormState] = useState({
//     name: "",
//     role: "",
//     mail: "",
//     number: "",
//     language: "",
//     timezone: "",
//     image: null,
//     inAppNotification: false,
//     emailNotification: false,
//   });
// }

const AccessRightTabContent = () => {
  return (
    <div
      style={{
        marginTop: "50px",
        marginBottom: "200px",
        display: "flex",
        flexDirection: "column",
        gap: "60px",
      }}
    >
      {/* Multi Company */}
      <section>
        <section style={{ marginBottom: "24px" }}>
          <SubHeading text="Multi Companies" />
        </section>

        <section
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="select-control">
            <label className="select-label">Allowed Companies</label>
            <Select
              className="select"
              styles={customStyles}
              placeholder="Select Company"
            />
          </div>
          <div className="select-control">
            <label className="select-label">Current Companies</label>
            <Select
              className="select"
              styles={customStyles}
              placeholder="Select Company"
            />
          </div>
        </section>
      </section>

      {/* Allowed Operating Unit */}
      <section>
        <section style={{ marginBottom: "24px" }}>
          <SubHeading text="Allowed Operating Units" />
        </section>

        <section
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="select-control">
            <label className="select-label">Default Operating Unit</label>
            <Select
              className="select"
              styles={customStyles}
              placeholder="Main Operating Unit"
            />
          </div>
          <div className="select-control">
            <label className="select-label">Operating Unit</label>
            <Select
              className="select"
              styles={customStyles}
              placeholder="Main Operating Unit"
            />
          </div>
        </section>
      </section>

      {/* Application */}
      <section>
        <section style={{ marginBottom: "24px" }}>
          <SubHeading text="Application" />
        </section>

        <section
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="select-control">
            <label className="select-label">Purchase Request Approval</label>
            <Select className="select" styles={customStyles} placeholder="" />
          </div>
          <div className="select-control">
            <label className="select-label">Inventory</label>
            <Select className="select" styles={customStyles} placeholder="" />
          </div>
          <div className="select-control">
            <label className="select-label">Sales</label>
            <Select className="select" styles={customStyles} placeholder="" />
          </div>
          <div className="select-control">
            <label className="select-label">Human Resources</label>
            <Select className="select" styles={customStyles} placeholder="" />
          </div>
          <div className="select-control">
            <label className="select-label">Accounting</label>
            <Select className="select" styles={customStyles} placeholder="" />
          </div>
        </section>
      </section>

      {/* Purchase */}
      <section className>
        <section style={{ marginBottom: "24px" }}>
          <SubHeading text="Purchase" />
        </section>
        <section
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="checkbox-control">
            <label htmlFor="purchase-request" className="checkbox-label">
              Receive “Approved Purchase Request” Email Notification
            </label>
            <input
              type="checkbox"
              name="approve-purchase-request"
              id="purchase-request"
              className="input-checkbox"
            />
          </div>
          <div className="checkbox-control">
            <label htmlFor="purchase-order" className="checkbox-label">
              Receive “Approved Purchase Order” Email Notification
            </label>
            <input
              type="checkbox"
              name="approve-purchase-request"
              id="purchase-order"
              className="input-checkbox"
            />
          </div>
          <div className="checkbox-control">
            <label htmlFor="send-rfq" className="checkbox-label">
              Send RFQ
            </label>
            <input
              type="checkbox"
              name="send-rfq"
              id="send-rfq"
              className="input-checkbox"
            />
          </div>

          <div className="checkbox-control">
            <label htmlFor="vendor" className="checkbox-label">
              Create and Edit Vendor Information
            </label>
            <input
              type="checkbox"
              name="create-edit-Vendor-info"
              id="vendor"
              className="input-checkbox"
            />
          </div>
          <div className="checkbox-control">
            <label htmlFor="delete-rfq" className="checkbox-label">
              Delete RFQ
            </label>
            <input
              type="checkbox"
              name="delete-rfq"
              id="delete-rfq"
              className="input-checkbox"
            />
          </div>
          <div className="checkbox-control">
            <label htmlFor="delete-po" className="checkbox-label">
              Delete PO
            </label>
            <input
              type="checkbox"
              name="delete-po"
              id="delete-po"
              className="input-checkbox"
            />
          </div>
        </section>
      </section>
    </div>
  );
};

export default AccessRightTabContent;
