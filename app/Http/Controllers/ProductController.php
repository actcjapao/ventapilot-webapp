<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SaveProductRequest;
use Illuminate\Support\Facades\Log;

use App\Models\Product;
use App\Models\User;
use App\Models\UserStore;

class ProductController extends Controller
{
    /**
     * Pagination limit for products per page
     */
    private const PRODUCTS_PER_PAGE = 5;

    function loadPage() {
        $authenticatedUser = session('authenticated_user');
        $userUuid = $authenticatedUser->uuid;

        // Get user's store using relationships - avoids N+1 query
        $user = User::with('userStores:user_id,store_id')
                    ->where('uuid', $userUuid)
                    ->firstOrFail();
        
        // Get the store ID from the user's first store relationship
        $storeId = $user->userStores->first()?->store_id;
        
        if (!$storeId) {
            return inertia('products/Products', [
                'store_id' => null,
                'products' => [
                    'data' => [],
                    'current_page' => 1,
                    'total' => 0,
                    'last_page' => 1,
                    'per_page' => self::PRODUCTS_PER_PAGE,
                ]
            ]);
        }
        
        // Paginate products with only needed columns
        // Laravel automatically uses the 'page' query parameter (e.g., ?page=2) for pagination
        $products = Product::where('store_id', $storeId)
                        ->select([
                            'id', 'uuid', 'store_id',
                            'name', 'brand', 'description',
                            'cost_price', 'selling_price', 'stock_quantity', 'tags',
                            'is_active', 'created_at', 'updated_at'])
                        ->latest()
                        ->paginate(self::PRODUCTS_PER_PAGE);

        // Log::info("Products loaded for store", ['store_id' => $storeId, 'count' => $products->count(), 'current_page' => $products->currentPage()]);

        return inertia('products/Products', [
            'store_id' => $storeId,
            'products' => $products
        ]);
    }

    function save(SaveProductRequest $request, $product_uuid = null) {
        if ($product_uuid) {
            $product = Product::where('uuid', $product_uuid)->firstOrFail();
            $product->update($request->validated());
        } else {
            $product = Product::create($request->validated());
        }

        // Redirect to the products page with a success message (but only reloads the product list in the frontend)
        return back()->with('success', 'Product saved successfully!');
    }
}
