import styled from "styled-components";
import Logo from "../../image/logo2.svg";
import { FaArrowRightLong } from "react-icons/fa6";

export default function Ft1() {
  return (
    <T1>
      <T1wrap>
        <Dgen>
          <D11>
            <img src={Logo} alt="Fastra Suite" className="log" />
            <ul>
              <li>+234 801 234 5679</li>
              <li>info@fastrasuite.com</li>
            </ul>
          </D11>
          <D12>
            <p className="qk">Quick Links</p>
            <D12a>
              <D12b>
                <a  className='fn' href="/prod">Product</a>
                <a  className='fn' href="/company">Company</a>
              </D12b>
              <D12b>
                <a  className='fn' href="/info">Information</a>
                <a  className='fn' href="/fastrasuites">FastraSuite</a>
              </D12b>
            </D12a>
          </D12>
        </Dgen>
        <D13>
          <p className="sub">Subscribe</p>
          <form action="#">
            <input
              className="in"
              type="text"
              placeholder="Get product update"
              name="EmailAddress"
            />
            <button className="btn">
              <FaArrowRightLong />
            </button>
          </form>
        </D13>
      </T1wrap>
    </T1>
  );
}

const T1 = styled.div`
  width: 100%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const T1wrap = styled.div`
  width: 98%;
  height: 90%;
  display: flex;
  align-items: center;
  @media screen and (max-width: 690px) {
    display: flex;
    width: 98%;
    height: 100%;
    align-items: center;
    flex-direction: column;
    @media screen and (max-width: 400px){
        width: 100%;
        height: 100%;
    }
`;
const Dgen = styled.div`
  width: 65%;
  height: 95%;
  display: flex;
  @media screen and (max-width: 690px) {
    display: flex;
    width: 100%;
    height: 60%;
    align-items: center;
  }
`;
const D11 = styled.div`
  width: 45%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .log {
    width: 121.83px;
    height: 40px;
    @media screen and (max-width: 700px) {
      width: 70%;
    }
  }
  ul {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 2rem;
    list-style: none;
    margin-bottom: 2rem;
    @media screen and (max-width: 316px) {
      font-size: 0.6rem;
    }
    @media screen and (max-width: 690px) {
      margin-bottom: 0;
    }
  }
`;
const D12 = styled.div`
  width: 65%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1rem;
  line-height: 4rem;
  .qk {
    font-size: 1rem;
    font-weight: 500;
  }
  @media screen and (max-width: 690px) {
    line-height: 3rem;
  }
  @media screen and (max-width: 430px) {
    line-height: 2rem;
    display: flex;
    align-items: end;
    text-align: right;
  }
`;
const D12a = styled.div`
  width: 65%;
  height: 70%;
  display: flex;
  justify-content: space-between;
  gap: 4rem;
  line-height: 3rem;
  @media screen and (max-width: 690px) {
    gap: 2rem;
    line-height: 2rem;
  }
  @media screen and (max-width: 430px) {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
`;
const D12b = styled.div`
    display: flex;
    flex-direction: column;
    
.fn{
    font-size: 0.8rem;
    opacity: 60%;
    text-decoration: none;
    color: #fff;
    
:link{
    text-decoration: none;
    opacity: 60%;
    color: #fff;
:visited{
    text-decoration: none;
    opacity: 60%;
    color: #fff;
:hover{
    text-decoration: none;
    opacity: 60%;
    color: #fff;
}
}
}
}
}
}
`;
const D13 = styled.div`
 width: 35%;
    height: 95%;
    display: flex;
    flex-direction: column;
    line-height: 5rem;
    @media screen and (max-width: 690px){
        display: flex;
        width: 100%;
        height: 40%;
        align-items: start;
        justify-content: start;
        line-height: 2rem;
        }
.sub{
    font-size: 1rem;
    font-weight: 500;
}
form{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25%;
    width: 100%;
    @media screen and (max-width: 690px){
        width: 60%;
        height: 60%;
    }
.in{
    height: 95%;
    width: 80%;
    border: none;
    border-radius: 5px;
    padding-left: 1rem;
    font-size: 0.8rem;
    font-weight: 400;
    border-radius: 8px 0px 0px 8px;
    @media screen and (max-width: 338px){
    font-size: 0.6rem;
    }
}
.btn{
    width: 20%;
    height: 95%;
    background: #3b7ced;
    border: none;
    border-radius: 0px 8px 8px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    @media screen and (max-width: 338px){
        font-size: 0.7rem;
    width: 25%;
        }
}
}
}
`;
