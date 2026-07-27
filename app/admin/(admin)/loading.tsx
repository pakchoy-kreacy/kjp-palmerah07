export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
        <p className="text-sm font-medium text-gray-500">Memuat panel admin...</p>
      </div>
    </div>
  );
}
