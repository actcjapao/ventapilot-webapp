<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ProcessSaleRequest;
use App\Http\Requests\ProcessDebtRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

use App\Models\Product;
use App\Models\User;
use App\Models\UserStore;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Debt;
use App\Models\DebtItem;

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
                          ->select(['uuid', 'name', 'cost_price', 'selling_price', 'stock_quantity', 'brand', 'tags'])
                          ->limit(10)
                          ->get();

        return response()->json($products);
    }

    function processSale(ProcessSaleRequest $request) {
        $data = $request->validated();

        DB::beginTransaction();
        
        $authenticatedUser = session('authenticated_user');
        $userUuid = $authenticatedUser->uuid;

        $user = User::with('userStores:user_id,store_id')
                    ->where('uuid', $userUuid)
                    ->firstOrFail();
        
        $userId = $user->userStores->first()->user_id;
        $storeId = $user->userStores->first()->store_id;

        try {
            // 1. Create Sale
            $sale = Sale::create([
                'user_id' => $userId,
                'store_id' => $storeId,
                'total_amount' => $data['total_amount'],
                'payment_amount' => $data['payment_amount'],
                'change_amount' => $data['change_amount'],
                'status' => 'completed',
            ]);

            // 2. Loop items
            foreach ($data['items'] as $item) {

                // Lock row for update (important for concurrency)
                $product = Product::where('uuid', $item['product']['uuid'])
                    ->lockForUpdate()
                    ->firstOrFail();

                // 3. Check stock
                if ($product->stock_quantity < $item['quantity']) {
                    // Goes to HttpException catch block
                    throw new HttpException(400, "Insufficient stock for '{$product->name}'");
                }

                $unitPrice = $product->selling_price;
                $totalPrice = $unitPrice * $item['quantity'];

                $costPriceAtSale = $product->cost_price;
                $totalCostPriceAtSale = $costPriceAtSale * $item['quantity'];

                // 4. Create Sale Item
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'cost_price_at_sale' => $costPriceAtSale,
                    'total_cost_price_at_sale' => $totalCostPriceAtSale,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                // 5. Deduct stock (automatically updates updated_at)
                $product->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();
            
            return response()->json([   
                'data' => [
                    'key' => 'success',
                    'message' => 'Sale processed successfully!',
                    'sale_uuid' => $sale->uuid,
                ],
            ], 201);
        } catch (HttpException $e) {
            DB::rollBack();

            return response()->json([
                'key' => 'error',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Sale processing failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to process sale',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    function processDebt(ProcessDebtRequest $request) {
        $data = $request->validated();

        DB::beginTransaction();
        
        $authenticatedUser = session('authenticated_user');
        $userUuid = $authenticatedUser->uuid;

        $user = User::with('userStores:user_id,store_id')
                    ->where('uuid', $userUuid)
                    ->firstOrFail();
        
        $userId = $user->userStores->first()->user_id;
        $storeId = $user->userStores->first()->store_id;

        try {
            // 1. Create Debt
            $debt = Debt::create([
                'user_id' => $userId,
                'store_id' => $storeId,
                'customer_name' => $data['customer_name'],
                'total_amount' => $data['total_amount'],
                'balance_due' => $data['total_amount'],
                'due_date' => $data['due_date'] ?? null,
            ]);

            // 2. Loop items
            foreach ($data['items'] as $item) {

                // Lock row for update (important for concurrency)
                $product = Product::where('uuid', $item['product']['uuid'])
                    ->lockForUpdate()
                    ->firstOrFail();

                // 3. Check stock
                if ($product->stock_quantity < $item['quantity']) {
                    // Goes to HttpException catch block
                    throw new HttpException(400, "Insufficient stock for '{$product->name}'");
                }

                $unitPrice = $product->selling_price;
                $totalPrice = $unitPrice * $item['quantity'];

                // 4. Create Debt Item
                DebtItem::create([
                    'debt_id' => $debt->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                // 5. Deduct stock (automatically updates updated_at)
                $product->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();
            
            return response()->json([   
                'data' => [
                    'key' => 'success',
                    'message' => 'Debt processed successfully!',
                    'debt_uuid' => $debt->uuid,
                ],
            ], 201);
        } catch (HttpException $e) {
            DB::rollBack();

            return response()->json([
                'key' => 'error',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Debt processing failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to process debt',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}