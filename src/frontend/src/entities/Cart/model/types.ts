export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}
