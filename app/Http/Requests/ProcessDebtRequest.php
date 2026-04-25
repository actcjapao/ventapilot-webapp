<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessDebtRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // cja: Change this from false to true to allow the request to proceed to validation and controller handling.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array'],
            'items.*.product.uuid' => ['required', 'uuid', 'exists:products,uuid'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom error messages for validation failures.
     * cja: Note: This method is optional and not provided by default.
     * If not defined, Laravel will use default error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {        
        return [
            'customer_name.required' => 'Customer name is required.',
            'customer_name.string' => 'Customer name must be a string.',
            'customer_name.max' => 'Customer name cannot exceed 255 characters.',

            'items.required' => 'Items are required.',
            'items.*.product.uuid.required' => 'Product UUID is required.',
            'items.*.product.uuid.uuid' => 'Product UUID must be a valid UUID.',
            'items.*.product.uuid.exists' => 'The specified product does not exist.',

            'items.*.quantity.required' => 'Quantity is required.',
            'items.*.quantity.integer' => 'Quantity must be an integer.',
            'items.*.quantity.min' => 'Quantity cannot be less than 1.',

            'total_amount.required' => 'Total amount is required.',
            'total_amount.numeric' => 'Total amount must be a number.',
            'total_amount.min' => 'Total amount cannot be negative.',

            'payment_amount.required' => 'Payment amount is required.',
            'payment_amount.numeric' => 'Payment amount must be a number.',
            'payment_amount.min' => 'Payment amount cannot be negative.',

            'due_date.string' => 'Due date must be a string.',
            'due_date.max' => 'Due date cannot exceed 255 characters.',
        ];
    }
}
