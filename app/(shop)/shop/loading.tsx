import TrendingProductsSkeleton from "@/components/shop/TrendingProductsSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="space-y-8">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="flex-1">
          <div className="mb-6 h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <TrendingProductsSkeleton />
          <div className="mt-6">
            <TrendingProductsSkeleton />
          </div>
          <div className="mt-6">
            <TrendingProductsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
