
import { toast } from "@/hooks/use-toast";

// Success notification
export const showSuccessToast = (message: string, title: string = "Success") => {
  toast({
    title: title,
    description: message,
    variant: "default",
    duration: 3000,
    className: "success-toast"
  });
};

// Error notification
export const showErrorToast = (message: string, title: string = "Error") => {
  toast({
    title: title,
    description: message,
    variant: "destructive",
    duration: 4000,
    className: "error-toast"
  });
};

// Info notification
export const showInfoToast = (message: string, title: string = "Info") => {
  toast({
    title: title,
    description: message,
    variant: "default",
    duration: 3000,
    className: "info-toast"
  });
};
