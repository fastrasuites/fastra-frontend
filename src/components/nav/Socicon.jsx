import styled from "styled-components";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

export default function Socicon() {
  return (
    <Soc>
      <Socap>
        <span>
          <a href="https://twitter.com/Realtor_OriGold" target="_blank">
            <FaTwitter className="icon" />
          </a>
          <a href="https://web.facebook.com/OrigoldMuhibudeen" target="_blank">
            <FaFacebook className="icon" />
          </a>
          <a
            href="https://www.linkedin.com/in/abdurrahman-muhibudeen-9a0328226/"
            target="_blank"
          >
            <FaLinkedin className="icon" />
          </a>
        </span>
      </Socap>
    </Soc>
  );
}

const Soc = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;
const Socap = styled.div`
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: D-DIN Condensed;
  // @media screen and (max-width: 890px){
  //   width: 50%;
  //   display: flex;
  //   align-items: center;
  // }

  span {
    width: 80%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    a {
      color: inherit;

      :hover {
        color: #fff;
      }
    }
    @media screen and (max-width: 890px) {
      width: 90%;
    }
  }

  .icon {
    height: 30px;
    width: 20px;
  }
`;
