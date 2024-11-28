import db from "@/lib/db";
import ProductEdit from "@/components/product-edit";

import { notFound } from "next/navigation";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const product = await db.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      photo: true,
      description: true,
      title: true,
      price: true,
    },
  });

  if (!product) notFound();

  return <ProductEdit {...product} />;
}
