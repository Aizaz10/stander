export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-primary-light border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Stander...</p>
    </div>
  );
}
