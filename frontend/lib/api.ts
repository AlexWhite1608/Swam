import axios, { AxiosError } from "axios";
import { capitalizeFirstLetter } from "./utils";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

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
