import styled from "styled-components";
import LoginForm from "./LoginForm";
import Navbar from "../../components/nav/Navbar";

export default function Login() {
  return (
    <Logcont id="#login">
      <LoginNavBar>
        <Navbar />
      </LoginNavBar>
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

const Lg = styled.div`
  width: 100%;
  height: 90%;
`;

const LoginNavBar = styled.div`
  width: 100%;
  height: 10%;
`;
