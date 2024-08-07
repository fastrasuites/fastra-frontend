import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import styled from "styled-components";
import Logo from "../../image/logo.svg";
import { IoIosArrowDown } from "react-icons/io";

export default function Navbar() {
  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick((prevClick) => !prevClick);
  };

  const handleLinkClick = () => {
    setClick(false);
  };

  return (
    <Nb>
      <Nbwrap click={click}>
        <img src={Logo} alt="Fastra Suite" className="log" />
        <MobileIcon onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </MobileIcon>
        <div className="lst" click={click}>
          <div className="lst2">
            <a href="/" className="mdnav" onClick={handleLinkClick}>
              Home
            </a>
            <div className="prodrop">
              <p className="p2">
                Products
                <IoIosArrowDown className="ardan" />
              </p>
              <div className="prolst">
                <a href="/prod" onClick={handleLinkClick}>
                  Product
                </a>
                <a href="/procat" onClick={handleLinkClick}>
                  Categories
                </a>
              </div>
            </div>
            <a href="/help" className="mdnav" onClick={handleLinkClick}>
              Help
            </a>
          </div>
          <a href="/reach" className="but" onClick={handleLinkClick}>
            Contact Us
          </a>
        </div>
      </Nbwrap>
    </Nb>
  );
}

const Nb = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Nbwrap = styled.div`
  width: 85%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Circular Std Book;

  .log {
    width: 121.83px;
    height: 40px;
  }

  .lst {
    width: 65%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media screen and (max-width: 600px) {
      display: ${({ click }) => (click ? "flex" : "none")};
      position: absolute;
      top: 60px;
      height: 10%;
      width: 90%;
      right: 0;
      animation: ${({ click }) =>
        click ? "slideIn 2s forwards" : "slideOut 2s forwards"};
      z-index: 1;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;

      @media (max-width: 359px) {
        font-size: 0.8rem;
        width: 90%;
      }
    }
  }
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  .lst2 {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-left: -1rem;
  }

  .mdnav {
    color: #000000;
    text-decoration: none;
  }

  .mdnav:link {
    color: #000000;
    text-decoration: none;
  }

  .mdnav:visited {
    color: #000000;
    text-decoration: none;
  }

  .mdnav:hover {
    color: #3b7ced;
    text-decoration: none;
  }

  .prodrop {
    gap: 5px;
    padding: 0;
    position: relative;
    display: inline-block;
  }

  .p2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 10px;
  }

  .prolst {
    display: none;
    position: absolute;
    min-width: 80px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 999;
  }

  .prolst a {
    color: grey;
    padding: 8px 14px;
    text-decoration: none;
    display: block;
    text-align: left;
    z-index: 999;
  }

  .prolst a:hover {
    color: #3b7ced;
  }

  .prodrop:hover .prolst {
    display: block;
  }

  .prodrop:hover .p2 {
    color: #3b7ced;
  }

  .but {
    padding: 10px;
    color: #3b7ced;
    border: 2px solid #3b7ced;
    border-radius: 5px;
    text-decoration: none;
  }
`;

const MobileIcon = styled.div`
  display: none;
  @media screen and (max-width: 600px) {
    display: block;
    position: absolute;
    right: 30px;
    color: #3b7ced;
  }
`;
