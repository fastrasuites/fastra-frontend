const BASE_DOMAIN = "fastrasuiteapi.com.ng";
export const verifyEmail = async (tenant, token) => {
  try {
    const response = await fetch(
      `https://${tenant}.${BASE_DOMAIN}/company/email-verify?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("checking errorData from EmailApi ", errorData);
      throw new Error(errorData.error); // Handle errors from response
    }

    const data = await response.json();
    console.log("checking data content from emailApi: ", data);
    return data; // Successful verification response
  } catch (error) {
    throw new Error(error.message);
  }
};

export const resendVerificationEmail = async (tenant) => {
  try {
    const response = await fetch(
      `https://${tenant}.${BASE_DOMAIN}/company/resend-verification-email/`,

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
