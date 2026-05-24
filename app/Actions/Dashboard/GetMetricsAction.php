<?php

namespace App\Actions\Dashboard;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;

class GetMetricsAction
{
    public function handle(): array
    {
        $totalSales = Sale::sum('total_amount');
        $totalSalesCost = SaleItem::sum('total_cost_price_at_sale');

        return [
            'total_products' => Product::count(),
            'total_sales_cost' => $totalSalesCost,
            'total_sales' => $totalSales,
            'total_profit' => $totalSales - $totalSalesCost,
        ];
    }
}