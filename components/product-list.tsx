import ListProduct from "./list-product";

import { InitialProducts } from "@/app/(tabs)/home/page";

interface ProductListProps {
  initialProducts: InitialProducts;
}

export default async function ProductList({
  initialProducts,
}: ProductListProps) {
  return (
    <div className="p-5 flex flex-col gap-5">
      {initialProducts.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
    </div>
  );
}
