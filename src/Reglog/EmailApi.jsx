export const verifyEmail = async (tenantName, token) => {
  try {
    const response = await fetch(
      `https://${tenantName}.fastrasuite.com/api/email-verify/?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error); // Handle errors from response
    }

    const data = await response.json();
    return data; // Successful verification response
  } catch (error) {
    throw new Error(error.message);
  }
};

export const resendVerificationEmail = async (tenantName, token) => {
  try {
    const response = await fetch(
      `https://${tenantName}.fastrasuite.com/api/resend-verification-email/${token}/`,
      {
        method: "GET", // Assuming it's a GET request
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error); // Handle errors from response
    }

    const data = await response.json();
    return data; // Successful resend response
  } catch (error) {
    throw new Error(error.message);
  }
};
