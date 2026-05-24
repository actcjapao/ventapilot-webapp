<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SaleItem extends Model
{
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * Only the attributes listed here can be set via mass assignment.
     *
     * Example:
     * ```php
     * $data = [
     *     'store_id' => '1',
     *     'sale_item' => 'Sample Sale Item',
     *     'item' => 'xyz', // Not in $fillable, so will be ignored
     * ];
     *
     * SaleItems::create($data);
     * // Only 'store_id', 'sale_item', are saved
     * ```
     *
     * @var list<string>
     */
    protected $fillable = [
        'sale_id',
        'product_id',
        'cost_price_at_sale',
        'total_cost_price_at_sale',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * Tell Laravel which column is the UUID to auto-generate.
     * 
     * Laravel will check if uses HasUuids trait before calling this method.
     * If HasUuids trait exist in this model, it will check if uniqueIds() method exist.
     * If uniqueIds() method exist, it will use the returned array to know
     * which columns are UUIDs and auto-generate them.
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }
    
    /**
     * Get the sale this item belongs to.
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Get the product of this sale item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
