// import React, { useEffect, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { verifyEmail, resendVerificationEmail } from "../Reglog/EmailApi";

// const EmailVerification = ({ tenantName }) => {
//   const [status, setStatus] = useState("Verifying...");
//   const [expired, setExpired] = useState(false);
//   const location = useLocation();
//   const history = useHistory();

//   useEffect(() => {
//     const verifyToken = async () => {
//       const params = new URLSearchParams(location.search);
//       const token = params.get("token");

//       if (token) {
//         try {
//           await verifyEmail(tenantName, token);
//           setStatus("Email verified successfully. You can now log in.");
//           setTimeout(() => history.push("/login"), 3000);
//         } catch (error) {
//           if (error.message === "Token expired") {
//             setStatus("Token expired. Click below to resend the verification email.");
//             setExpired(true);
//           } else {
//             setStatus("Email verification failed. Please try again or contact support.");
//           }
//         }
//       } else {
//         setStatus("Invalid verification link.");
//       }
//     };

//     verifyToken();
//   }, [location, history, tenantName]);

//   const handleResendEmail = async () => {
//     const params = new URLSearchParams(location.search);
//     const token = params.get("token");

//     try {
//       await resendVerificationEmail(tenantName, token);
//       setStatus("A new verification email has been sent.");
//       setExpired(false);
//     } catch (error) {
//       setStatus("Failed to resend verification email. Please try again later.");
//     }
//   };

//   return (
//     <div>
//       <h2>Email Verification</h2>
//       <p>{status}</p>
//       {expired && (
//         <button onClick={handleResendEmail}>
//           Resend Verification Email
//         </button>
//       )}
//     </div>
//   );
// };

// export default EmailVerification;
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const EmailVerifyStatus = ( { tenantName }) => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const status = queryParams.get('status');
    const token = queryParams.get('token');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (status) {
            if (status === 'expired') {
                setMessage('Your verification link has expired. Please request a new one.');
            }
            else {
                setMessage(status);
            }
        }
    }, [status]);

    const resendVerification = async () => {
      
        try {
            const response = await fetch(`https://${tenantName}.api.fastrasuite.com/resend-verification-email?token=${token}`);
            const data = await response.json();
            alert(data.detail || 'Verification email has been sent.');
          
        } catch (error) {
            console.error('Error resending email:', error);
            alert('An error occurred while resending the verification email.');
        }
    };

    return (
        <div>
            <h1>Email Verification</h1>
            <p>{message}</p>
            {status === 'expired' && token && (
                <button onClick={resendVerification}>Resend Verification Email</button>
            )}
        </div>
    );
};

export default EmailVerifyStatus;
