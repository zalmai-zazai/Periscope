// hooks/useToast.ts
import { toast } from "sonner";

export function useToast() {
  const showToast = {
    success: (message: string, description?: string) => {
      if (description) {
        toast.success(message, { description });
      } else {
        toast.success(message);
      }
    },
    error: (message: string, description?: string) => {
      if (description) {
        toast.error(message, {
          description,
          duration: 6000, // Longer for errors
        });
      } else {
        toast.error(message, { duration: 6000 });
      }
    },
    warning: (message: string, description?: string) => {
      if (description) {
        toast.warning(message, { description });
      } else {
        toast.warning(message);
      }
    },
    info: (message: string, description?: string) => {
      if (description) {
        toast.info(message, { description });
      } else {
        toast.info(message);
      }
    },
    loading: (message: string, description?: string) => {
      if (description) {
        return toast.loading(message, { description });
      } else {
        return toast.loading(message);
      }
    },
    dismiss: (id?: string | number) => {
      toast.dismiss(id);
    },
  };

  return showToast;
}
