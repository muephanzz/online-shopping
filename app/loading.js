export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
          </div>
        </div>
    );
  }