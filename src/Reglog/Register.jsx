import styled from "styled-components";
import RegistrationForm from "./RegistrationForm";

export default function Register() {
  return (
    <Regcont id="home">
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

const Rg = styled.div`
  width: 100%;
  height: 100%;
`;
