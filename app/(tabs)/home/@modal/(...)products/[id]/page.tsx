import CloseButton from "@/components/close-button";

import ProductDetailContent from "@/components/product-detail";
import { getProductDetail } from "@/app/products/[id]/actions";

export default async function ProductDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const product = await getProductDetail(id);

  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-sm h-1/2 w-full">
        <div className="relative max-h-[60vh] overflow-y-auto">
          <ProductDetailContent product={product} />;
        </div>
      </div>
    </div>
  );
}
