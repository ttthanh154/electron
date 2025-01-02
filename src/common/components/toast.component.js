import { toast } from "@zerodevx/svelte-toast";

/**
 * Show a success toast message
 * @param message string
 */
export const success = (message) =>
  toast.push(message, {
    theme: {
      "--toastBackground": "#28a745", // Bright green
      "--toastColor": "white", // White text
      "--toastBarBackground": "#218838", // Darker green for progress bar
      "font-size": "medium",
    },
  });

/**
 * Show a warning toast message
 * @param message string
 */
export const warning = (message) =>
  toast.push(message, {
    theme: {
      "--toastBackground": "#ffc107", // Amber yellow
      "--toastColor": "black", // Black text
      "--toastBarBackground": "#e0a800", // Darker amber for progress bar
      "font-size": "medium",
    },
  });

/**
 * Show a failure toast message
 * @param message string
 */
export const failure = (message) =>
  toast.push(message, {
    theme: {
      "--toastBackground": "#dc3545", // Bright red
      "--toastColor": "white", // White text
      "--toastBarBackground": "#c82333", // Darker red for progress bar
      "font-size": "medium",
    },
  });