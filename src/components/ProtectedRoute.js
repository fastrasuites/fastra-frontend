// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Redirect } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);
  console.log("Access Token in ProtectedRoute:", accessToken);
  return accessToken ? children : <Redirect to="/login" />;
};

export default ProtectedRoute;

// // src/components/ProtectedRoute.js
// import React, { useContext } from 'react';
// import { Route, Redirect } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';

// const ProtectedRoute = ({ component: Component, ...rest }) => {
//     const { accessToken } = useContext(AuthContext);

//     return (
//         <Route
//             {...rest}
//             render={(props) =>
//                 accessToken ? (
//                     <Component {...props} />
//                 ) : (
//                     <Redirect to="/login" />
//                 )
//             }
//         />
//     );
// };

// export default ProtectedRoute;
