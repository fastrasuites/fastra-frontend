import styled from "styled-components";
import Ft1 from "./Ft1";
import Ft2 from "./Ft2";

export default function Footer() {
  return (
    <Ft>
      <Ftwrap>
        <Ft1 />
        <Ft2 />
      </Ftwrap>
    </Ft>
  );
}

const Ft = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #09285d 0%, #020a17 100%);
  // position: fixed;
  color: #fff;
`;
const Ftwrap = styled.div`
  width: 85%;
  height: 85%;
  margin-top: -1rem;
`;
