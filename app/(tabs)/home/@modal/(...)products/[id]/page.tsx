import CloseButton from "@/components/close-button";
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function Modal({ params }: { params: Promise<{ id: string }> }) {
  console.log(params);

  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-sm h-1/2  flex justify-center w-full">
        <div className="aspect-square  bg-neutral-700 text-neutral-200  rounded-md flex justify-center items-center">
          <PhotoIcon className="h-28" />
        </div>
      </div>
    </div>
  );
}
