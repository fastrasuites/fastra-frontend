import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [userNameTouched, setUserNameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        const response = await axios.post(
          "https://fastrav1-production.up.railway.app/login/",
          {
            username: userName,
            password: password,
          }
        );
        // Handle success response
        console.log(response.data);
        // Redirect to dashboard
        history.push("/dashboard");
      } catch (error) {
        setError("Invalid credentials");
        console.error("Error logging in:", error);
      }
    }
  };

  const isUserNameValid = userName.trim() !== "";
  const isEmailValid = email.trim() !== "";
  const isPasswordValid = password.trim() !== "";
  const isFormValid = isEmailValid && isPasswordValid;

  return (
    <Lf>
      <Lfwrap>
        <Title>Login</Title>
        <Paragraph>Enter your log in details below</Paragraph>
        <Cont>
          <Inputcont>
            <StyledLabel htmlFor="username">Username</StyledLabel>
            <Input
              id="username"
              placeholder="Enter your username here"
              value={userName}
              onChange={handleUserNameChange}
              onBlur={() => setUserNameTouched(true)}
            />
            {userNameTouched && !isUserNameValid && (
              <ErrorText>Username is required</ErrorText>
            )}
          </Inputcont>
          <Inputcont>
            <StyledLabel htmlFor="email">Email</StyledLabel>
            <Input
              id="email"
              placeholder="Enter your email here"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && !isEmailValid && (
              <ErrorText>Email is required</ErrorText>
            )}
          </Inputcont>
          <Inputcont>
            <StyledLabel htmlFor="password">Password</StyledLabel>
            <PasswordContainer>
              <PasswordInput
                placeholder="Enter your password here"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
              />
              <Togbut onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Togbut>
            </PasswordContainer>
            {passwordTouched && !isPasswordValid && (
              <ErrorText>Password is required</ErrorText>
            )}
          </Inputcont>
          {error && <ErrorText>{error}</ErrorText>}
          {isFormValid ? (
            <Button onClick={handleSubmit}>Login</Button>
          ) : (
            <Button disabled>Login</Button>
          )}
          <Loglink>
            <p>
              <Link to="/">Don't have an account</Link>
            </p>
            <p>
              <Link to="/fogpas">Forget password</Link>
            </p>
          </Loglink>
        </Cont>
      </Lfwrap>
    </Lf>
  );
}

const Lf = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;
const Lfwrap = styled.div`
  width: 25%;
  height: 75%;
  position: relative;
  border-radius: 0.5rem;
  box-shadow: 16px 16px 64px 0px #1a1a1a29;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 1300px) and (min-width: 1050px) {
    width: 35%;
  }
  @media screen and (max-width: 1049px) and (min-width: 800px) {
    width: 40%;
  }
  @media screen and (max-width: 799px) and (min-width: 710px) {
    width: 50%;
  }
  @media screen and (max-width: 709px) and (min-width: 640px) {
    width: 50%;
  }
  @media screen and (max-width: 639px) and (min-width: 580px) {
    width: 50%;
  }
  @media screen and (max-width: 579px) and (min-width: 481px) {
    width: 60%;
  }
  @media screen and (max-width: 480px) and (min-width: 415px) {
    width: 70%;
  }
  @media screen and (max-width: 414px) and (min-width: 360px) {
    width: 80%;
  }
  @media screen and (max-width: 359px) and (min-width: 340px) {
    width: 90%;
  }
  @media screen and (max-width: 339px) and (min-width: 250px) {
    width: 95%;
  }
`;
const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  text-align: left;
  margin-left: -12.5rem;
`;
const Paragraph = styled.p`
  font-size: 14px;
  margin-left: -4.3rem;
  margin-bottom: 1rem;
  opacity: 60%;
`;
const Cont = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
`;
const Inputcont = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-left: 2.5rem;
  position: relative;
`;
const Input = styled.input`
  width: 80%;
  padding: 8px;
  border-radius: 0.5rem;
  border: 1px solid #aaaaaa;

  &:focus {
   
    outline: none;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 80%;
`;
const PasswordInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 0.5rem;
  border: 1px solid #aaaaaa;

  &:focus {
   
    outline: none;
  }
`;
const Togbut = styled.button`
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translateY(-50%);
  border: none;
  background-color: transparent;
  cursor: pointer;
  outline: none;
`;
const Button = styled.button`
  background: #3b7ced;
  color: #fff;
  padding: 12px 120px;
  width: 87%;
  border: none;
  border-radius: 0.5rem;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-left: 1rem;
  margin-top: 0.5rem;
  :link {
    color: #fff;
    text-decoration: none;
  }
  :visited {
    color: #fff;
    text-decoration: none;
  }
  :hover {
    color: #fff;
    text-decoration: none;
    background: #335db2;
  }
  :active {
    color: #fff;
    text-decoration: none;
    background: #335db2;
  }
`;
const Loglink = styled.div`
  display: flex;
  gap: 45px;
  font-size: 14px;
  color: #3b7ced;
  text-decoration: none;
  margin-top: -0.7rem;
  @media screen and (max-width: 913px) {
    margin-left: 2rem;
  }
  :link {
    color: #3b7ced;
    text-decoration: none;
  }
  :visited {
    color: #3b7ced;
    text-decoration: none;
  }
  :hover {
    color: #3b7ced;
    text-decoration: none;
  }
`;
const StyledLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;
const ErrorText = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`;
