<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'field_key' => ['required', 'string'],
            'status'    => ['required', 'in:approved,rejected'],
            'reason'    => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
        ];
    }
}
