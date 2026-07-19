"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

export function Stepper({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isFuture = step.number > currentStep;

          return (
            <div key={step.number} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    isCompleted && "bg-red-600 text-white",
                    isCurrent && "border-2 border-red-600 bg-red-50 text-red-700",
                    isFuture && "border-2 border-gray-200 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center max-w-[72px]",
                    isCompleted && "text-red-600",
                    isCurrent && "text-red-700 font-bold",
                    isFuture && "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mt-[-20px] flex-1 h-[2px] rounded-full transition-colors duration-300",
                    isCompleted ? "bg-red-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
