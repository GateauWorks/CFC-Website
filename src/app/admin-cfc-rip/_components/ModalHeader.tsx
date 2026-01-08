"use client";
import { ReactNode } from "react";

type ModalHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return (
    <div className={`flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10 ${className}`}>
      {children}
    </div>
  );
}
