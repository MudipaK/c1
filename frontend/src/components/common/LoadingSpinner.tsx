const LoadingSpinner = ({ isLoading = false }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 p-6 rounded-lg">
        <div className="relative w-10 h-10">
          {/* Outer ring */}
          {/* <div className="absolute inset-0 border-4 border-blue-100 rounded-full" /> */}
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
