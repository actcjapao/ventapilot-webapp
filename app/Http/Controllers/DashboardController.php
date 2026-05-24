<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\Dashboard\DashboardService;

class DashboardController extends Controller
{
    function loadPage(DashboardService $dashboardService) {
        return inertia('dashboard/Dashboard', [
            'dashboardData' => $dashboardService->get()
        ]);
    }
}
