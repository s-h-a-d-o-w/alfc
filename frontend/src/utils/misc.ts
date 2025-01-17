import { toast, ToastContent } from "react-toastify";
import { theme } from "./consts";

export function successToast(content: ToastContent) {
  toast.success(content, {
    theme: "colored",
    autoClose: 5000,
    position: "bottom-right",
    style: {
      background: theme.primary,
    },
  });
}

export function errorToast(content: ToastContent) {
  toast.error(content, {
    theme: "colored",
    position: "bottom-right",
    autoClose: false,
  });
}
