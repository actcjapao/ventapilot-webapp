<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveProductRequest extends FormRequest
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
            'store_id' => ['required', 'integer', 'exists:stores,id'],

            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'brand' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'stock_quantity' => ['required', 'integer', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],

            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
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
           'store_id.required' => 'Store ID is required.',
            'store_id.integer' => 'Store ID must be an integer.',
            'store_id.exists' => 'The specified store does not exist.',

            'name.required' => 'Product name is required.',
            'name.string' => 'Product name must be a string.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'name.regex' => 'Product name can only contain letters and spaces.',

            'brand.string' => 'Brand must be a string.',
            'brand.max' => 'Brand cannot exceed 255 characters.',
            'description.string' => 'Description must be a string.',

            'stock_quantity.required' => 'Stock quantity is required.',
            'stock_quantity.integer' => 'Stock quantity must be an integer.',
            'stock_quantity.min' => 'Stock quantity cannot be negative.',

            'cost_price.required' => 'Cost price is required.',
            'cost_price.numeric' => 'Cost price must be a number.',
            'cost_price.min' => 'Cost price cannot be negative.',

            'selling_price.required' => 'Selling price is required.',
            'selling_price.numeric' => 'Selling price must be a number.',
            'selling_price.min' => 'Selling price cannot be negative.',

            'tags.array' => 'Tags must be an array.',
            'tags.*.string' => 'Each tag must be a string.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
        ];
    }
}
