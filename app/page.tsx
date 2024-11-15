export default function Home() {
  return (
    <main className="bg-slate-300 h-screen p-5 flex items-center justify-center">
      <div className="bg-white w-full shadow-lg p-5 rounded-xl">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-gray-600 font-semibold -mb-1">In trasit</span>
            <span className="text-4xl font-semibold">cool blue</span>
          </div>
          <div className="size-12 rounded-full bg-orange-400 ">cool blue</div>
        </div>
        <div className="my-2 flex items-center gap-2">
          <span className="bg-green-400 text-white uppercase px-2.5 py-1.5 text-xs font-medium rounded-full">
            Today
          </span>
          <span>9:30~10:30</span>
        </div>
        <div className="relative">
          <div className="bg-gray-200 rounded-full w-full h-2 absolute" />
          <div className="bg-green-200 rounded-full w-1/2 h-2 absolute" />
        </div>
        <div className="flex justify-between items-center mt-5 text-gray-600">
          <span>Expected</span>
          <span>Sorting center</span>
          <span>In transit</span>
          <span className="text-gray-400">Delivered</span>
        </div>
      </div>
    </main>
  );
}
