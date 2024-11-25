import ProductDetailContent from "@/components/product-detail";
import { getProduct, getProductDetail } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const product = await getProduct(id);
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const product = await getProductDetail(id);
  return <ProductDetailContent product={product} />;
}
