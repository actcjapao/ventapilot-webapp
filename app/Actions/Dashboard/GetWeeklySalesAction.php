<?php

namespace App\Actions\Dashboard;

use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;

class GetWeeklySalesAction
{
    public function handle(): array
    {
        // Expected return data structure from frontend:
        // return [
        //     ['date' => '2024-06-01', 'day' => 'Monday', 'total_sales' => 1500.00, 'total_profit' => 500.00],
        //     ['date' => '2024-06-02', 'day' => 'Tuesday', 'total_sales' => 2000.00, 'total_profit' => 700.00],
        //     ['date' => '2024-06-03', 'day' => 'Wednesday', 'total_sales' => 1800.00, 'total_profit' => 600.00],
        //     ['date' => '2024-06-04', 'day' => 'Thursday', 'total_sales' => 2200.00, 'total_profit' => 800.00],
        //     ['date' => '2024-06-05', 'day' => 'Friday', 'total_sales' => 1700.00, 'total_profit' => 550.00],
        //     ['date' => '2024-06-06', 'day' => 'Saturday', 'total_sales' => 2100.00, 'total_profit' => 750.00],
        //     ['date' => '2024-06-07', 'day' => 'Sunday', 'total_sales' => 1900.00, 'total_profit' => 650.00],
        // ];

        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        // Sample data structure of the $salesData raw result:
        /**
         * [
         *       "2026-05-20" => [
         *           "raw_date" => "2026-05-20",
         *           "total_sales" => "15250.00",
         *           "total_profit" => "4250.00",
         *       ],
         * 
         *       "2026-05-20" => [
         *           "raw_date" => "2026-05-20",
         *           "total_sales" => "15250.00",
         *           "total_profit" => "4250.00",
         *       ],
         *  ]
         * 
         */

        // 1. Fetch aggregated sales data
        $salesData = Sale::query()
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')

            ->select([
                DB::raw('DATE(sales.created_at) as raw_date'),

                DB::raw('SUM(sale_items.total_price) as total_sales'),

                DB::raw('SUM(
                    sale_items.total_price - sale_items.total_cost_price_at_sale
                ) as total_profit'),
            ])

            ->whereBetween('sales.created_at', [
                $startOfWeek,
                $endOfWeek,
            ])

            ->groupBy(DB::raw('DATE(sales.created_at)'))

            ->orderBy('raw_date', 'asc')

            ->get()

            ->keyBy('raw_date');

        // 2. Generate complete Monday-Sunday range
        $period = CarbonPeriod::create(
            $startOfWeek->copy()->toDateString(),
            $endOfWeek->copy()->toDateString()
        );

        // 3. Restructuring according to expected structure from frontend (see sample above):
        // Fill missing dates with zero values
        $result = [];

        foreach ($period as $date) {
            $dateKey = $date->toDateString();
            $existing = $salesData->get($dateKey);

            $result[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('l'),
                'total_sales' => (float) ($existing?->total_sales ?? 0),
                'total_profit' => (float) ($existing?->total_profit ?? 0),
            ];
        }

        return $result;
    }
}