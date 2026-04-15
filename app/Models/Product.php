<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
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
     *     'name' => 'Sample Product',
     *     'item' => 'xyz', // Not in $fillable, so will be ignored
     * ];
     *
     * Product::create($data);
     * // Only 'store_id', 'name', are saved
     * ```
     *
     * @var list<string>
     */
    protected $fillable = [
        'store_id',
        'name',
        'brand',
        'description',
        'stock_quantity',
        'cost_price',
        'selling_price',
        'tags',
    ];

    // Automatically converts JSON columns to/from PHP arrays
    protected $casts = [
        'tags' => 'array',
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
     * Get the store this product belongs to.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
