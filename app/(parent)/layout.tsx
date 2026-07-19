export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
      {children}
    </div>
  );
}
