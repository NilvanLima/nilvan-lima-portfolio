export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: OrderItem[];
}
