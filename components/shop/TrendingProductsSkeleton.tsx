import { Card } from "@/components/ui/Card";

export default function TrendingProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="group cursor-pointer">
          <div className="aspect-square bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
            <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="p-5">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
