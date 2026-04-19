<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Debt extends Model
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
     *     'sample_debt' => 'Sample Debt',
     *     'item' => 'xyz', // Not in $fillable, so will be ignored
     * ];
     *
     * Sales::create($data);
     * // Only 'store_id', 'sample_debt', are saved
     * ```
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'store_id',
        'customer_name',
        'total_amount',
        'balance_due',
        'due_date',
        'status',
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
     * Get the debt items belong to this debt.
     */
    public function debtItems()
    {
        return $this->hasMany(DebtItem::class);
    }

    /**
     * Get the debt payments for this debt
     */
    public function debtPayments()
    {
        return $this->hasMany(DebtPayment::class);
    }
}
