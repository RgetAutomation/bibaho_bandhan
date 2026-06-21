export default function LoadingPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen my-auto">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="w-16 h-16 border-4 border-transparent text-rose-700 text-4xl animate-spin flex items-center justify-center border-t-rose-700 rounded-full">
          <div className="w-12 h-12 border-4 border-transparent text-rose-400 text-2xl animate-spin flex items-center justify-center border-t-rose-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
