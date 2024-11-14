import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../image/logo.svg";
import { IoIosArrowDown } from "react-icons/io";
import "./Navbar.css"; // Import the CSS file

export default function Navbar() {
  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick((prevClick) => !prevClick);
  };

  const handleLinkClick = () => {
    setClick(false);
  };

  return (
    <div className="navbar">
      <div className={`navbar-wrap ${click ? "active" : ""}`}>
        <img src={Logo} alt="Fastra Suite" className="logo" />
        <div className="mobile-icon" onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>
        <div className={`nav-links ${click ? "active" : ""}`}>
          <div className="nav-items">
            <a href="/" className="nav-link" onClick={handleLinkClick}>
              Home
            </a>
            <div className="dropdown">
              <p className="dropdown-toggle">
                Products
                <IoIosArrowDown className="dropdown-icon" />
              </p>
              <div className="dropdown-menu">
                <a href="/product" onClick={handleLinkClick}>
                  Product
                </a>
                <a href="/procat" onClick={handleLinkClick}>
                  Categories
                </a>
              </div>
            </div>
            <a href="/help" className="nav-link" onClick={handleLinkClick}>
              Help
            </a>
          </div>
          <a href="/reach" className="contact-button" onClick={handleLinkClick}>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
