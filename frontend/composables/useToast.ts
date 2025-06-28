import { useToast } from "primevue/usetoast";

export const useToastNotifications = () => {
  const toast = useToast();

  const showSuccess = (message: string, summary = "Success") => {
    toast.add({
      severity: "success",
      summary,
      detail: message,
      life: 3000,
    });
  };

  const showError = (message: string, summary = "Error") => {
    toast.add({
      severity: "error",
      summary,
      detail: message,
      life: 5000,
    });
  };

  const showInfo = (message: string, summary = "Info") => {
    toast.add({
      severity: "info",
      summary,
      detail: message,
      life: 3000,
    });
  };

  const showWarning = (message: string, summary = "Warning") => {
    toast.add({
      severity: "warn",
      summary,
      detail: message,
      life: 4000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
