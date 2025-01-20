export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="h-40 bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gray-700 rounded"></div>
              <div className="h-40 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 