"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label,
}: {
  value: string | null | undefined;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    if (!value) {
      toast.error("Tidak ada nilai untuk disalin");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} disalin` : "Disalin!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={handleCopy}
      aria-label="Salin"
    >
      <Copy className={cn("h-4 w-4", copied && "text-success")} />
    </Button>
  );
}
