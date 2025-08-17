import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const request = async (config: {
  method: string;
  url: string;
  data?: any;
  params?: any;
  headers?: any;
  timeout?: number;
}) => {
  config.url = `${apiUrl}${config.url}`;
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Token ${token}`,
    };
  }
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Request failed:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};
