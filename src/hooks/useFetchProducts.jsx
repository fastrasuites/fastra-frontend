import axios from "axios";
import { useState, useEffect } from "react";
import { useTenant } from "../context/TenantContext";

const useFetchProducts = ({ url }) => {
  const { tenantData } = useTenant();
  // Ensure tenantData is not null before destructuring accessToken.
  const accessToken = tenantData?.accessToken;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (url && accessToken) {
      fetchData();
    }
  }, [url, accessToken]);

  return { data, isLoading, error, refetch: fetchData };
};

export default useFetchProducts;
