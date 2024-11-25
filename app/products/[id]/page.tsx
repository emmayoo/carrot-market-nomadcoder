import ProductDetailContent from "@/components/product-detail";
import { getProductDetail } from "./actions";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const product = await getProductDetail(id);
  return <ProductDetailContent product={product} />;
}
