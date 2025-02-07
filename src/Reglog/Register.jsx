import styled from "styled-components";
import RegistrationForm from "./RegistrationForm";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/nav/Footer";

export default function Register() {
  return (
    <Regcont id="home">
      <RegNavBar>
        <Navbar />
      </RegNavBar>
      <Rg>
        <RegistrationForm />
      </Rg>
      {/* <Footer /> */}
    </Regcont>
  );
}

const Regcont = styled.div`
  width: 100%;
  height: 100vh;
`;

const RegNavBar = styled.div`
  width: 100%;
  height: 10%;
`;

const Rg = styled.div`
  width: 100%;
  height: 100%;
`;
