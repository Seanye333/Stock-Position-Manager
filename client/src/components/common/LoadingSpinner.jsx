export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-dark-border border-t-accent-blue rounded-full animate-spin" />
    </div>
  );
}
