import styled from "styled-components";
import Navbar from "../components/nav/Navbar";
import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <Logcont id="#login">
      <Ln>
        <Navbar />
      </Ln>
      <Lg>
        <LoginForm />
      </Lg>
      
    </Logcont>
  );
}

const Logcont = styled.div`
  width: 100%;
  height: 100vh;
`;
const Ln = styled.div`
  width: 100%;
  height: 10%;
`;
const Lg = styled.div`
  width: 100%;
  height: 90%;
`;

