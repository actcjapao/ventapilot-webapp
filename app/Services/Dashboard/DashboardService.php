<?php

namespace App\Services\Dashboard;

use App\Actions\Dashboard\GetMetricsAction;
use App\Actions\Dashboard\GetSalesOverviewAction;
use App\Actions\Dashboard\GetWeeklySalesAction;
use App\Actions\Dashboard\GetTopProductsAction;

class DashboardService
{
    public function __construct(
        protected GetMetricsAction $getMetricsAction,
        protected GetSalesOverviewAction $getSalesOverviewAction,
        protected GetWeeklySalesAction $getWeeklySalesAction,
        protected GetTopProductsAction $getTopProductsAction,
    ) {}

    public function get(): array
    {
        return [
            'metrics' => $this->getMetricsAction->handle(),
            'sales_overview_chart' => $this->getSalesOverviewAction->handle(),
            'weekly_sales' => $this->getWeeklySalesAction->handle(),
            'top_products' => $this->getTopProductsAction->handle(),
        ];
    }
}