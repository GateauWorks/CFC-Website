"use client";
import { ReactNode } from "react";
import cn from "classnames";

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={cn("flex gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0", className)}>
      {children}
    </div>
  );
}
