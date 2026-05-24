<?php

namespace App\Actions\Dashboard;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class GetTopProductsAction
{
    public function handle(): array
    {
        // Expected return data structure from frontend:
        // return [
        //     [
        //         'name' => 'Product A',
        //         'brand' => 'Brand X',
        //         'daily_sales' => 25,
        //         'overall_sales' => 500,
        //         'stock_left' => 20,
        //     ],
        //     [
        //         'name' => 'Product B',
        //         'brand' => 'Brand Y',
        //         'daily_sales' => 15,
        //         'overall_sales' => 300,
        //         'stock_left' => 50,
        //     ],
        // ];
        
        $today = now()->toDateString();

        return Product::query()

            ->leftJoin('sale_items', 'sale_items.product_id', '=', 'products.id')

            ->select([
                'products.name',
                'products.brand',
                'products.stock_quantity',

                // Overall quantity sold
                DB::raw('COALESCE(SUM(sale_items.quantity), 0) as overall_sales'),

                // Today's quantity sold
                DB::raw("
                    COALESCE(SUM(
                        CASE
                            WHEN DATE(sale_items.created_at) = '{$today}'
                            THEN sale_items.quantity
                            ELSE 0
                        END
                    ), 0) as sales_today
                "),
            ])

            ->groupBy(
                'products.id',
                'products.name',
                'products.brand',
                'products.stock_quantity'
            )

            ->orderByDesc('overall_sales')

            ->limit(5)

            ->get()

            ->map(function ($product) {
                return [
                    'name' => $product->name,
                    'brand' => $product->brand,
                    'sales_today' => (int) $product->sales_today,
                    'overall_sales' => (int) $product->overall_sales,
                    'stock_left' => (int) $product->stock_quantity,
                ];
            })

            ->toArray();
    }
}