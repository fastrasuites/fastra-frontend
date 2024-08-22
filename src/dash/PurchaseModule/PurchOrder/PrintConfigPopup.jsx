import React, { useState } from "react";

import "./printConfigPopup.css";
import { useRef } from "react";
import Receipt3 from "./Receipt3";

const PrintConfigPopup = ({
  onClose,
  setShowPrintConfig,
  setLightFont,
  setDarkFont,
  setBoxedBorder,
  setStrippedBorder,
  lightFont,
  darkFont,
  boxedBorder,
  strippedBorder,
  closeModal,
  onInvoiceNumberColorChange,
  invoiceNumberTextColor,
  onInvoiceTableHeadColorChange,
  invoiceTableHeadTextColor,
}) => {
  const printPreviewRef = useRef();

  // Handler for invoice Number color input change
  const handleInvoiceNumberColorChange = (event) => {
    onInvoiceNumberColorChange(event.target.value);
  };

  const handleInvoiceTableHeadColorChange = (event) => {
    onInvoiceTableHeadColorChange(event.target.value);
  };

  const handlePrint = () => {
    // Logic to apply configuration to print style and trigger print
    // printPreviewRef.current.print();
    window.print();
  };

  return (
    // <div className="modal-container">
    <div className="popup">
      <div className="popup-content">
        <header className="popup-heading">
          <h3>Configure your document layout</h3>
          <svg
            onClick={closeModal}
            role="button"
            className="closeIcon"
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 1L1 15M1 1L15 15"
              stroke="#7A8A98"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </header>
        <hr style={{ border: "1px solid #7A8A98" }} />
        <div className="form-and-preview">
          <form className="popup-form">
            <div className="form-field">
              <p className="field-desc">Layout</p>
              <fieldset>
                <div>
                  <input
                    type="radio"
                    name="font"
                    onChange={() => {
                      setLightFont(true);
                      setDarkFont(false);
                    }}
                    id="light"
                  />
                  <label htmlFor="light" className="input-label">
                    Light
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="border"
                    onChange={() => {
                      setBoxedBorder(true);
                      setStrippedBorder(false);
                    }}
                    id="boxed"
                  />
                  <label htmlFor="boxed" className="input-label">
                    Boxed
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="font"
                    onChange={() => {
                      setLightFont(false);
                      setDarkFont(true);
                    }}
                    id="bold"
                  />
                  <label htmlFor="bold" className="input-label">
                    Bold
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="border"
                    onChange={() => {
                      setBoxedBorder(false);
                      setStrippedBorder(true);
                    }}
                    id="striped"
                  />
                  <label htmlFor="striped" className="input-label">
                    Striped
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="form-field">
              <p className="field-desc">Font</p>
              <p className="input-label">Product Sans</p>
            </div>

            {/* input color controller */}
            <div className="form-field">
              <p className="field-desc">Colors</p>
              <fieldset>
                <input
                  type="color"
                  name=""
                  id=""
                  className=""
                  value={invoiceNumberTextColor}
                  onChange={handleInvoiceNumberColorChange}
                />
                <input
                  type="color"
                  name=""
                  id=""
                  className=""
                  value={invoiceTableHeadTextColor}
                  onChange={handleInvoiceTableHeadColorChange}
                />
              </fieldset>
            </div>

            <div className="form-field">
              <p className="field-desc">Layout Background</p>
              <p className="input-label">Blank</p>
            </div>

            <div className="form-field">
              <p className="field-desc">Company Details</p>
              <p className="input-label">
                Demo Company No 8, Adelabu street, Surulere Lagos state 100001
                Nigeria
              </p>
            </div>

            <div className="form-field">
              <p className="field-desc">Footer</p>
              <p className="input-label">
                +234 12 211 11234 infor@yourcompany.com http://www.example.com
              </p>
            </div>
          </form>

          {/* Render a preview of the printable content here */}
          <div className="preview-section">
            <div className="print-preview" ref={printPreviewRef}>
              {/* Content to preview */}
              <Receipt3
                lightFont={lightFont}
                darkFont={darkFont}
                boxedBorder={boxedBorder}
                strippedBorder={strippedBorder}
                invoiceNumberTextColor={invoiceNumberTextColor}
                invoiceTableHeadTextColor={invoiceTableHeadTextColor}
              />
            </div>
          </div>
        </div>

        <div className="popup-actions">
          <button
            // onClick={handlePrint}
            style={{
              backgroundColor: "#0671E0",
              border: "solid #0671E0 1px",
              color: "white",
            }}
            className="ft-btn"
          >
            Print
          </button>
          <button
            onClick={closeModal}
            className="ft-btn"
            style={{
              backgroundColor: "white",
              border: "solid #89939E 1px",
              color: "#89939E",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default PrintConfigPopup;
