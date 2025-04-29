import axios, { AxiosError } from "axios";
import { showReload } from "../functions";

interface ApiErrorResponse {
  error: {
    message: string;
    status?: number;
  };
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  },
});

// Add this method to your existing API utility

// Add a method for form data uploads
const postFormData = async <T>(url: string, formData: FormData) => {
  try {
    const response = await axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Axios will set the correct content type with boundary
      },
    });
    
    return {
      status: response.status,
      message: 'Success',
      data: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'An error occurred',
        data: null
      };
    }
    
    return {
      status: 500,
      message: error.message || 'Unknown error',
      data: null
    };
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    let errorMessage = "Something went wrong. Please refresh the page.";

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          errorMessage = "Session expired. Please sign in again.";
          // You might want to trigger a sign-in here
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action.";
          break;
        case 408:
          errorMessage = "Request timed out. Please refresh the page.";
          showReload(errorMessage);
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          if (error.response.data?.error?.message === "Connection is closed.") {
            showReload(errorMessage);
          }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server. Please check your connection.";
      showReload(errorMessage);
    }

    // Log error for debugging
    console.error("API Error:", {
      status: error.response?.status,
      message: errorMessage,
      originalError: error.response?.data,
    });

    return {
      status: error.response?.status,
      message: errorMessage,
      originalError: error.response?.data,
    };
  }
);

export { axiosInstance as default, postFormData };