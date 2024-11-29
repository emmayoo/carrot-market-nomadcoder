export default function Loading() {
  return (
    <div className="p-5 animate-pulse flex flex-col gap-5">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex gap-5">
          <div className="size-16 rounded-full bg-neutral-700" />
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex gap-2 *:rounded-md">
              <div className="bg-neutral-700 h-5 w-20" />
              <div className="bg-neutral-700 h-5 w-10" />
            </div>
            <div className="bg-neutral-700 h-5 w-40 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
