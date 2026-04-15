export type Product = {
   uuid: string;
   store_id: number;
   name: string;
   brand: string | null;
   description: string | null;
   stock_quantity: number;
   cost_price: number;
   selling_price: number;
   tags: string[];
   is_active: boolean;
};
