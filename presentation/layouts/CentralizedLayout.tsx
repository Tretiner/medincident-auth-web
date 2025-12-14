export function CentralizedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] bg-white rounded-vk shadow-xl overflow-hidden min-h-[600px] flex">
        {children}
      </div>
    </div>
  );
}