import axios, { AxiosError } from "axios";
import { capitalizeFirstLetter } from "./utils";
import { getSession } from "next-auth/react";

// check if we're running on the server or client
const isServer = typeof window === "undefined";

// URL selection logic:
// 1. If running on the SERVER (inside the Docker container), use BACKEND_INTERNAL_URL (http://gateway:8080)
// 2. If running on the CLIENT (browser), use NEXT_PUBLIC_API_URL (http://localhost:8080)
const baseURL = isServer
  ? process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// inject the access token in the Authorization header for all requests
api.interceptors.request.use(async (config) => {
  if (isServer) {
    // fixme: ci serve? non facciamo chiamate server side
    const { cookies } = await import("next/headers");
  } else {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  return config;
});

export default api;

// Extracts a user-friendly error message from backend error responses
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data;

    console.error("Backend error response:", response);

    if (typeof response === "string") {
      return capitalizeFirstLetter(response);
    }

    if (response && typeof response === "object") {
      if (
        response.message ||
        response.error ||
        response.detail ||
        response.errorMessage
      ) {
        return capitalizeFirstLetter(
          response.message ||
            response.error ||
            response.detail ||
            response.errorMessage,
        );
      }

      const errorMessages = [
        ...new Set(
          Object.values(response).filter((value) => typeof value === "string"),
        ),
      ].join(", ");

      if (errorMessages) {
        return capitalizeFirstLetter(errorMessages);
      }
    }

    return capitalizeFirstLetter(
      error.message || "Errore di connessione al server",
    );
  }

  if (error instanceof Error) {
    return capitalizeFirstLetter(error.message);
  }

  return "Si è verificato un errore sconosciuto";
};
