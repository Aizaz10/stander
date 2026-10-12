export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="h-9 w-40 bg-gray-200 rounded-lg animate-pulse mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="h-4 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-7 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
