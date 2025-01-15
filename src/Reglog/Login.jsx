import styled from "styled-components";
import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <Logcont id="#login">
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
  height: 100%;
`;
