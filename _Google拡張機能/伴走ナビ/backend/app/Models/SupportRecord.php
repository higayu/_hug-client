<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'child_id',
    'target_date',
    'user_id',
    'content',
])]
class SupportRecord extends Model
{
    protected $table = 'support_records';

    /**
     * このテーブルは PRIMARY KEY (child_id, target_date) の複合主キー。
     * Eloquentは複合主キーを標準サポートしていないため、
     * Controller側では child_id + target_date で検索して更新する。
     */
    public $incrementing = false;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'child_id' => 'integer',
            'target_date' => 'date:Y-m-d',
            'user_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
