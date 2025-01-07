import styled from "styled-components";
// import Navbar from "../components/nav/Navbar";
import RegistrationForm from "./RegistrationForm";

export default function Register() {
  return (
    <Regcont id="home">
      {/* <Rn>
        <Navbar />
      </Rn> */}
      <Rg>
        <RegistrationForm />
      </Rg>
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
  height: 100%;
`;
