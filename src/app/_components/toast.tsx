"use client";
import { useEffect, useState } from "react";
import cn from "classnames";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
};

export function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ease-in-out",
        {
          "translate-x-0 opacity-100": isVisible,
          "translate-x-full opacity-0": !isVisible,
        }
      )}
    >
      <div
        className={cn(
          "rounded-lg shadow-lg p-4 flex items-start gap-3",
          {
            "bg-green-50 border border-green-200": type === "success",
            "bg-red-50 border border-red-200": type === "error",
            "bg-emerald-50 border border-emerald-200": type === "info",
          }
        )}
      >
        <div className="flex-1">
          <p
            className={cn("text-sm font-medium", {
              "text-green-800": type === "success",
              "text-red-800": type === "error",
              "text-emerald-800": type === "info",
            })}
          >
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={cn("text-lg font-bold leading-none", {
            "text-green-600 hover:text-green-800": type === "success",
            "text-red-600 hover:text-red-800": type === "error",
            "text-emerald-600 hover:text-emerald-800": type === "info",
          })}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

type ToastState = {
  message: string;
  type?: "success" | "error" | "info";
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type?: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
