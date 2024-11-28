"use client"; // Error boundaries must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <div>message: {error.message}</div>
      {error.digest ?? <div>digest: {error.digest}</div>}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
