"use client";
import { ReactNode } from "react";
import cn from "classnames";

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}
