<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    /**
     * Pagination limit for products per page
     */
    private const SALES_PER_PAGE = 5;

    function loadPage() {
        return inertia('reports/Reports');
    }

    function records(Request $request) {
        $dateRange = $request->get('date_range', 'Today');
        $customStartDate = $request->get('start_date');
        $customEndDate = $request->get('end_date');

        $authenticatedUser = session('authenticated_user');
        if (!$authenticatedUser) {
            abort(403, 'Unauthorized');
        }

        $userUuid = $authenticatedUser->uuid;
        $user = User::with('userStores:user_id,store_id')
            ->where('uuid', $userUuid)
            ->firstOrFail();

        $storeId = $user->userStores->first()?->store_id;
        if (!$storeId) {
            return response()->json([
                'data' => [
                    'sales' => [
                        'data' => [],
                        'current_page' => 1,
                        'total' => 0,
                        'last_page' => 1,
                        'per_page' => self::SALES_PER_PAGE,
                    ],
                    'summary' => [
                        'total_sales' => 0,
                        'total_cost' => 0,
                        'total_profit' => 0,
                    ],
                ],
            ]);
        }

        // Base query for sales in the given store
        $salesQuery = Sale::where('store_id', $storeId);

        // Apply date filter based on the selected date range (Today, This week, This month, Custom)
        $applyDateFilter = function ($query,  $column = 'created_at') use ($dateRange, $customStartDate, $customEndDate) {
            $now = Carbon::now();

            switch ($dateRange) {
                case 'This week':
                    return $query->whereBetween($column, [
                        $now->copy()->startOfWeek(),
                        $now->copy()->endOfWeek(),
                    ]);
                case 'This month':
                    return $query->whereBetween($column, [
                        $now->copy()->startOfMonth(),
                        $now->copy()->endOfMonth(),
                    ]);
                case 'Custom':
                    if ($customStartDate && $customEndDate) {
                        $start = Carbon::parse($customStartDate)->startOfDay();
                        $end = Carbon::parse($customEndDate)->endOfDay();
                        if ($end->lt($start)) {
                            [$start, $end] = [$end, $start];
                        }
                        return $query->whereBetween($column, [$start, $end]);
                    }
                    return $query;
                default:
                    return $query->whereDate($column, $now->toDateString());
            }
        };

        // Apply the date filter to the sales base query
        $salesQuery = $applyDateFilter($salesQuery, 'created_at');

        // Clone BEFORE paginate so that it will properly calculate the summaries
        $salesPaginationQuery = clone $salesQuery;
        $salesSummaryQuery = clone $salesQuery;

        // Query1: Fetch the sales records with pagination (to improve)
        // Paginate products with selected columns for performance.
        // Laravel's paginate() uses the 'page' query parameter (e.g., ?page=2),
        // defaulting to page 1, and returns pagination metadata.
        $sales = $salesPaginationQuery
            ->select([
                'uuid',
                'created_at',
                'payment_method',
                'total_amount',
                'payment_amount',
                'change_amount',
            ])
            ->orderByDesc('created_at')
            ->paginate(self::SALES_PER_PAGE);
                    
        // Query2: Calculate total sales amount for the filtered records
        $totalSales = $salesSummaryQuery->sum('total_amount');

        // Calculate total cost for the filtered sales records
        $totalCost = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.store_id', $storeId);

        // Query3: Apply the same date filter and run the total cost calculation query        
        $totalCost = $applyDateFilter($totalCost, 'sales.created_at')
            ->selectRaw('COALESCE(SUM(products.cost_price * sale_items.quantity), 0) as total_cost')
            ->value('total_cost');

        return response()->json([
            'data' => [
                'sales' => $sales,
                'summary' => [
                    'total_sales' => (float) $totalSales,
                    'total_cost' => (float) $totalCost,
                    'total_profit' => (float) ($totalSales - $totalCost),
                ],
            ],
        ]);
    }
}
