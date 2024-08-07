import styled from "styled-components";
import Socicon from "./Socicon";

export default function Ft2() {
  return (
    <T2>
      <T2wrap>
        <div className="d21"></div>
        <div className="cd2">
          <div className="d22">
            <Socicon />
          </div>
          <p className="d23">&#169; Fastra Suites. All rights reserved</p>
        </div>
      </T2wrap>
    </T2>
  );
}

const T2 = styled.div`
  width: 100%;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const T2wrap = styled.div`
  width: 100%;
  height: 95%;

  .d21 {
    width: 100%;
    border: 1px solid #3b7ced;
  }
  .cd2 {
    width: 100%;
    height: 80%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-top: 0.8rem;
    @media screen and (max-width: 429px) and (min-width: 322px) {
      font-size: 0.6rem;
    }
    @media screen and (max-width: 321px) and (min-width: 280px) {
      font-size: 0.5rem;
    }
  }
  .d22 {
    width: 13%;
    height: 90%;
  }
`;
