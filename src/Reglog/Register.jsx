import styled from "styled-components";
import Navbar from "../components/nav/Navbar";
import RegForm from "./RegForm";
import Footer from "../components/nav/Footer";

export default function Register() {
  return (
    <Regcont id="home">
      <Rn>
        <Navbar />
      </Rn>
      <Rg>
        <RegForm />
      </Rg>
      <Rf>
        <Footer />
      </Rf>
    </Regcont>
  );
}

const Regcont = styled.div`
  width: 100%;
  height: 100vh;
`;
const Rn = styled.div`
  width: 100%;
  height: 10%;
`;
const Rg = styled.div`
  width: 100%;
  height: 90%;
`;
const Rf = styled.div`
  width: 100%;
  height: 50vh;
`;
