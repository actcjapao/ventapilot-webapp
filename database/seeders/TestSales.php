<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;

class TestSales extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Restrict to specific environments only
        $allowedEnvs = ["dev", "development", "staging", "test"];
        
        if (!App::environment($allowedEnvs)) {
            return;
        }
        
        $rowCount = 20; // Set this to 100 depends on how many rows needed for testing
        $userId = 4; // Assuming you have a user with ID 4 in your database
        $storeId = 4; // Assuming you have a store with ID 4 in your database

        for ($i = 1; $i <= $rowCount; $i++) {
            $totalAmount = 0;

            $sale = Sale::create([
                'user_id' => $userId,
                'store_id' => $storeId,
                'total_amount' => 0,
                'payment_amount' => 0,
                'change_amount' => 0,
                'status' => 'completed',
                'created_at' => now()->addDays($i - 1), // Set created_at to different days (from today to 15 days in the future) for testing date filters
            ]);

            // Create 1-3 sale items for each sale
            $numItems = rand(1, 3);
            $productIds = range(1, 6); // Assuming you have products with IDs 1-6
            shuffle($productIds); // Shuffle to get random product IDs

            for ($j = 1; $j <= $numItems; $j++) {
                // Get a random productID and query the details
                $randomProductId = array_pop($productIds);
                $product = Product::whereIn('id', [$randomProductId])->first();
                $unitPrice = $product->selling_price;

                $quantity = rand(1, 5); // Random quantity between 1 and 5
                $totalPrice = $quantity * $unitPrice; // Calculate total price
                $totalAmount += $totalPrice; // Add to total amount for the sale

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);
            }
            
            $randomPaymentAmount = $totalAmount + rand(100, 500); // totalAmount + Random payment amount = Always greater than totalAmount to avoid negative change amount
            $changeAmount = $randomPaymentAmount - $totalAmount; // Calculate change amount

            // Update the sale with the calculated total amount, payment amount, and change amount
            $sale->total_amount = $totalAmount;
            $sale->payment_amount = $randomPaymentAmount;
            $sale->change_amount = $changeAmount;
            $sale->save();
        }
    }
}
