
import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import React from "react";

// Success notification
export const showSuccessToast = (message: string, title: string = "Success") => {
  toast({
    title: title,
    description: message,
    variant: "default",
    duration: 3000,
    className: "success-toast",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  });
};

// Error notification
export const showErrorToast = (message: string, title: string = "Error") => {
  toast({
    title: title,
    description: message,
    variant: "destructive",
    duration: 4000,
    className: "error-toast",
    icon: <AlertCircle className="h-5 w-5 text-destructive" />
  });
};

// Info notification
export const showInfoToast = (message: string, title: string = "Info") => {
  toast({
    title: title,
    description: message,
    variant: "default",
    duration: 3000,
    className: "info-toast",
    icon: <Info className="h-5 w-5 text-blue-500" />
  });
};
