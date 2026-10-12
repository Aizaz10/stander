export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-8 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table / Content Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
