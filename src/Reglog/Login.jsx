import styled from "styled-components";
import Navbar from "../components/nav/Navbar";
import LoginForm from "./LoginForm";
import Footer from "../components/nav/Footer";

export default function Login() {
  return (
    <Logcont id="#login">
      <Ln>
        <Navbar />
      </Ln>
      <Lg>
        <LoginForm />
      </Lg>
      <Lf>
        <Footer />
      </Lf>
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
const Lf = styled.div`
  width: 100%;
  height: 50vh;
`;
