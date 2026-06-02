<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Subscription extends Model
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
     *     'user_id' => '1',
     *     'plan' => 'trial',
     *     'expiry_date' => 'date', // Not in $fillable, so will be ignored
     * ];
     *
     * Subscription::create($data);
     * // Only 'user_id', 'plan', are saved
     * ```
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'billing_cycle',
        'trial_start_at',
        'trial_end_at',
        'current_period_start_at',
        'current_period_end_at',
        'next_billing_at',
        'cancel_at_period_end',
        'canceled_at',
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
     * Get the sale items pivot records.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
