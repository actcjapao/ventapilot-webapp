<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DebtPayment extends Model
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
     *     'sample_debt_pay' => 'Sample Debt Pay',
     *     'item' => 'xyz', // Not in $fillable, so will be ignored
     * ];
     *
     * Sales::create($data);
     * // Only 'store_id', 'sample_debt_pay', are saved
     * ```
     *
     * @var list<string>
     */
    protected $fillable = [
        'debt_id',
        'amount',
        'paid_at',
        'payment_method',
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
     * Get the debt this debt_item belongs to.
     */
    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }
}
