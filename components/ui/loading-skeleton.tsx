"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  type?: "coin-list" | "chart" | "header" | "sectors" | "full-page";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  type = "coin-list",
  count = 10,
  className = ""
}: LoadingSkeletonProps) {
  if (type === "full-page") {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Filter skeleton */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-7 w-16" />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-7 w-16" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad placeholder */}
            <div className="w-full h-20 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-xs text-gray-400">광고 로딩 중...</div>
            </div>

            {/* Coin list skeleton */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-3 p-4">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50/50 rounded-lg">
                      <Skeleton className="h-4 w-8" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (type === "coin-list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="bg-gray-50/30">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-6" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-sm text-gray-400">차트 로딩 중...</div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "sectors") {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "header") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    );
  }

  return null;
}

export function CoinListSkeleton({ count = 10, className = "" }: { count?: number; className?: string }) {
  return <LoadingSkeleton type="coin-list" count={count} className={className} />;
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return <LoadingSkeleton type="chart" className={className} />;
}

export function SectorsSkeleton({ className = "" }: { className?: string }) {
  return <LoadingSkeleton type="sectors" className={className} />;
}

export function HeaderSkeleton({ className = "" }: { className?: string }) {
  return <LoadingSkeleton type="header" className={className} />;
}

export function FullPageSkeleton({ className = "" }: { className?: string }) {
  return <LoadingSkeleton type="full-page" className={className} />;
}