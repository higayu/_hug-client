<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * support_records には id カラムがないため、
     * Filament / Eloquent が support_records.id を参照しないようにする。
     *
     * 実DB上の主キーは PRIMARY KEY (child_id, target_date)。
     * ただし Eloquent は複合主キーを標準サポートしていないため、
     * 代表キーとして child_id を指定する。
     */
    protected $primaryKey = 'child_id';

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

    public function getRecordKeyAttribute(): string
    {
        return $this->child_id . '_' . $this->target_date->format('Y-m-d');
    }

    public function getRouteKey(): mixed
    {
        return $this->record_key;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
