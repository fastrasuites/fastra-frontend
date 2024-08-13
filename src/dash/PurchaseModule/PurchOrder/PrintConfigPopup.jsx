import React, { useState } from "react";

import "./printConfigPopup.css";

const PrintConfigPopup = ({ onClose, setShowPrintConfig }) => {
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [margins, setMargins] = useState({
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  });

  const handlePrint = () => {
    // Logic to apply configuration to print style and trigger print
    window.print();
  };
  const handleClosePopup = () => {
    setShowPrintConfig(false);
  };
  return (
    // <div className="modal-container">
    <div className="popup">
      <div className="popup-content">
        <header className="popup-heading">
          <h3>Configure your document layout</h3>
          <svg
            onClick={handleClosePopup}
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
                  <input type="radio" name="layout" id="light" checked />
                  <label htmlFor="light" className="input-label">
                    Light
                  </label>
                </div>
                <div>
                  <input type="radio" name="layout" id="boxed" />
                  <label htmlFor="boxed" className="input-label">
                    Boxed
                  </label>
                </div>
                <div>
                  <input type="radio" name="layout" id="bold" />
                  <label htmlFor="bold" className="input-label">
                    Bold
                  </label>
                </div>
                <div>
                  <input type="radio" name="layout" id="striped" />
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

            <div className="form-field">
              <p className="field-desc">Colors</p>
              <fieldset>
                <span className="grey circle"></span>
                <span className="black circle"></span>
              </fieldset>
            </div>

            <div className="form-field">
              <p className="field-desc">Layout Background</p>
              <p className="input-label">Blank</p>
            </div>

            <div className="form-field">
              <p className="field-desc">Company Tagline</p>
              <div>
                <input
                  type="search"
                  name="layout"
                  style={{
                    outline: "none",
                    border: "none",
                    marginBottom: "20px",
                  }}
                  placeholder="Type '/' to get commands"
                />
                <div style={{ borderBottom: "1px solid" }}></div>
              </div>
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

            <br />
            {/*             
            <label>
              Paper Size:
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </label>
            <label>
              Orientation:
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label>
              Margins (mm):
              <input
                type="number"
                value={margins.top}
                onChange={(e) =>
                  setMargins({ ...margins, top: e.target.value })
                }
                placeholder="Top"
              />
              <input
                type="number"
                value={margins.bottom}
                onChange={(e) =>
                  setMargins({ ...margins, bottom: e.target.value })
                }
                placeholder="Bottom"
              />
              <input
                type="number"
                value={margins.left}
                onChange={(e) =>
                  setMargins({ ...margins, left: e.target.value })
                }
                placeholder="Left"
              />
              <input
                type="number"
                value={margins.right}
                onChange={(e) =>
                  setMargins({ ...margins, right: e.target.value })
                }
                placeholder="Right"
              />
            </label> */}
          </form>

          <div className="preview-section">
            {/* Render a preview of the printable content here */}
            <h4>Print Preview</h4>
            <div className="print-preview">{/* Content to preview */}</div>
          </div>
        </div>

        <div className="popup-actions">
          <button onClick={handlePrint}>Print</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default PrintConfigPopup;
