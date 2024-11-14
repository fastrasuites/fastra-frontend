import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../image/logo.svg";
import { IoIosArrowDown } from "react-icons/io";
import "./Navbar.css"; 

export default function Navbar() {
  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick((prevClick) => !prevClick);
  };

  const handleLinkClick = () => {
    setClick(false);
  };

  return (
    <div className="reg-navbar">
      <div className={`reg-navbar-wrap ${click ? "active" : ""}`}>
        <img src={Logo} alt="Fastra Suite" className="reg-logo" />
        <div className="reg-mobile-icon" onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>
        <div className={`reg-nav-links ${click ? "active" : ""}`}>
          <div className="reg-nav-items">
            <a href="/" className="reg-nav-link" onClick={handleLinkClick}>
              Home
            </a>
            <div className="reg-dropdown">
              <p className="reg-dropdown-toggle">
                Products
                <IoIosArrowDown className="reg-dropdown-icon" />
              </p>
              <div className="reg-dropdown-menu">
                <a href="/product" onClick={handleLinkClick}>
                  Product
                </a>
                <a href="/procat" onClick={handleLinkClick}>
                  Categories
                </a>
              </div>
            </div>
            <a href="/help" className="reg-nav-link" onClick={handleLinkClick}>
              Help
            </a>
          </div>
          <a href="/reach" className="reg-contact-button" onClick={handleLinkClick}>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
