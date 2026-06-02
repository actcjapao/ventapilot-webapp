<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('user_id');
            $table->string('plan'); // (trial[default for now], premium)
            $table->string('status'); // trialing, active, past_due, canceled, expired
            $table->string('billing_cycle'); // (monthly[default for now], yearly)

            // For trial period & current billing period fields
            $table->dateTime('trial_start_at')->nullable();
            $table->dateTime('trial_end_at')->nullable();
            $table->dateTime('current_period_start_at')->nullable();
            $table->dateTime('current_period_end_at')->nullable();
            $table->dateTime('next_billing_at')->nullable();

            // For cancellation fields
            $table->boolean('cancel_at_period_end')->default(false);
            $table->dateTime('canceled_at')->nullable();

            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
