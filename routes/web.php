<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CrudController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\AuthenticationMiddleware;

// Temp Route --> This route is intended for managing session data
Route::get('/session/{operation?}', function($operation = null){
    // Restrict to specific environments only
    $allowedEnvs = ["local", "dev", "development", "staging", "test"];
    
    if (!App::environment($allowedEnvs)) {
        abort(403, 'Access denied. This route is not available in '.App::environment().' environment.');
    }

    if($operation == null) {
        echo "- Specify a proper URL";
    } else if ($operation == "view") {
        $existingSession = session()->all();
        dd($existingSession);
    } else if ($operation == "clear") {
        session()->pull('auth_token');
        echo "- All session data has been flushed (hard reset).";
    } else if ($operation === "flush") {
        session()->flush();
        echo "- All session data has been flushed (hard reset).";
    } else {
        echo "- Specify a proper URL";
    }
});

// Sample CRUD Operation Routes
Route::get('/sample-crud', [CrudController::class, 'loadList'])->name('list.load');
Route::get('/posts/add', [CrudController::class, 'create'])->name('posts.create');
Route::post('/posts', [CrudController::class, 'store'])->name('posts.store');
Route::get('/posts/{post}/edit', [CrudController::class, 'edit'])->name('posts.edit');
Route::put('/posts/{post}', [CrudController::class, 'update'])->name('posts.update');
Route::delete('/posts/{post}', [CrudController::class, 'destroy'])->name('posts.destroy');

Route::middleware([AuthenticationMiddleware::class])->group(function () {
    // Navigation Routes
    Route::get('/registration', [RegistrationController::class, 'loadPage'])->name('registration.page.load');
    Route::get('/login', [AuthenticationController::class, 'loadPage'])->name('login.page.load');
    Route::get('/dashboard', [DashboardController::class, 'loadPage'])->name('dashboard.page.load');
    Route::get('/products', [ProductController::class, 'loadPage'])->name('products.page.load');
    Route::get('/pos', [POSController::class, 'loadPage'])->name('pos.page.load');
    Route::get('/reports', [ReportController::class, 'loadPage'])->name('reports.page.load');

    // API Routes
    Route::post('/api/register', [RegistrationController::class, 'register'])->name('registration');
    Route::post('/api/login', [AuthenticationController::class, 'login'])->name('login');
    Route::post('/api/logout', [AuthenticationController::class, 'logout'])->name('logout');

    Route::post('/api/product/save/{product_uuid?}', [ProductController::class, 'save'])->name('product.save');
    Route::get('/api/product/search', [POSController::class, 'searchProducts'])->name('product.search');
    Route::put('/api/product/stock/{product_uuid}', [ProductController::class, 'updateStock'])->name('product.stock.update');
    Route::post('/api/sale', [POSController::class, 'processSale'])->name('sale.process');
    Route::post('/api/debt', [POSController::class, 'processDebt'])->name('debt.process');
    Route::get('/api/reports', [ReportController::class, 'records'])->name('reports.api.records');
    Route::get('/api/reports/sales-items/{sale_uuid}', [ReportController::class, 'getSaleItems'])->name('sale.items.get');
});