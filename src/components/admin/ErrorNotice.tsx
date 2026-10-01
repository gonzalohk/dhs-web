/** Message passed back by list actions through the ?error= query parameter. */
export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 font-medium text-red-800">
      {message}
    </p>
  );
}
