"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

export function BackButton({ fallbackUrl = "/", className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <div className={`sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b ${className}`}>
      <div className="container mx-auto px-4 py-2">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="h-8 px-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>
    </div>
  );
}