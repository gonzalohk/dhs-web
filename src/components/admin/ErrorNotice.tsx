/** Message passed back by list actions through the ?error= query parameter; stays visible while scrolling. */
export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="sticky top-20 z-30 mb-4 rounded-lg border border-red-200 bg-red-50 p-4 font-medium text-red-800 shadow-md"
    >
      {message}
    </p>
  );
}
