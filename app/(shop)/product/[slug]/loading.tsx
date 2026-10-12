export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] max-h-[320px] lg:max-h-[480px] w-full bg-gray-100 rounded-xl animate-pulse border border-gray-100" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col lg:sticky lg:top-24 self-start">
          <div className="w-24 h-6 bg-gray-100 rounded-full animate-pulse mb-4" />
          <div className="w-3/4 h-10 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-32 h-5 bg-gray-100 rounded animate-pulse mb-6" />
          
          <div className="w-48 h-10 bg-gray-200 rounded animate-pulse mb-6" />
          
          <div className="space-y-3 mb-6">
            <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse" />
          </div>

          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-6" />

          <div className="border-t border-gray-100 pt-6">
            <div className="flex gap-4">
              <div className="w-24 h-12 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
