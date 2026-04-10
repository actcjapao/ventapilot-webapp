<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Models\Product;
use App\Models\User;
use App\Models\UserStore;

class POSController extends Controller
{
    function loadPage() {
        return inertia('pos/POS');
    }

    function searchProducts(Request $request) {
        $query = $request->get('q', '');
        $authenticatedUser = session('authenticated_user');
        $userUuid = $authenticatedUser->uuid;

        // Get user's store
        $user = User::with('userStores:user_id,store_id')
                    ->where('uuid', $userUuid)
                    ->firstOrFail();
        
        $storeId = $user->userStores->first()?->store_id;

        if (!$storeId) {
            return response()->json([]);
        }

        $products = Product::where('store_id', $storeId)
                          ->where('name', 'like', '%' . $query . '%')
                          ->select(['uuid', 'name', 'price', 'stock_quantity', 'brand', 'tags'])
                          ->limit(10)
                          ->get();
        Log::info("Products loaded for store", ['products' => $products]);

        return response()->json($products);
    }
}
