<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'course',
        'email',
        'phone'
    ];

    /**
     * Helper to return full name for student. If `name` exists use it,
     * otherwise combine first_name and last_name if present.
     */
    public function getFullNameAttribute()
    {
        if (!empty($this->name)) {
            return $this->name;
        }

        $first = $this->first_name ?? '';
        $last = $this->last_name ?? '';

        return trim($first . ' ' . $last);
    }
}
