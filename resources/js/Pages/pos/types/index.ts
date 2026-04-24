import { BaseResponse } from "@/common/types";
import { Product } from "@/Pages/products/types";

export interface CartItem {
   product: Product;
   quantity: number;
}

export type ProcessSaleResponse =
   | (BaseResponse & {
        sale_uuid: string;
     })
   | BaseResponse;

export type ProcessDebtResponse =
   | (BaseResponse & {
        debt_uuid: string;
     })
   | BaseResponse;
