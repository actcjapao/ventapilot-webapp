<?php

namespace App\Actions\Dashboard;

use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;

class GetSalesOverviewAction
{
    public function handle(): array
    {
        // Expected return data structure from frontend:
        // return [
        //     ['date' => '2024-06-01', 'sales' => 1500.00, 'profit' => 500.00],
        //     ['date' => '2024-06-02', 'sales' => 2000.00, 'profit' => 700.00],
        //     ['date' => '2024-06-03', 'sales' => 1800.00, 'profit' => 600.00],
        //     ['date' => '2024-06-04', 'sales' => 2200.00, 'profit' => 800.00],
        //     ['date' => '2024-06-05', 'sales' => 1700.00, 'profit' => 550.00],
        //     ['date' => '2024-06-06', 'sales' => 2100.00, 'profit' => 750.00],
        //     ['date' => '2024-06-07', 'sales' => 1900.00, 'profit' => 650.00],
        // ];

        $startDate = now()->subDays(6)->startOfDay();
        $endDate = now()->endOfDay();
        
        // Sample data structure of the $salesData raw result:
        /**
         * [
         *       "2026-05-20" => [
         *           "raw_date" => "2026-05-20",
         *           "sales" => "15250.00",
         *           "profit" => "4250.00",
         *       ],
         * 
         *       "2026-05-20" => [
         *           "raw_date" => "2026-05-20",
         *           "sales" => "15250.00",
         *           "profit" => "4250.00",
         *       ],
         *  ]
         * 
         */
        
        // 1. Fetch actual sales data
        $salesData = Sale::query()
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')

            ->select([
                DB::raw('DATE(sales.created_at) as raw_date'),

                DB::raw('SUM(sale_items.total_price) as sales'),

                DB::raw('SUM(
                    sale_items.total_price - sale_items.total_cost_price_at_sale
                ) as profit'),
            ])

            ->whereBetween('sales.created_at', [
                $startDate,
                $endDate,
            ])

            ->groupBy(DB::raw('DATE(sales.created_at)'))

            ->orderBy('raw_date', 'asc')

            ->get()

            ->keyBy('raw_date');

        // 2. Generate complete 7-day range
        $period = CarbonPeriod::create(
            $startDate->copy()->toDateString(),
            $endDate->copy()->toDateString()
        );

        // 3. Restructuring according to expected structure from frontend (see sample above):
        // Fill missing dates with zero values
        $result = [];

        foreach ($period as $date) {
            $dateKey = $date->toDateString();
            $existing = $salesData->get($dateKey);

            $result[] = [
                'date' => $date->format('M d, D'),
                'sales' => $existing?->sales ?? 0, // even if there are no sales, it should also be 0 for that day
                'profit' => $existing?->profit ?? 0, // even if there are no profit, it should also be 0 for that day
            ];
        }

        return $result;
    }
}