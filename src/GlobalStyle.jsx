import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
* { padding: 0; margin: 0; box-sizing: border-box; font-family: "PT Sans", sans-serif !important; }
  body {
    background-image: url('./assets/background.png');
    background-color: #f7f7f7;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin: 0;
    width: 100%;
    height: 100vh;
    font-family: "PT Sans", sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobalStyle;
