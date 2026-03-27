export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a1e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    </div>
  )
}
